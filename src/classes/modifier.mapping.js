import { TAG_IDENTIFIER, TAG_PROPERTIES, TAG_METHODS } from './../shared/constants';
import mappingChanges from './../shared/utils.mapping.changes';

class ModifierItem {
    constructor(modifier) {
        this.modifier = modifier;
        this.definition = modifier.definition;
        if(this.definition.props) {
            this.global = mappingChanges.formatGlobals(this.definition.props);
        }
    }
    checkChanged(data, changed) {
        this.changed = mappingChanges.isGlobalChanged(this.global, data, changed);
        return this.changed;
    }
}

export { ModifierItem };