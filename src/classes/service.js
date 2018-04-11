import common from '../shared/utils.common';

export default class Service {
    constructor(meta, def, root) {
        let definition = def;
        if (meta.extend) {
            definition = common.extend(meta.extend, definition);
        }
        definition = Object.assign({
            requests: {},
            channels: {}
        }, definition);
        definition.cache = Object.assign({
            requests: {},
            channels: {}
        }, definition.cache);

        this.definition = definition;
        this.id = meta.id;
        this.root = root;
        this.scoped = common.clone(definition);
        this.promises = {};
        this.subscribes = [];
        this.channelsLastCache = {};
        this.cache = {
            requests: {},
            channels: {}
        };

        this.formatCacheDefinitions('requests');
        this.formatCacheDefinitions('channels');

        Object.keys(this.definition.requests).forEach(key => {
            this.scoped.requests[key] = this.buildRequest.bind(this, key);
            this.promises[key] = {};
            this.cache.requests[key] = {};
        });

        Object.keys(this.definition.channels).forEach(key => {
            this.scoped.channels[key] = this.buildChannel.bind(this, key);
            this.cache.channels[key] = {};
        });

        this.scoped.clearCache = (type, key, args) => {
            if(!type) {
                this.clearAllCacheOf('requests');
                this.clearAllCacheOf('channels');
            }
            else if(!key) {
                this.clearAllCacheOf(type);
            }
            else if(!this.definition.cache[type] || !this.definition.cache[type][key]) {
                return;
            }
            else {
                this.clearCache(this.definition.cache[type][key], type, key, args);
            }
        };
        this.scoped.getCache = (type, key, args) => {
            if(!this.definition.cache[type] || !this.definition.cache[type][key]) {
                return;
            }
            return this.getCache(this.definition.cache[type][key], type, key, args);
        };

        this.api = {};
        this.api.requests = this.scoped.requests;
        this.api.channels = {};
        Object.keys(this.scoped.channels).forEach(key => {
            this.api.channels[key] = (id, callback) => {
                let channel = this.getValidSubscribers(key, id, false)[0];
                if (!channel) {
                    channel = {id, callback, key};
                    this.subscribes.push(channel);
                }
                else {
                    channel.callback = callback;
                }

                //on subscribe - will have a callback invoked if that channel was active prior to the subscribe
                Promise.resolve().then(() => {
                    const lastMessageFromChannel = this.channelsLastCache[key];
                    if (lastMessageFromChannel && channel.callback && typeof channel.callback === 'function') {
                        channel.callback.apply(null, lastMessageFromChannel);
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

    formatCacheDefinitions(type) {
        Object.keys(this.definition.cache[type]).forEach(key => {
            if(this.definition.cache[type][key] === true) {
                this.definition.cache[type][key] = {};
            }
        });
    }

    clearAllCacheOf(type) {
        Object.keys(this.definition.cache[type]).forEach(key => {
            this.clearCache(this.definition.cache[type][key], type, key);
        });
    }

    getCache(config, type, key, args = []) {
        return this.readCache(config, type, key, args);
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

    checkIfRequestCacheValid(key) {
        if (!this.definition.cache.requests[key]) {
            return false;
        }
        return true;
    }

    getRequestCache(key, args) {
        if (this.checkIfRequestCacheValid(key)) {
            const config = this.definition.cache.requests[key];
            return this.readCache(config, 'requests', key, args);
        }
        return undefined;
    }

    setRequestCache(key, args, value) {
        if (this.checkIfRequestCacheValid(key)) {
            const config = this.definition.cache.requests[key];
            this.writeCache(config, 'requests', key, args, value);
        }
    }

    buildChannel(key) {
        let args = [].slice.call(arguments).slice(1);
        this.sequencer.startSequence('serviceChannel', [key, args]);
    }
    channel(key, args) {
        let value = this.getChannelCache(key, args); //need to slice resolve and reject arguments
        const subscribers = this.getValidSubscribers(key);
        if (value === undefined) {
            value = [].concat(this.definition.channels[key].apply(this.scoped, args));
            this.setChannelCache(key, args, value);
        }
        subscribers.forEach(sub => {
            sub.callback.apply(null, value);
        });
    }
    getValidSubscribers(key, id = false, isType = true) {
        return this.subscribes.filter(channel => {
            const sameKey = key === channel.key;
            const sameId = id ? id === channel.id : true;
            const isCallbackFunction = isType ? typeof channel.callback === 'function' : true;
            return sameKey && sameId && isCallbackFunction;
        });
    }
    checkIfChannelCacheValid(key) {
        if (!this.definition.cache.channels[key]) {
            return false;
        }
        return true;
    }
    getChannelCache(key, args) {
        if (this.checkIfChannelCacheValid(key)) {
            const config = this.definition.cache.channels[key];
            return this.readCache(config, 'channels', key, args);
        }
        return undefined;
    }
    setChannelCache(key, args, value) {
        if (this.checkIfChannelCacheValid(key)) {
            const config = this.definition.cache.channels[key];
            this.writeCache(config, 'channels', key, args, value);
        }
        this.channelsLastCache[key] = value;
    }


    writeCache(config, type, key, args, value) {
        const updateRecord = (json, args, record) => {
            const records = json ? JSON.parse(json) : {};
            records[args] = record;
            return JSON.stringify(records);
        };
        const argsStr = this.getArgumentsAsIndex(args);
        const duration = config.duration || false;
        const storage = config.storage;
        const record = {
            value,
            ts: Date.now()
        };
        const storageKey = this.getStorageKey(type, key);
        let recordsJson;
        switch (storage) {
            default:
            case 'local':
                recordsJson = localStorage.getItem(storageKey);
                recordsJson = updateRecord(recordsJson, argsStr, record);
                localStorage.setItem(storageKey, recordsJson);
                break;
            case 'session':
                recordsJson = sessionStorage.getItem(storageKey);
                recordsJson = updateRecord(recordsJson, argsStr, record);
                sessionStorage.setItem(storageKey, recordsJson);
                break;
            case 'cookie':
                recordsJson = common.getCookie(storageKey);
                recordsJson = updateRecord(recordsJson, argsStr, record);
                common.setCookie(storageKey, recordsJson);
                document.cookie = `${storageKey}=${value};path=/`;
                break;
            case false:
                this.cache[type][key][argsStr] = record;
                break;
        }
    }

    readCache(config, type, key, args) {
        const argsStr = this.getArgumentsAsIndex(args);
        const minTime = config.duration ? Date.now() - parseInt(config.duration) : 0;
        const storageKey = this.getStorageKey(type, key);
        let records;
        let record;
        let recordsJson;

        switch (config.storage) {
            default:
            case 'local':
                records = JSON.parse(localStorage.getItem(storageKey));
                break;
            case 'session':
                records = JSON.parse(sessionStorage.getItem(storageKey));
                break;
            case 'cookie':
                records = JSON.parse(common.getCookie(storageKey));
                break;
            case false:
                records = this.cache[type][key];
                break;
        }
        if (!records) {
            return undefined;
        }

        record = records[argsStr];
        if (!record) {
            return undefined;
        }
        if (record.ts > minTime) {
            return record.value;
        }
        else {
            delete records[argsStr];
            recordsJson = JSON.stringify(records);
            switch (config.storage) {
                case 'local':
                    localStorage.setItem(storageKey, recordsJson);
                    break;
                case 'session':
                    sessionStorage.setItem(storageKey, recordsJson);
                    break;
                case 'cookie':
                    common.setCookie(storageKey, recordsJson);
                    break;
                case false:
                    this.cache[type][key][argsStr] = false;
                    break;
            }
        }
        return undefined;
    }

    clearCache(config, type, key, args) {
        let records;
        let recordsJson;
        const storageKey = this.getStorageKey(type, key);

        switch (config.storage) {
            default:
            case 'local':
                records = JSON.parse(localStorage.getItem(storageKey));
                break;
            case 'session':
                records = JSON.parse(sessionStorage.getItem(storageKey));
                break;
            case 'cookie':
                records = JSON.parse(common.getCookie(storageKey));
                break;
            case false:
                records = this.cache[type][key];
                break;
        }
        if (args) {
            const argsStr = this.getArgumentsAsIndex(args);
            delete records[argsStr];
        }
        else {
            records = {};
        }
        recordsJson = JSON.stringify(records);
        switch (config.storage) {
            case 'local':
                localStorage.setItem(storageKey, recordsJson);
                break;
            case 'session':
                sessionStorage.setItem(storageKey, recordsJson);
                break;
            case 'cookie':
                common.setCookie(storageKey, recordsJson);
                break;
            case false:
                this.cache[type][key] = records;
                break;
        }
    }

    getStorageKey(type, key) {
        return `${this.root.hash || ''}:${this.id}|${type}|${key}`;
    }

    getArgumentsAsIndex(args) {
        return args
            .map(arg => arg && typeof arg === 'object' ? JSON.stringify(arg) : arg ? arg.toString() : '')
            .filter(arg => !!arg)
            .join(',');
    }

    addRoutes() {
        if (this.definition.routes) {
            this.definition.routes.forEach(i => this.root.router.add(i, this.scoped));
        }
    }
}