export default {
    setChanges(source, map, change, isShallow, path, parent, parentKey) {
        if(!source) {
            source = {};
        }
        if(!map) {
            map = {};
        }
        let changedProps = {};
        for(let prop in map) {
            const isSourceObject = typeof source[prop] === 'object' && source[prop] !== null;
            const isMapObject = typeof map[prop] === 'object' && map[prop] !== null;
            let isDifferent = false;
            if(isSourceObject || isMapObject) {
                const flatSource = source[prop] ? JSON.stringify(source[prop]) : '';
                const flatMap = map[prop] ? JSON.stringify(map[prop]) : '';
                isDifferent = flatSource !== flatMap;
                if(isDifferent) {
                    const propPath = path ? path + '.' + prop : prop;
                    changedProps[propPath] = this.getChangedAsObject(source[prop], map[prop]);

                    let changedObject = this.setChanges(source[prop], map[prop], isSourceObject && change, isShallow, propPath, source, prop);
                    if(Object.keys(changedObject).length > 0) {
                        Object.assign(changedProps, changedObject);
                    }
                }
            }
            else {
                isDifferent = source[prop] != map[prop];
                if(isDifferent) {
                    const propPath = path ? path + '.' + prop : prop;
                    const clonedNewValue = map[prop] ? JSON.parse(JSON.stringify(map[prop])) : map[prop];
                    const clonedOldValue = source[prop] ? JSON.parse(JSON.stringify(source[prop])) : source[prop];
                    changedProps[propPath] = this.getChangedAsObject(clonedOldValue, clonedNewValue);
                }
            }

            if(isDifferent && change){
                if(parent) {
                    if(!parent[parentKey]) {
                        parent[parentKey] = map;
                    }
                    if(isSourceObject) {
                        parent[parentKey][prop] = Object.assign(source[prop], map[prop]);
                    }
                    else {
                        parent[parentKey][prop] = map[prop];
                    }
                }
                else {
                    if(isSourceObject) {
                        Object.assign(source[prop], map[prop]);
                    }
                    else {
                        source[prop] = map[prop];
                    }
                }
            }
        }
        return changedProps;
    },

    getChangedAsObject(oldValue, newValue) {
        return {
            oldValue: typeof oldValue !== 'undefined' ? JSON.parse(JSON.stringify(oldValue)) : null,
            newValue: typeof newValue !== 'undefined' ? JSON.parse(JSON.stringify(newValue)) : null
        };
    }
};