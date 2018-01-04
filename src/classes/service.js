import common from '../shared/utils.common';

export default class Service {
    constructor(meta, def, root) {
        let definition = def;
        if (meta.extend) {
            definition = common.extend(meta.extend, definition);
        }
        definition = Object.assign({requests: {}, channels: {}}, definition);
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

        this.buildCache();

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
        let promise = this.promises[name][args.join(',')] = new Promise((resolve, reject) => {
            let _args = [resolve, reject].concat(args);
            this.sequencer.startSequence('serviceRequest', [name, args, _args]);
        });
        return promise;
    }

    request(name, args) {
        const cache = this.checkRequestCache(name, args.slice(2)); //need to slice resolve and reject arguments
        if (cache === undefined) {
            this.definition.requests[name].apply(this.scoped, args);
            const _args = args.slice(2);
            this.promises[name][_args.join(',')].then(function() {
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

    buildCache() {
        if (!this.definition.cache) {
            return;
        }
        if (this.definition.cache.requests) {
            Object.keys(this.definition.cache.requests).forEach(key => {
                this.cache.requests[key] = this.buildCacheItem(key, this.definition.cache.requests[key]);
            });
        }
    }

    buildCacheItem(key, config) {
        switch (config.storage) {
            case 'local':
            default:
                // return localStorage.getItem('service-request-'+this.root.hash+'-'+this.id+':'+key);
                break;
        }
        return {};
    }
    checkRequestCache(key, args) {
        const stringifiedArgs = args.join(',');
        if (this.cache.requests[key][stringifiedArgs]) {
            return this.cache.requests[key][stringifiedArgs];
        }
        return undefined;
    }
    setRequestCache(key, args, value) {
        if(this.definition.cache.requests && this.definition.cache.requests[key]) {
            const stringifiedArgs = args.join(',');
            this.cache.requests[key][stringifiedArgs] = value;
        }
    }

    addRoutes() {
        if (this.definition.routes) {
            this.definition.routes.forEach(i => this.root.router.add(i, this.scoped));
        }
    }
}