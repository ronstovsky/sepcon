import common from './utils.common';
let references = new Map();
let keys = {};

const ReferenceMap = {
    add: (val) => {
        if(references.has(val)) {
            return references.get(val);
        }
        else {
            const key = common.buildUid();
            references.set(val, key);
            keys[key] = val;
            return key;
        }
    },
    get: (key) => {
        if(keys[key] !== undefined) {
            return keys[key];
        }
        return null;
    }
};


export default ReferenceMap;