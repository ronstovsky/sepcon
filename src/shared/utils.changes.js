export default {
    setChanges(source, map, change, isShallow, path = null) {
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
            if(isSourceObject || isMapObject) {
                const flatSource = source[prop] ? JSON.stringify(source[prop]) : '';
                const flatMap = map[prop] ? JSON.stringify(map[prop]) : '';
                let isDifferent = flatSource !== flatMap;
                if(isDifferent) {
                    const propPath = path ? path + '.' + prop : prop;
                    changedProps[propPath] = this.getChangedAsObject(source[prop], map[prop]);

                    let changedObject = this.setChanges(source[prop], map[prop], change, isShallow, propPath);
                    if(Object.keys(changedObject).length > 0) {
                        Object.assign(changedProps, changedObject);
                    }
                }
            }
            else {
                if(source[prop] != map[prop]) {
                    if(typeof source !== 'object' || source === null) {
                        source = {};
                    }
                    const propPath = path ? path + '.' + prop : prop;
                    const clonedNewValue = map[prop] ? JSON.parse(JSON.stringify(map[prop])) : map[prop];
                    const clonedOldValue = source[prop] ? JSON.parse(JSON.stringify(source[prop])) : source[prop];
                    changedProps[propPath] = this.getChangedAsObject(clonedOldValue, clonedNewValue);
                    if(change){
                        source[prop] = clonedNewValue;
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