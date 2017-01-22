import Root from './root';
import { DATA_CHANGES_AFFECTING } from './constants';
import common from './common';

class SepConClass {
    constructor(options) {
        if(options) {
            this.hash = options.hash;
        }
        this.root = new Root(this, options);
        this.classes = this.root.classes;
        this.setConfiguration = this.root.setConfiguration.bind(this.root);

        this.modify = this.root.executeModifier.bind(this.root);
    }
    createData(id, extend, data) {
        if(typeof id === 'object') {
            const def = id;
            id = def.id;
            data = def.data;
            extend = def.extend;
        }
        else if(typeof extend === 'object') {
            data = extend;
            extend = null;
        }
        if(this.root.datas[id]) {
            console.error(`The data id "${id}" already exists`);
        }
        else {
            if(typeof extend === 'string') {
                extend = this.root.datas[extend].definition;
            }
            this.root.datas[id] = new this.root.classes.Data(data, extend, this.root);
            return this.root.datas[id];
        }
        return false;
    }
    createModifier(id, extend, modifier) {
        if(typeof id === 'object') {
            const def = id;
            id = def.id;
            modifier = def.modifier;
            extend = def.extend;
        }
        else if(typeof extend === 'object') {
            modifier = extend;
            extend = null;
        }
        if(this.root.modifiers[id]) {
            console.error(`The modifier id "${id}" already exists`);
        }
        else {
            if(typeof extend === 'string') {
                extend = this.root.modifiers[extend].definition;
            }
            this.root.modifiers[id] = new this.root.classes.Modifier(modifier, extend, this.root);
            return this.root.modifiers[id];
        }
        return false;
    }
    createComponent(id, extend, component) {
        if(typeof id === 'object') {
            const def = id;
            component = def.component;
            id = def.id;
            extend = def.extend;
        }
        else if(typeof extend === 'object') {
            component = extend;
            extend = null;
        }
        if(this.root.components[id]) {
            console.error(`The component id "${id}" already exists`);
        }
        else {
            if(typeof extend === 'string') {
                extend = this.root.components[extend].definition;
            }
            this.root.components[id] = new this.root.classes.ComponentDefinition(id, component, extend, this.root);
        }
        return {
            createTag: () => this.createTag(id)
        };
    }
    createTag(id) {
        return new this.root.classes.ComponentTag(this, id);
    }
}

const _sepCon = (function sepConHandler() {
    let sepCon = new SepConClass();
    sepCon.createScope = (options = {}) => {
        options.hash = parseInt(Date.now()*1000+Math.round(Math.random()*1000)).toString(36);
        return new SepConClass(options);
    };
    return sepCon;
})();

export { _sepCon as SepCon };
export default _sepCon;