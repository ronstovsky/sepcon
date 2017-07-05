import common from '../shared/utils.common';
import changes from '../shared/utils.changes';
import sequencer from './sequencer';
import ReferenceMap from './../shared/reference.map.js';
import {TAG_PROPERTIES, TAG_METHODS} from './../shared/constants';

const defaultSegregation = {
    local: {},
    external: {},
    global: {},
};

/**
 * gives state default values of {
 *      methods: { local: {}, external: {}, global: {} }
 *      props: { local: {}, external: {}, global: {} }
 * }
 * @param state
 * @returns {*}
 * @private
 */
const _defaultState = (state) => {
    const defaultAttributes = {
        methods: {},
        props: {},
    };
    let newState = Object.assign({}, defaultAttributes, state);
    newState.methods = Object.assign({}, defaultSegregation, newState.methods);
    newState.props = Object.assign({}, defaultSegregation, newState.props);
    return newState;
};

/**
 * retrieves object with values derived from global data
 * @param globals - the props.global definition of the original state
 * @param root - to gain access to the global data
 * @returns {} - key-value pairs object
 * @private
 */
const _buildGlobalProps = (globals, root) => {
    let _props = {};
    if (!globals) return {};

    //takes global from datas
    for (let prop in globals) {
        //will need to retrieve the relevant data from datas to the prop

        //will create: arr[0] - data name, arr[1] - data property
        const dataName = globals[prop].data;
        const dataKey = globals[prop].key;

        if (!root.datas[dataName]) {
            root.logs.print({
                title: { content: `Trying To Reach An Undefined Data` },
                rows: [
                    { style: 'label', content: 'Data Id' },
                    { style: 'code', content: dataName },
                ]
            });
            _props[prop] = null;
        }
        else {
            _props[prop] = root.datas[dataName].getProp(dataKey);
        }
    }
    return JSON.parse(JSON.stringify(_props));
};

/**
 * gets a state's segregated methods and returns a given method (by its name) that holds down all chained sequence
 * @param methods[Object] - all segregated state methods
 * @param seg[String] - current segment - 'local'/'external'/'global'
 * @param name[String] - current method name
 * @returns {method}
 */
const chainMethods = (methods, seg, name) => {
    let callStack = [];
    let hasLocal = false;

    switch (seg) {
        case 'global':
            if(methods.global[name]) {
                callStack.push(methods.global[name]);
            }
            /* falls through */
        case 'external':
            if(methods.external[name]) {
                callStack.push(methods.external[name]);
            }
            /* falls through */
        case 'local':
            if(methods.local[name]) {
                hasLocal = true;
                callStack.push(methods.local[name]);
            }
            /* falls through */
    }

    let method = function () {
        let tempCallStack = Object.assign([], callStack);
        let _this = this;
        let args = [].slice.call(arguments);
        let res;

        function next() {
            args = [].slice.call(arguments);
            while (tempCallStack.length > 0) {
                tempCallStack.pop().apply(_this, args);
            }
        }

        if(hasLocal) {
            res = tempCallStack.pop().apply(_this, [next].concat(args));
        }
        else {
            while (tempCallStack.length > 0) {
                tempCallStack.pop().apply(_this, args);
            }
        }
        return res;
    };
    return method;
};

const changeBindedProps = (state, props) => {
    let states = [];
    let statesData = [];
    for (let prop in props) {
        if (state.bindings[prop]) {
            state.bindings[prop].forEach((bindedState) => {
                let stateIndex = states.indexOf(bindedState);
                if(stateIndex === -1) {
                    states.push(bindedState);
                    stateIndex = states.length - 1;
                    statesData[stateIndex] = {};
                }
                statesData[stateIndex][prop] = props[prop];
            });
        }
    }
    states.forEach((state, index) => {
        state.component.onReferenceChange(statesData[index]);
    });
};

/**
 *
 * @param state (will also be used as the meta-data reference, e.g. for global properties and external methods)
 * @param root
 * @returns new component-instance-state{*}
 */
export default class ComponentState {
    constructor(state, component, root) {
        this.root = root;
        this.definition = common.clone(_defaultState(state));
        this.component = component;
        this.scoped = common.clone(this.definition);

        this.buildGlobalMethods();

        this.scoped.setProps = (props, silent) => {
            const changedProps = changes.setChanges(this.scoped.props.local, props, silent, true);
            if (Object.keys(changedProps).length > 0) {
                if (silent) {
                    this.updateLocalProps(changedProps);
                    this.component.updateState();
                    return;
                }
                this.component.onStateChange(changedProps);
            }
        };
        this.scoped.setGlobalProps = (props) => {
            let newGlobalProps = {};
            for(let prop in props) {
                const globalDef = props[prop];
                let isPreviouslyDefined = this.definition.props.global[prop];
                let isInvalidDefinition = globalDef === null || typeof globalDef !== 'object';
                if(isInvalidDefinition && isPreviouslyDefined) {
                    delete this.definition.props.global[prop];
                }
                else if(!isInvalidDefinition) {
                    this.definition.props.global[prop] = newGlobalProps[prop] = props[prop];
                }
            }
            this.component.mapItem.setSelfGlobal(newGlobalProps);
            this.updateGlobalProps();
            this.component.updateState();
        };
        this.scoped.setGlobalMethods = (props) => {
            for(let prop in props) {
                const globalDef = props[prop];
                let isPreviouslyDefined = this.definition.methods.global[prop];
                let isInvalidDefinition = globalDef === null || typeof globalDef !== 'object';
                if(isInvalidDefinition && isPreviouslyDefined) {
                    delete this.definition.methods.global[prop];
                }
                else if(!isInvalidDefinition) {
                    this.definition.methods.global[prop] = props[prop];
                }
                this.buildGlobalMethods();
            }
        };

        this.scoped.getProps = () => this.getProps();
        this.scoped.getMethods = () => this.getMethods();

        this.scoped.router = this.root.router;
        this.scoped.id = this.component.scoped.id;

        this.reference = Object.assign({}, defaultSegregation);
        this.bindings = {};
    }


    /**
     * pass state props to the component instance (without local-external-global segregation)
     * @returns {*}
     */
    getProps() {
        const props = common.clone(this.scoped.props);
        let flatProps = Object.assign({}, props.local, props.external, props.global);
        return flatProps;
    }

    /**
     * pass state methods to the component instance (without local-external-global segregation)
     * on duplications of methodNames in different scopes, will execute all in this order:
     * local.method(); external.method(); global.method();
     * @returns {*}
     */
    getMethods() {
        const methods = common.clone(this.scoped.methods);
        const segs = ['global', 'external' ,'local'];
        let combinedMethods = {};

        for(let i in segs) {
            const seg = segs[i];
            for (let methodName in methods[seg]) {
                if (!combinedMethods[methodName]) {
                    combinedMethods[methodName] = chainMethods(methods, seg, methodName).bind(this.scoped);
                }
            }
        }
        return combinedMethods;
    }

    getGlobalDef() {
        let globals = {};
        if (this.definition.props.global) {
            Object.assign(globals, this.definition.props.global);
        }
        if (this.reference.global) {
            Object.assign(globals, this.reference.global);
        }
        if (Object.keys(globals).length > 0) {
            return JSON.parse(JSON.stringify(globals));
        }
        return null;
    }

    getGlobalStatePropName(data, originalProp) {
        const globals = this.getGlobalDef();
        for (let prop in globals) {
            if ((!globals[prop].key || globals[prop].key === originalProp) && globals[prop].data === data) {
                return prop;
            }
        }
    }

    getGlobalStatePropNames(data, props) {
        let localMap = {};
        for (let prop in props) {
            const localProp = this.getGlobalStatePropName(data, prop);
            if (localProp !== undefined) localMap[localProp] = props[prop];
        }
        return localMap;
    }


    getReferenceStatePropName(originalProp) {
        const segs = ['global', 'external' ,'local'];
        for(let i in segs) {
            const seg = segs[i];
            for (let prop in this.reference[seg]) {
                if (this.reference[seg][prop].key === originalProp) {
                    return prop;
                }
            }
        }
    }

    getReferenceStatePropNames(props) {
        let localMap = {};
        for (let prop in props) {
            const localProp = this.getReferenceStatePropName(prop);
            if (localProp !== undefined) localMap[localProp] = props[prop];
        }
        return localMap;
    }


    updateLocalProps(changed) {
        for (let prop in changed) {
            this.scoped.props.local[prop] = changed[prop].newValue;
        }
        changeBindedProps(this, changed);
    }

    updateReferencedProps() {
        if (!this.reference.parent) return;
        const extractRelevantValue = (refProp) => {
            const parentStateKey = refProp.key;
            let path;
            if(parentStateKey.indexOf('.') >= 0) {
                path = parentStateKey.split('.');
            }
            const state = refProp.state;
            if(path) {
                let statePosition = state;
                while(path.length) {
                    const position = path[0];
                    statePosition = statePosition[position];
                    path.shift();
                }
                return statePosition;
            }
            else {
                return state[parentStateKey];
            }
        };
        let props = {
            global: {},
            external: {},
            local: {},
        };
        props.global = _buildGlobalProps(this.reference.global, this.root);
        for (let prop in this.reference.external) {
            props.external[prop] = extractRelevantValue(this.reference.external[prop]);
        }
        for (let prop in this.reference.local) {
            props.local[prop] = extractRelevantValue(this.reference.local[prop]);

        }
        const flatProps = Object.assign({}, props.local, props.external, props.global);
        Object.assign(this.scoped.props.external, flatProps);
    }

    updateGlobalProps() {
        this.scoped.props.global = _buildGlobalProps(this.definition.props.global, this.root);
        if (this.reference.parent) {
            Object.assign(this.scoped.props.external, _buildGlobalProps(this.reference.global, this.root));
        }
    }

    buildGlobalMethods() {
        for (let methodName in this.definition.methods.global) {
            this.scoped.methods.global[methodName] = function () {
                const originalArgs = [].slice.call(arguments);
                let mergedArgs = [this.definition.methods.global[methodName].modifier, this.definition.methods.global[methodName].key];
                if (this.definition.methods.global[methodName].pass) {
                    const passedArgs = this.definition.methods.global[methodName].pass.apply(this.scoped, originalArgs);
                    mergedArgs = mergedArgs.concat(passedArgs);
                    this.root.executeModifier.apply(this.root, mergedArgs);
                }
                else {
                    mergedArgs = mergedArgs.concat(originalArgs);
                    this.root.executeModifier.apply(this.root, mergedArgs);
                }
            }.bind(this);
        }
    }

    /**
     * sets state external properties and methods
     */
    setExternals() {
        if (this.component.mapItem.external.props || this.component.mapItem.external.methods) { //getting all external properties
            const parentComponent = this.component.parent ? this.component.parent.component : null;
            const parentState = parentComponent ? parentComponent.state : null;

            if(this.component.mapItem.external.props) {
                this.setExternalProperties(this.component.mapItem.external.props, parentState);
            }
            if(this.component.mapItem.external.methods) {
                this.setExternalMethods(this.component.mapItem.external.methods, parentComponent, parentState);
            }
        }
        if (this.component.mapItem.external.html) {
            this.scoped.html = this.component.mapItem.external.html;
        }
        if (this.component.mapItem.external.children) {
            this.scoped.children = this.component.mapItem.external.children;
        }
    }
    setExternalProperties(props, parentState) {
        let externalsProperties = {};
        let externalReferences = {
            global: {},
            external: {},
            local: {},
            parent: parentState
        };
        for (const prop in props) {
            const valueObject = props[prop];
            if (valueObject.reference) {
                this.setExternalReferencedProperty({
                    name: prop,
                    value: props[prop].reference
                }, externalReferences, parentState);
            }
            else {
                this.setExternalProperty({
                    name: prop,
                    value: props[prop].value
                }, externalsProperties);
            }
        }
        this.scoped.props.external = externalsProperties;
        this.reference = externalReferences;
    }
    setExternalProperty(item, externalProperties) {
        externalProperties[item.name] = ReferenceMap.get(item.value);
    }
    setExternalReferencedProperty(item, externalReferences, parentState, passedExternalReference = null) {
        const key = item.name;
        let path = item.value.split('.');
        const stateKey = path[0]; //base property in store
        path.shift();
        path = path.join('.');

        if(!passedExternalReference) {
            passedExternalReference = externalReferences;
        }
        if(!passedExternalReference.parent) {
            return false;
        }

        if (passedExternalReference.parent.reference.global.hasOwnProperty(stateKey)) {
            externalReferences.global[key] = passedExternalReference.parent.reference.global[stateKey];
            if(path) {
                externalReferences.global[key].key += '.' + path;
            }
        }
        else if (passedExternalReference.parent.reference.external.hasOwnProperty(stateKey)) {
            externalReferences.external[key] = passedExternalReference.parent.reference.external[item.value];
        }
        else if (passedExternalReference.parent.reference.local.hasOwnProperty(stateKey)) {
            externalReferences.local[key] = passedExternalReference.parent.reference.local[item.value];
            const bindToRelevantAncestor = (node, prop) => {
                if (!node) {
                    return null;
                }
                if (!node.reference.local[prop]) {
                    if (node.scoped.props.local[prop]) {
                        node.bind(prop, this);
                    }
                    else {
                        bindToRelevantAncestor(node.reference.parent, prop);
                    }
                }
                else {
                    const parentStateKey = node.reference.local[prop].key;
                    if (node.reference.parent.scoped.props.local[parentStateKey]) {
                        node.reference.parent.bind(parentStateKey, this);
                    }
                    else {
                        bindToRelevantAncestor(node.reference.parent, parentStateKey);
                    }
                }
            };
            bindToRelevantAncestor(passedExternalReference.parent, stateKey);
        }
        else if (passedExternalReference.parent.scoped.props.global.hasOwnProperty(stateKey)) {
            externalReferences.global[key] = parentState.getGlobalDef()[stateKey];
            if(path) {
                externalReferences.global[key].key += '.' + path;
            }
        }
        else if (passedExternalReference.parent.scoped.props.external.hasOwnProperty(stateKey)) {
            externalReferences.external[key] = {
                key: item.value,
                state: passedExternalReference.parent.scoped.props.external
            };
        }
        else if (passedExternalReference.parent.scoped.props.local.hasOwnProperty(stateKey)) {
            externalReferences.local[key] = {
                key: item.value,
                state: passedExternalReference.parent.scoped.props.local
            };
            parentState.bind(stateKey, this);
        }
        else {
            this.setExternalReferencedProperty(item, externalReferences, parentState.component.parent.component.state, passedExternalReference.parent.reference);
        }
    }

    setExternalMethods(methods, parentComponent, parentState) {
        let externalMethods = {};

        for (const method in methods) {
            const valueObject = methods[method];
            if (valueObject.reference) {
                this.setExternalReferenceMethod({
                    name: method,
                    value: methods[method]
                }, externalMethods, parentComponent, parentState);
            }
            else {
                this.setExternalMethod({
                    name: method,
                    value: methods[method].value
                }, externalMethods);
            }
        }
        this.scoped.methods.external = Object.assign({}, this.definition.methods.external, externalMethods);
    }
    setExternalMethod(item, externalMethods) {
        externalMethods[item.name] = ReferenceMap.get(item.value);
    }
    setExternalReferenceMethod(item, externalMethods, parentComponent, parentState) {
        const parentMethods = parentState.getMethods();
        let methodParams = item.value;
        if (parentMethods[methodParams.reference]) {
            const methodName = item.name;
            externalMethods[methodName] = function () {
                parentMethods[methodParams.reference].apply(parentComponent, arguments);
            };
        }
    }

    bind(prop, state) {
        if(prop.indexOf('.') >= 0) {
            path = prop.split('.');
            prop = prop[0];
        }
        if(!this.bindings[prop]) {
            this.bindings[prop] = [];
        }
        this.bindings[prop].push(state);
    }

    addRoutes() {
        if (this.definition.routes) {
            this.definition.routes.forEach(i => this.root.router.add(i, this.scoped));
        }
    }

    removeRoutes() {
        if (this.definition.routes) {
            this.root.router.remove(this.scoped);
        }
    }
}