import ComponentDefinition from './component.definition';
import Component from './component';
import ComponentState from './component.state';
import Modifier from './modifier';
import Data from './data';
import ComponentTag from './component.tag';
import Sequencer from './sequencer';
import Router from './router';
import common from './common';
import { ComponentItem, ComponentDefinitionItem } from './component.mapping';

import { DATA_CHANGED, ADD_COMPONENT } from './constants';

import sequencerConfig from './sequencer.config';
import routerConfig from './router.config';

const router = new Router();


export default class Root {
    constructor(app, options) {
        this.classes = {
            ComponentDefinition,
            Component,
            ComponentState,
            Modifier,
            Data,
            ComponentTag,
            Sequencer,
        };

        //globals
        this.components = [];
        this.componentsDefinition = [];
        this.componentElements = [];
        this.router = router;

        //scoped
        this.datas = {};
        this.modifiers = {};
        this.modifiers = {};

        //application closure
        if(app.hash) {
            this.hash = app.hash;
        }

        this.sequencerConfig = common.clone(sequencerConfig);
        this.routerConfig = common.clone(routerConfig);

        this.setConfiguration(options);

        this.router.config(this.routerConfig);
        this.router.listen();
    }

    setConfiguration(config) {
        if(config) {
            if (config.sequencer) {
                this.sequencerConfig = Object.assign(this.sequencerConfig, config.sequencer);
            }
            if (config.router) {
                this.routerConfig = Object.assign(this.routerConfig, config.router);
                this.router.config(this.routerConfig);
            }
        }
    }

    /* application's global functionality */
    executeModifier(modifier, id) {
        const originalArgs = [].slice.call(arguments);
        const passedArgs = originalArgs.slice(2);
        if(this.modifiers[modifier] && this.modifiers[modifier].has(id)) {
            this.modifiers[modifier].stack(id, passedArgs);
        }
        //should execute after current runtime for cases of multiple changes of the same data
        Promise.resolve().then(()=>{
            for(let modifier in this.modifiers) {
                this.modifiers[modifier].execute();
            }
        });

    }
    changedData(data, changed) {
        if(Object.keys(changed).length === 0) return;

        for(let definition in this.componentsDefinition) {
            this.componentsDefinition[definition].checkChanged(data, Object.keys(changed));
        }
        this.componentElements.forEach((item) => {
            if(item.element.component.active) {
                if (item.checkChanged(data, Object.keys(changed))) {
                    item.element.component.onGlobalStateChange(changed);
                }
            }
        });
    }

    addComponentDefinition(component) {
        this.componentsDefinition[component.tag] = new ComponentDefinitionItem(component.definition);
    }

    /**
     * adding new component elements to global array
     * after debounce will itterate
     * @param element
     */
    componentElementAdded() {
        this.componentElements.forEach((componentItem)=> {
            if(!componentItem.element._componentElement.isInitialized) {
                if(componentItem.parent === null) {
                    componentItem.element._componentElement.init();
                }
                else if(componentItem.parent._componentElement &&
                    componentItem.parent._componentElement.isInitialized) {
                    componentItem.element._componentElement.init();
                }
            }
        });
    }

    /**
     * informs the framework about a new component-instance
     * creates unique ID (component-instances array's length)
     * @param component
     * @param element - the component's actual DOM element
     * @param parent - the DOM element's component-parent's DOM element
     * @returns {}
     */
    addComponent(component, element, parent) {
        const componentItem = new ComponentItem(component, element);
        this.componentElements.push(componentItem);

        this.componentElements.forEach((item) => {
            if(componentItem.parent === null && item.element === parent) {
                componentItem.setParent(item);
            }
        });
        if(componentItem.parent !== null) {
            componentItem.parent.addChild(componentItem);
        }
        componentItem.setDefinition(this.componentsDefinition[componentItem.tag.toLowerCase()]);
        return componentItem;
    }
}