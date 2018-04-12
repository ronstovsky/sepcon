import { TAG_IDENTIFIER, TAG_PROPERTIES, TAG_METHODS } from './../shared/constants';
import mappingChanges from './../shared/utils.mapping.changes';
import common from './../shared/utils.common';

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
        this.selfGlobal = mappingChanges.formatGlobals(globals);
    }
    setRefGlobal() {
        this.refGlobal = mappingChanges.formatGlobals(this.component.state.reference.global);
    }
    checkChanged(data, changed) {
        this.changed = false;
        if(this.definition.changed) {
            this.changed = true;
        }
        else if(Object.keys(this.refGlobal).length > 0 || Object.keys(this.selfGlobal).length > 0) {
            let globalsToCheck = common.clone(this.selfGlobal);
            Object.keys(this.refGlobal).forEach(data => {
                if(!globalsToCheck[data]) {
                    globalsToCheck[data] = [];
                }
                globalsToCheck[data] = globalsToCheck[data].concat(this.refGlobal[data]);
            });
            this.changed =  mappingChanges.isGlobalChanged(globalsToCheck, data, changed);
        }
        return this.changed;
    }
}

class ComponentDefinitionItem {
    constructor(definition) {
        this.definition = definition;
        if(definition.state && definition.state.props && definition.state.props.global) {
            this.global = mappingChanges.formatGlobals(definition.state.props.global);
        }
    }
    checkChanged(data, changed) {
        this.changed = mappingChanges.isGlobalChanged(this.global, data, changed);
        return this.changed;
    }
}

export { ComponentItem };
export { ComponentDefinitionItem };