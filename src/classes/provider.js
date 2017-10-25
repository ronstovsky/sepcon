import common from '../shared/utils.common';

export default class Provider {
    constructor(def, root) {
        let definition = def.provider;
        if(def.extend) {
            definition = common.extend(def.extend, def.provider);
        }
        this.definition = definition;
        this.id = def.id;
        this.root = root;
        this.scoped = common.clone(definition);

        this.services = {};

        this.scoped.router = this.root.router;

        this.sequencer = new root.classes.Sequencer(this, root.sequencerConfig);
        this.sequencer.startSequence('mountBase');
    }

    addRoutes() {
        if (this.definition.routes) {
            this.definition.routes.forEach(i => this.root.router.add(i, this.scoped));
        }
    }
}