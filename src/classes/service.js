import common from '../shared/utils.common';

export default class Service {
    constructor(def, root) {
        let definition = def.service;
        if (def.extend) {
            definition = common.extend(def.extend, def.service);
            definition.super = def.extend;
        }
        this.definition = definition;
        this.id = def.id;
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

        if(def.provider) {
            this.scoped.provider = this.root.providers[def.provider].scoped;
        }

        this.sequencer = new root.classes.Sequencer(this, root.sequencerConfig);
        this.sequencer.startSequence('mountBase');
    }

    addRoutes() {
        if (this.definition.routes) {
            this.definition.routes.forEach(i => this.root.router.add(i, this.scoped));
        }
    }

    //updateProps(changed) {
    //    for (let prop in changed) {
    //        this.scoped.props[prop] = changed[prop].newValue;
    //    }
    //}
}