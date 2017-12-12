import common from '../shared/utils.common';
import changes from '../shared/utils.changes';

export default class Data {
    constructor(meta, def, root) {
        let definition = def;
        if(meta.extend) {
            definition = common.extend(meta.extend, definition);
        }
        this.definition = common.clone(definition);
        this.id = meta.id;
        this.root = root;
        this.data = common.clone(definition);
    }
    setProps(props) {
        props = common.formatValueForValidJSON(props);
        return changes.setChanges(this.data, props, true);
    }
    resetProps() {
        let props = common.formatValueForValidJSON(this.definition);
        return changes.setChanges(this.data, props, true);
    }
    /**
     * gets an array of keys and returns an object of these keys, populated by corresponding values
     * @param props[Array]
     * @returns {{}} key-value map
     */
    getProps(props) {
        let map = {};
        if(!props) {
            map = common.clone(this.data);
        }
        else {
            for (let i = 0, e = props.length; i < e; i++) {
                map[props[i]] = typeof props[i] === 'object' ? this.getProp(props[i].key, props[i].index) : this.getProp(props[i]);
            }
        }
        return map;
    }
    getProp(prop) {
        let value = this.data;
        if(prop) {
            const props = prop.split('.');
            for (let i = 0, e = props.length; i < e; i++) {
                if (!value || value[props[i]] === undefined) {
                    this.root.logs.print({
                        title: {content: `Could Not Find a Requested Data Property`},
                        rows: [
                            {style: 'label', content: 'Data Id'},
                            {style: 'code', content: this.id},
                            {style: 'label', content: 'Properties Path'},
                            {style: 'code', content: prop},
                            {style: 'label', content: 'Data (snapshot)'},
                            {style: 'code', content: common.clone(this.data)},
                        ]
                    });
                    return null;
                }
                value = value[props[i]];
            }
        }
        switch(typeof value) {
            case 'string': case 'number': return value;
        }
        return JSON.parse(JSON.stringify(value)); //fast clone of an object
    }
}