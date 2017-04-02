import common from './common';
import 'document-register-element';
import { TAG_PREFIX, ADD_COMPONENT_DEFINITION } from './constants';


//defining the component and registering its element
export default class ComponentDefinition {
    constructor(def, root) {
        let definition = def.component;
        if(def.extend) {
            definition = common.extend(def.extend, def.component);
            definition.super = def.extend;
            definition.state.super = def.extend.state;
        }
        this.definition = definition;
        this.root = root;
        this.tag = TAG_PREFIX + (this.root.hash ? this.root.hash+'-' : '') + def.id;

        if(def.decorators && def.decorators.length && def.decorators.length > 0) {
            def.decorators.forEach(this.addDecorator.bind(this));
        }

        this.root.addComponentDefinition(this);
        this.registerElement();
        return this;
    }

    addDecorator(decorator) {
        if(decorator.state) {
            if(!this.definition.state) {
                this.definition.state = {};
            }
            this.addDecoratorToState(decorator);
        }
        this.addDecoratorToComponent(decorator);
    }
    addDecoratorToState(decorator) {
        const segs = ['local', 'external', 'global'];
        if(decorator.state.props) {
            segs.forEach(seg => {
                if(decorator.state.props[seg]) {
                    this.addToStateSegregation(decorator.state.props[seg], 'props', seg);
                }
            });
            decorator.state.props = null;
        }
        if(decorator.state.methods) {
            if(!this.definition.state.methods) {
                this.definition.state.methods = {};
            }
            segs.forEach(seg => {
                if(decorator.state.methods[seg]) {
                    this.addToStateSegregation(decorator.state.methods[seg], 'methods', seg);
                }
            });
            decorator.state.methods = null;
        }
        if(decorator.state.routes) {
            this.addToStateRoutes(decorator.state.routes);
            decorator.state.routes = null;
        }
        this.addToState(decorator.state);
        decorator.state = null;
    }
    addToStateSegregation(map, key, seg) {
        if(!this.definition.state[key]) {
            this.definition.state[key] = {};
        }
        if(!this.definition.state[key][seg]) {
            this.definition.state[key][seg] = {};
        }
        for(let prop in map) {
            if(!this.definition.state[key][seg][prop]) {
                this.definition.state[key][seg][prop] = map[prop];
            }
            else if(key === 'methods' && (seg === 'local' || seg === 'eternal')) {
                this.definition.state[key][seg][prop] = common.concatMethods(map[prop], this.definition.state[key][seg][prop]);
            }
        }
    }
    addToStateRoutes(routes) {
        if(!this.definition.state.routes || this.definition.state.routes.length === 0) {
            this.definition.state.routes = routes;
        }
        else {
            this.definition.state.routes = this.definition.state.routes.concat(routes);
        }
    }
    addToState(map) {
        for(let prop in map) {
            if(!this.definition.state[prop]) {
                this.definition.state[prop] = map[prop];
            }
            else {
                if(typeof map[prop] === 'function') {
                    this.definition.state[prop] = common.concatMethods(map[prop], this.definition.state[prop]);
                }
            }
        }
    }

    addDecoratorToComponent(map) {
        for(let prop in map) {
            if(!this.definition[prop]) {
                this.definition[prop] = map[prop];
            }
            else {
                if(typeof map[prop] === 'function') {
                    this.definition[prop] = common.concatMethods(map[prop], this.definition[prop]);
                }
            }
        }
    }


    //registering a new element to the DOM
    registerElement() {
        const component = this;
        const root = this.root;
        //if no native support on browser
        if (typeof HTMLElement !== 'function'){
            let _HTMLElement = function(){};
            _HTMLElement.prototype = HTMLElement.prototype;
            HTMLElement = _HTMLElement;
        }


        class HTMLComponent extends HTMLElement {
            /**
             * triggered when element is placed in DOM
             * @constructor
             */
            connectedCallback() {
                let coll = this.children;
                let i = coll.length;
                let n = i - 1 >> 0;
                let childrenArr = [];
                while (i--) {
                    childrenArr[n--] = coll[i];
                }

                this.originalChildren = childrenArr;
                this.originalInnerHTML = this.innerHTML;
                this.innerHTML = '';

                Promise.resolve().then(()=>{
                    if(!common.isInDome(this)) return false;
                    if(common.isDeepNestedInSameComponent(this)) {
                        console.error('components cannot be nested inside themselved', common.getComponentElementsPath(this, true, true), this);
                        return false;
                    }
                    const parent = common.getParentComponentElement(this);
                    this._componentElement = {
                        isInitialized: false,
                        path: common.getComponentElementsPath(this),

                        /**
                         * initialize binding of the element to its component.
                         * if such exists - will bind it (if needed) and trigger its 'resume' method
                         * if not - will bind a new instance and trigger its 'initialize' method
                         */
                        init: () => {
                            if(!common.isInDome(this)) {
                                this.component = false;
                                return;
                            }

                            //const parent = common.getParentComponentElement(this);
                            //this._componentElement.parent = parent;

                            let parentComponent = false;
                            if(!this.component && parent) {
                                parentComponent = common.getComponent(root.componentElements, parent);
                                let thisComponent = parentComponent ? common.getLooseComponent(parentComponent.children, this) : false;
                                if(thisComponent) {
                                    this.component = thisComponent.component;
                                }
                            }

                            if (this.component) {
                                this.component.resume(this);
                            }
                            else {
                                this.component = new root.classes.Component(component.definition, root, this, parentComponent, parent);
                                this.component.initialize();
                            }
                            this._componentElement.isInitialized = true;
                        },
                    };
                    if(parent) {
                        const parentHasComponentElement = parent._componentElement;
                        const parentComponentElementIsInitialized = parentHasComponentElement ? parentHasComponentElement.isInitialized : false;
                        if(parentHasComponentElement && parentComponentElementIsInitialized) {
                            this._componentElement.init();
                        }
                    }
                    else {
                        this._componentElement.init();
                    }
                    root.componentElementAdded(this);
                });
            }
            disconnectedCallback() {
                //root.removeComponentInstance(this.component.id);
                if(this.component) {
                    this.component.onDestroy();
                }
            }
            attributeChangedCallback() {
            }
        }
        customElements.define(this.tag, HTMLComponent);
    }
}