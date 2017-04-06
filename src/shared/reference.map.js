let references = new Map();
let keys = {};

const ReferenceMap = {
    add: (val) => {
        if(references.has(val)) {
            return references.get(val);
        }
        else {
            const key = parseInt(Date.now()*1000+Math.round(Math.random()*1000)).toString(36);
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