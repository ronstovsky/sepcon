import common from '../shared/utils.common';

export default class Service {
    constructor(meta, def, root) {
        let definition = def;
        if (meta.extend) {
            definition = common.extend(meta.extend, definition);
        }
        definition = Object.assign({ requests: {}, channels: {} }, definition);
        this.definition = definition;
        this.id = meta.id;
        this.root = root;
        this.scoped = common.clone(definition);

        this.channels = [];
        this.cache = {
            requests: {},
            channels: {}
        };

        for (let methodName in this.definition.requests) {
            this.scoped.requests[methodName] = function() {
                return new Promise((resolve, reject) => {
                    let args = [resolve, reject].concat([].slice.call(arguments));
                    this.definition.requests[methodName].apply(this.scoped, args);
                });
            }.bind(this);
        }

        Object.keys(this.definition.channels).forEach(key => {
            this.scoped.channels[key] = function() {
                this.cache.channels[key] = this.definition.channels[key].apply(this.scoped, arguments);
                this.channels.filter(channel => channel.key === key).forEach(channel => channel.callback(this.cache.channels[key]));
            }.bind(this);
        });

        this.api = {};
        this.api.requests = this.scoped.requests;
        this.api.channels = {};
        Object.keys(this.scoped.channels).forEach(key => {
            this.api.channels[key] = (id, callback) => {
                let channel = this.channels.filter(chn => key === chn.key && id === chn.id);
                channel = channel.length > 0 ? channel[0] : null;
                if(!channel) {
                    channel = {id, callback, key};
                    this.channels.push(channel);
                }
                else {
                    channel.callback = callback;
                }
                Promise.resolve().then(() => {
                    if(this.cache.channels[key] !== undefined && channel && typeof channel.callback === 'function') {
                        channel.callback(this.cache.channels[key]);
                    }
                });
            };
        });

        this.scoped.router = this.root.router;

        if(meta.provider) {
            this.scoped.provider = this.root.providers[meta.provider].scoped;
        }

        this.sequencer = new root.classes.Sequencer(this, root.sequencerConfig);
        this.sequencer.startSequence('mountBase');
    }

    addRoutes() {
        if (this.definition.routes) {
            this.definition.routes.forEach(i => this.root.router.add(i, this.scoped));
        }
    }
}