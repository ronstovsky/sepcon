import common from './common';
import 'document-register-element';
import { TAG_PREFIX, ADD_COMPONENT_DEFINITION } from './constants';


//defining the component and registering its element
export default class ComponentDefinition {
    constructor(tag, definition, extend, root) {
        if(extend) {
            definition = common.extend(extend, definition);
            definition.super = extend;
            definition.state.super = extend.state;
        }
        this.root = root;
        this.tag = TAG_PREFIX + (this.root.hash ? this.root.hash+'-' : '') + tag;
        this.definition = definition;

        this.root.addComponentDefinition(this);
        this.registerElement();
        return this;
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
                        //parent,

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