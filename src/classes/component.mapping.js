import { TAG_IDENTIFIER, TAG_PROPERTIES, TAG_METHODS } from './../shared/constants';

function formatGlobals(global) {
    let globals = {};
    if(!global) return globals;

    for(let _prop in global) {
        const prop = global[_prop];
        const data = prop.data; //data
        const key = prop.key; //key
        if(!globals[data]) {
            globals[data] = [];
        }
        globals[data].push(key);
    }
    return globals;
}
function isGlobalChanged(global, data, changed) {
    if(global && global[data]) {
        for(let i=0,e=changed.length;i<e;i++) {
            if(global[data].indexOf(changed[i]) >= 0) {
                return true;
            }
        }
    }
    return false;
}

class ComponentItem {
    constructor(component, element) {
        this.children = [];
        this.parent = null;
        this.definition = null;
        this.component = component;
        this.selfGlobal = {};
        this.refGlobal = {};

        this.setElement(element);
        this.extractElementData();
    }
    setParent(parent) {
        this.parent = parent;
    }
    addChild(child) {
        this.children.push(child);
    }
    setDefinition(definition) {
        this.definition = definition;
    }
    setElement(element) {
        this.element = element;
        this.id = element.getAttribute(TAG_IDENTIFIER);
        this.tag = element.tagName;
        this.path = element._componentElement.path;
        if(element.component) {
            this.component = element.component;
        }
        this.extractElementData();
    }
    extractElementData() {
        this.external = {
            props: null,
            methods: null,
            html: this.element.originalInnerHTML,
            children: this.element.originalChildren
        };
        const props = this.element.getAttribute(TAG_PROPERTIES);
        const methods = this.element.getAttribute(TAG_METHODS);
        this.external.props = props ? JSON.parse(props) : null;
        this.external.methods = methods ? JSON.parse(methods) : null;
    }
    setSelfGlobal(globals) {
        this.selfGlobal = formatGlobals(globals);
    }
    setRefGlobal() {
        this.refGlobal = formatGlobals(this.component.state.reference.global);
    }
    checkChanged(data, changed) {
        this.changed = false;
        if(this.definition.changed) {
            this.changed = true;
        }
        else if(Object.keys(this.refGlobal).length > 0 || Object.keys(this.selfGlobal).length > 0) {
            const globalsToCheck = Object.assign({}, this.selfGlobal, this.refGlobal);
            this.changed =  isGlobalChanged(globalsToCheck, data, changed);
        }
        return this.changed;
    }
}

class ComponentDefinitionItem {
    constructor(definition) {
        this.definition = definition;
        if(definition.state && definition.state.props && definition.state.props.global) {
            this.global = formatGlobals(definition.state.props.global);
        }
    }
    checkChanged(data, changed) {
        this.changed = isGlobalChanged(this.global, data, changed);
        return this.changed;
    }
}

export { ComponentItem };
export { ComponentDefinitionItem };