import common from './common';

export default class Modifier {
    constructor(definition, extend, root) {
        if(extend) {
            definition = common.extend(extend, definition);
            definition.super = extend;
        }
        this.definition = definition;
        this.root = root;
        this.scoped = common.clone(definition);
        this.debounced = {};

        for (let methodName in this.scoped.methods) {
            this.scoped.methods[methodName] = this.scoped.methods[methodName].bind(this.scoped);
        }

        this.scoped.setProps = (data, propsMap) => {
            this.root.changedData(data, this.root.datas[data].setProps(propsMap));
        };
        this.scoped.getProp = (data, prop) => {
            return this.root.datas[data].getProp(prop);
        };
        this.scoped.getProps = (data, propsMap) => {
            return this.root.datas[data].getProps(propsMap);
        };

        this.scoped.router = this.root.router;

        this.sequencer = new root.classes.Sequencer(this, root.sequencerConfig);
        this.sequencer.startSequence('mountModifier');
    }

    //stacking all modifier requests to debounce them
    stack(method, params) {
        this.debounced[method] = params;
    }
    //execution will iterate over all stacked calls
    execute() {
        for(let method in this.debounced) {
            this.scoped.methods[method].apply(this.scoped, this.debounced[method]);
        }
        this.debounced = {};
    }
    has(id) {
        return !!this.scoped.methods[id];
    }

    addRoutes() {
        if (this.definition.routes) {
            this.definition.routes.forEach(i => this.root.router.add(i, this.scoped));
        }
    }
}