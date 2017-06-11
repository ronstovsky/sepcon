import Root from './root';
import { DATA_CHANGES_AFFECTING } from './shared/constants';
import common from './shared/utils.common';

function create(def, type, defs, cls) {
    let definition = common.clone(def);

    if(defs[definition.id]) {
        this.root.logs.print({
            title: { content: `Tried To Create A Definition With Existing Id`},
            rows: [
                { style: 'label', content: 'Object Type' },
                { style: 'code', content: type },
                { style: 'label', content: 'Definition Id' },
                { style: 'code', content: definition.id },
            ]
        });
        return false;
    }
    else {
        if(definition.extend) {
            if(!defs[definition.extend]) {
                this.root.logs.print({
                    title: { content: `Tried To Extend A Non-Existing Definition`},
                    rows: [
                        { style: 'label', content: 'Object Type' },
                        { style: 'code', content: type},
                        { style: 'label', content: 'Definition Id' },
                        { style: 'code', content: definition.id },
                        { style: 'label', content: 'Extended Id' },
                        { style: 'code', content: definition.extend },
                    ]
                });
            }
            else {
                definition.extend = defs[definition.extend].definition;
            }
        }
        if(definition.decorators) {

            definition.decorators = definition.decorators.filter(dec => {
                if(!defs[dec]) {
                    this.root.logs.print({
                        title: { content: `Tried To Decorate A Definition With a Non-Existing One`},
                        rows: [
                            { style: 'label', content: 'Object Type' },
                            { style: 'code', content: type },
                            { style: 'label', content: 'Definition Id' },
                            { style: 'code', content: definition.id },
                            { style: 'label', content: 'Decorator Id' },
                            { style: 'code', content: dec },
                        ]
                    });
                    return false;
                }
                return true;
            });
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
    }
    modifier(modifier) {
        if (this.root.modifiers[modifier]) {
            return this.root.modifiers[modifier].scoped.methods;
        }
    }
    service(service, provider = null) {
        let services;
        provider = provider || this.root.defaultProvider;
        if(provider && this.root.providers[provider] && this.root.providers[provider].services[service]) {
            services = this.root.providers[provider].services;
        }
        else {
            services = this.root.services;
        }
        if(services[service]) {
            return services[service].scoped.methods;
        }
        return null;
    }
    createData(def) {
        return create.call(this, def, 'data', this.root.datas, this.root.classes.Data);
    }
    createModifier(def) {
        return create.call(this, def, 'modifier', this.root.modifiers, this.root.classes.Modifier);
    }
    createProvider(def) {
        return create.call(this, def, 'provider', this.root.providers, this.root.classes.Provider);
    }
    createService(def) {
        if(def.provider && !this.root.providers[def.provider]) {
            this.root.logs.print({
                title: { content: `Reference to Non-Existing Service Provider`},
                rows: [
                    { style: 'label', content: 'Service Id' },
                    { style: 'code', content: def.id },
                    { style: 'label', content: 'Provider Id' },
                    { style: 'code', content: def.provider },
                ]
            });
            return false;
        }
        return create.call(this, def, 'service', def.provider ? this.root.providers[def.provider].services : this.root.services, this.root.classes.Service);
    }
    createComponent(def) {
        create.call(this, def, 'component', this.root.components, this.root.classes.ComponentDefinition);
        return {
            id: def.id,
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