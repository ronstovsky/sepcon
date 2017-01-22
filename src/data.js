import common from './common';

export default class Data {
    constructor(definition, extend, root) {
        if(extend) {
            definition = common.extend(extend, definition);
        }
        this.definition = definition;
        this.data = definition;
    }
    setProps(props) {
        props = common.formatValueForValidJSON(props);
        return common.setChanges(this.data, props, true);
    }
    /**
     * gets an array of keys and returns an object of these keys, populated by corresponding values
     * @param props[Array]
     * @returns {{}} key-value map
     */
    getProps(props) {
        let map = {};
        for(let i=0,e=props.length;i<e;i++){
            map[props[i]] = typeof props[i] === 'object' ? this.getProp(props[i].key, props[i].index) : this.getProp(props[i]);
        }
        return map;
    }
    getProp(prop) {
        const props = prop.split('.');
        let value = this.data;
        for(let i=0,e=props.length;i<e;i++){
            value = value[props[i]];
        }
        switch(typeof value) {
            case 'string': case 'number': return value;
        }
        return JSON.parse(JSON.stringify(value)); //fast clone of an object
    }
}