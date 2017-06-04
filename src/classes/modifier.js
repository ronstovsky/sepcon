import common from '../shared/utils.common';


export default class Modifier {
    constructor(def, root) {
        let definition = def.modifier;
        if(def.extend) {
            definition = common.extend(def.extend, def.modifier);
            definition.super = def.extend;
        }
        this.definition = definition;
        this.id = def.id;
        this.root = root;
        this.scoped = common.clone(definition);

        this.timer = null;
        this.collectedDataChanges = {};

        for (let methodName in this.scoped.methods) {
            this.scoped.methods[methodName] = this.scoped.methods[methodName].bind(this.scoped);
        }


        this.scoped.resetProps = (data) => {
            this.root.changedData(data, this.root.datas[data].resetProps());
        };
        this.scoped.setProps = (data, propsMap) => {
            const props = common.clone(propsMap);
            this.root.changedData(data, this.root.datas[data].setProps(props));
        };
        this.scoped.getProp = (data, prop) => {
            return this.root.datas[data].getProp(prop);
        };
        this.scoped.getProps = (data, propsMap) => {
            return this.root.datas[data].getProps(propsMap);
        };

        this.scoped.modify = this.root.executeModifier.bind(this.root);

        this.scoped.router = this.root.router;

        this.mapItem = this.root.addModifier(this);

        this.sequencer = new root.classes.Sequencer(this, root.sequencerConfig);
        this.sequencer.startSequence('mountModifier');
    }

    execute(method, params) {
        return this.scoped.methods[method].apply(this.scoped, params);
    }
    has(id) {
        return !!this.scoped.methods[id];
    }

    addRoutes() {
        if (this.definition.routes) {
            this.definition.routes.forEach(i => this.root.router.add(i, this.scoped));
        }
    }

    getGlobalStatePropName(data, originalProp) {
        const globals = this.definition.props;
        for (let prop in globals) {
            if (globals[prop].key === originalProp && globals[prop].data === data) {
                return prop;
            }
        }
        return false;
    }
    getGlobalStatePropNames(data, props) {
        let localMap = {};
        for (let prop in props) {
            const localProp = this.getGlobalStatePropName(data, prop);
            if (localProp) {
                localMap[localProp] = props[prop];
            }
        }
        return localMap;
    }
    onGlobalStateChange(data, changed) {
        const localChanged = this.getGlobalStatePropNames(data, changed);
        Object.assign(this.collectedDataChanges, localChanged);
        clearTimeout(this.timer);
        this.timer = setTimeout(()=>{
            this.debounceGlobalStateChange();
        }, 10);
    }

    debounceGlobalStateChange() {
        this.timer = null;
        this.sequencer.startSequence('globalChangeModifier', [this.collectedDataChanges]);
        this.collectedDataChanges = {};
    }
}