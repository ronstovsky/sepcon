import Root from './root';
import { DATA_CHANGES_AFFECTING } from './constants';
import common from './common';

function create(def, type, defs, cls) {
    let definition = common.clone(def);

    if(defs[definition.id]) {
        console.error(`The ${type} id "${definition.id}" already exists`);
        return false;
    }
    else {
        if(definition.extend) {
            definition.extend = defs[definition.extend].definition;
        }
        if(definition.decorators) {
            definition.decorators = definition.decorators.map(dec => common.clone(defs[dec].definition));
        }
        defs[definition.id] = new cls(definition, this.root);
    }
    return defs[definition.id];
}

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
    createData(def) {
        return create.call(this, def, 'data', this.root.datas, this.root.classes.Data);
    }
    createModifier(def) {
        return create.call(this, def, 'modifier', this.root.modifiers, this.root.classes.Modifier);
    }
    createComponent(def) {
        create.call(this, def, 'component', this.root.components, this.root.classes.ComponentDefinition);
        return {
            createTag: () => this.createTag(def.id)
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