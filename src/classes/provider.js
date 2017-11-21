import common from '../shared/utils.common';

export default class Provider {
    constructor(meta, def, root) {
        let definition = def;
        if(meta.extend) {
            definition = common.extend(meta.extend, definition);
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