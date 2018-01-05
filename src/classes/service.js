import common from '../shared/utils.common';

export default class Service {
    constructor(meta, def, root) {
        let definition = def;
        if (meta.extend) {
            definition = common.extend(meta.extend, definition);
        }
        definition = Object.assign({
            requests: {},
            channels: {},
            cache: {
                requests: {},
                channels: {}
            }}, definition);

        this.definition = definition;
        this.id = meta.id;
        this.root = root;
        this.scoped = common.clone(definition);
        this.promises = {};
        this.channels = [];
        this.cache = {
            requests: {},
            channels: {}
        };


        Object.keys(this.definition.requests).forEach(key => {
            this.scoped.requests[key] = this.buildRequest.bind(this, key);
            this.promises[key] = {};
            this.cache.requests[key] = {};
        });

        Object.keys(this.definition.channels).forEach(key => {
            this.scoped.channels[key] = this.buildChannel.bind(this, key);
        });

        this.api = {};
        this.api.requests = this.scoped.requests;
        this.api.channels = {};
        Object.keys(this.scoped.channels).forEach(key => {
            this.api.channels[key] = (id, callback) => {
                let channel = this.getValidChannels(key, id, false)[0];
                if (!channel) {
                    channel = {id, callback, key};
                    this.channels.push(channel);
                }
                else {
                    channel.callback = callback;
                }
                Promise.resolve().then(() => {
                    if (this.cache.channels[key] && channel.callback && typeof channel.callback === 'function') {
                        channel.callback(this.cache.channels[key]);
                    }
                });
            };
        });

        this.scoped.router = this.root.router;

        if (meta.provider) {
            this.scoped.provider = this.root.providers[meta.provider].scoped;
        }

        this.sequencer = new root.classes.Sequencer(this, root.sequencerConfig);
        this.sequencer.startSequence('mountBase');
    }

    buildRequest(name) {
        let args = [].slice.call(arguments).slice(1);
        let promise = this.promises[name][this.getArgumentsAsIndex(args)] = new Promise((resolve, reject) => {
            let _args = [resolve, reject].concat(args);
            this.sequencer.startSequence('serviceRequest', [name, args, _args]);
        });
        return promise;
    }

    request(name, args) {
        const cache = this.getRequestCache(name, args.slice(2)); //need to slice resolve and reject arguments
        if (cache === undefined) {
            this.definition.requests[name].apply(this.scoped, args);
            const _args = args.slice(2);
            this.promises[name][this.getArgumentsAsIndex(_args)].then(function () {
                this.setRequestCache(name, _args, [].slice.call(arguments));
            }.bind(this));
        }
        else {
            args[0].apply(null, cache);
        }
    }

    buildChannel(key) {
        let args = [].slice.call(arguments).slice(1);
        this.sequencer.startSequence('serviceChannel', [key, args]);
    }

    channel(key, args) {
        let channelCache = this.cache.channels[key] = this.definition.channels[key].apply(this.scoped, args);
        const subscribers = this.getValidChannels(key);

        subscribers.forEach(sub => {
            sub.callback(channelCache);
        });
    }

    getValidChannels(key, id = false, isType = true) {
        return this.channels.filter(channel => {
            const sameKey = key === channel.key;
            const sameId = id ? id === channel.id : true;
            const isCallbackFunction = isType ? typeof channel.callback === 'function' : true;
            return sameKey && sameId && isCallbackFunction;
        });
    }

    getRequestCache(key, args) {
        if(this.checkIfRequestCacheValid(key)) {
            const config = this.definition.cache.requests[key];
            return this.readCache(config, 'request', key, args);
        }
        return undefined;
    }
    setRequestCache(key, args, value) {
        if(this.checkIfRequestCacheValid(key)) {
            const config = this.definition.cache.requests[key];
            this.writeCache(config, 'request', key, args, value);
        }
    }
    writeCache(config, type, key, args, value) {
        const argsStr = this.getArgumentsAsIndex(args);
        const duration = config.duration || false;
        const storage = config.storage;
        const record = JSON.stringify({
            value,
            ts: Date.now()
        });
        const storageKey = `${this.root.hash || ''}:${this.id}|${type}|${key}[${argsStr}]`;
        switch(storage) {
            default:
            case 'local':
                localStorage.setItem(storageKey, record);
                break;
            case 'session':
                sessionStorage.setItem(storageKey, record);
                break;
            case 'cookie':
                if(duration) {
                    document.cookie = `${storageKey}=${value};expires=${(Date.now() + duration).toGMTString()};path=/`;
                }
                else {
                    document.cookie = `${storageKey}=${value};path=/`;
                }
                break;
            case false:
                this.cache.requests[key][argsStr] = record;
                break;
        }
    }
    readCache(config, type, key, args) {
        const argsStr = this.getArgumentsAsIndex(args);
        const duration = config.duration || false;
        const minTime = duration ? Date.now() - duration : 0;
        const storage = config.storage;
        const storageKey = `${this.root.hash || ''}:${this.id}|${type}|${key}[${argsStr}]`;
        let value;

        switch(storage) {
            default:
            case 'local':
                value = localStorage.getItem(storageKey);
                break;
            case 'session':
                value = sessionStorage.getItem(storageKey);
                break;
            case 'cookie':
                const cookies = document.cookie.split(';').forEach(cookie => {
                    const cookiePair = cookie.split('=');
                    if(cookiePair[0] === storageKey) {
                        value = cookiePair[1];
                        return;
                    }
                });
                break;
            case false:
                value = this.cache.requests[key][argsStr];
                break;
        }

        if(!value) {
            return undefined;
        }
        const record = JSON.parse(value);
        if(record.ts > minTime) {
            return record.value;
        }
        else {
            switch(config.storage) {
                case 'local':
                    localStorage.removeItem('storageKey');
                    break;
                case 'session':
                    sessionStorage.removeItem('storageKey');
                    break;
            }
        }
        return undefined;
    }
    checkIfRequestCacheValid(key) {
        if (!this.definition.cache.requests[key]) {
            return false;
        }
        return true;
    }
    getArgumentsAsIndex(args) {
        return args.map(arg => arg && typeof arg === 'object' ? JSON.stringify(arg) : arg.toString()).join(',');
    }

    addRoutes() {
        if (this.definition.routes) {
            this.definition.routes.forEach(i => this.root.router.add(i, this.scoped));
        }
    }
}