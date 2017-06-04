import ReferenceMap from './../shared/reference.map.js';
import { TAG_PREFIX, TAG_PROPERTIES, TAG_METHODS, TAG_IDENTIFIER } from './../shared/constants';

export default class ComponentTag {
    constructor(app, tag) {
        this._app = app;
        this._tag = tag;
        this._methods = {};
        this._props = {};
        this._id = null;
        this._html = null;
    }
    html(html) {
        this._html = html;
        return this;
    }
    methods(methods) {
        let formedMethods = {};
        for(let key in methods) {
            const method = methods[key];
            formedMethods[key] = { value: ReferenceMap.add(method) };
        }
        Object.assign(this._methods, formedMethods);
        return this;
    }
    refMethods(methods) {
        let formedMethods = {};
        for(let key in methods) {
            const method = methods[key];
            formedMethods[key] = { reference: method };
        }
        Object.assign(this._methods, formedMethods);
        return this;
    }
    props(properties) {
        let formedProperties = {};
        for(let key in properties) {
            const prop = properties[key];
            formedProperties[key] = { value: ReferenceMap.add(prop) };
        }
        Object.assign(this._props, formedProperties);
        return this;
    }
    refProps(properties) {
        let formedProperties = {};
        for(let key in properties) {
            const prop = properties[key];
            formedProperties[key] = { reference: prop };
        }
        Object.assign(this._props, formedProperties);
        return this;
    }
    id(id) {
        this._id = id;
        return this;
    }
    render(part) {
        let html = '';
        if (!part || part === 'open') {
            //forming the opening tag
            let htmlArray = [];
            htmlArray.push(`${TAG_PREFIX}${this._app.hash ? this._app.hash + '-' : ''}${this._tag}`);
            if (Object.keys(this._props).length > 0) {
                htmlArray.push(`${TAG_PROPERTIES}='${JSON.stringify(this._props)}'`);
            }
            if (Object.keys(this._methods).length > 0) {
                htmlArray.push(`${TAG_METHODS}='${JSON.stringify(this._methods)}'`);
            }
            if (this._id) {
                htmlArray.push(`${TAG_IDENTIFIER}="${this._id}"`);
            }
            html = `<${htmlArray.join(' ')}>`;
        }
        if (!part) {
            //forming the initial innerHTML
            if (this._html) {
                html += this._html;
            }
        }
        if (!part || part === 'close') {
            //forming the closing tag
            html += `</${TAG_PREFIX}${this._app.hash ? this._app.hash + '-' : ''}${this._tag}>`;
        }
        return html;
    }
}