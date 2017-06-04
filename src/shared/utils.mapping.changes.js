export default {
    formatGlobals(global) {
        let globals = {};
        if(!global) return globals;

        for(let _prop in global) {
            const prop = global[_prop];
            const data = prop.data; //data
            const key = prop.key || true; //key
            if(!globals[data]) {
                globals[data] = [];
            }
            globals[data].push(key);
        }
        return globals;
    },

    isGlobalChanged(global, data, changed) {
        if(global && global[data]) {
            if(global[data].indexOf(true) >= 0) {
                return true;
            }
            for(let i=0,e=changed.length;i<e;i++) {
                if(global[data].indexOf(changed[i]) >= 0) {
                    return true;
                }
            }
        }
        return false;
    }
};