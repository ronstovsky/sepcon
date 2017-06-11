import common from '../shared/utils.common';

export default class Provider {
    constructor(def, root) {
        let definition = def.provider;
        if(def.extend) {
            definition = common.extend(def.extend, def.provider);
            definition.super = def.extend;
        }
        this.definition = definition;
        this.id = def.id;
        this.root = root;
        this.scoped = common.clone(definition);

        this.services = {};


        //for (let methodName in this.scoped.methods) {
        //    this.scoped.methods[methodName] = this.scoped.methods[methodName].bind(this.scoped);
        //}
        //
        //this.scoped.setProps = (props, silent) => {
        //    const changedProps = changes.setChanges(this.scoped.props, props, silent, true);
        //    if (Object.keys(changedProps).length > 0) {
        //        if (silent) {
        //            this.updateProps(changedProps);
        //            this.component.updateState();
        //            return;
        //        }
        //        this.component.onStateChange(changedProps);
        //    }
        //};
        //this.scoped.getProps = () => {
        //    return common.clone(this.scoped.props);
        //};

        this.scoped.router = this.root.router;

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