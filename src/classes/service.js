import common from '../shared/utils.common';

export default class Service {
    constructor(meta, def, root) {
        let definition = def;
        if (meta.extend) {
            definition = common.extend(meta.extend, definition);
        }
        this.definition = definition;
        this.id = meta.id;
        this.root = root;
        this.scoped = common.clone(definition);

        for (let methodName in this.definition.methods) {
            this.scoped.methods[methodName] = function() {
                return new Promise((resolve, reject) => {
                    let args = [resolve, reject].concat([].slice.call(arguments));
                    this.definition.methods[methodName].apply(this.scoped, args);
                });
            }.bind(this);
        }

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