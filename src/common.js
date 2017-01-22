import { TAG_PREFIX, TAG_IDENTIFIER } from './constants';


function getChangedPropsInObject(oldObj, newObj, props = {}, parent = null) {
    for(let prop in newObj) {
        if(typeof oldObj[prop] === 'object' && typeof newObj[prop] === 'object') {
            const isDifferent = JSON.stringify(oldObj[prop]) != JSON.stringify(newObj[prop]);
            if(isDifferent) {
                let base = {};
                base[prop] = [];
                props[prop] = getChangedPropsInObject(oldObj[prop], newObj[prop], base, prop);
            }
        }
        else if(oldObj[prop] != newObj[prop]){
            props[parent].push(prop);
        }
    }
    return props;
}
function getChangedAsObject(key, oldValue, newValue) {
    return {
        [key]: {
            oldValue: typeof oldValue !== 'undefined' ? JSON.parse(JSON.stringify(oldValue)) : null,
            newValue: typeof newValue !== 'undefined' ? JSON.parse(JSON.stringify(newValue)) : null,
        }
    };
}
function getChangedAsObjects(source, map, object, path = '', objects = []) {
    for(let prop in object) {
        Object.assign(objects, getChangedAsObject(path ? path : prop, source[prop], map[prop]));

        path += prop;
        if(object[prop] instanceof Array) {
            for(let i=0, e=object[prop].length; i<e; i++) {
                Object.assign(objects, getChangedAsObject(path + '.' + object[prop][i], source[prop][object[prop][i]], map[prop] && map[prop][object[prop][i]] ? map[prop][object[prop][i]] : null));
            }
        }
        else if(typeof object[prop] === 'object') {
            getChangedAsObjects(source, map, object[prop], path, objects);
        }
    }
    return objects;
}

export default {
    /**
     * get a deep cloned + extended (if 'to' argument is set) object
     * @param from
     * @param to
     * @returns {object}
     */
    clone(from, to) {
        if (from === null || typeof from != "object") return from;
        if (from.constructor != Object && from.constructor != Array) return from;
        if (from.constructor == Date || from.constructor == RegExp || from.constructor == Function ||
            from.constructor == String || from.constructor == Number || from.constructor == Boolean)
            return new from.constructor(from);

        to = to || new from.constructor();

        for (let name in from)
        {
            to[name] = typeof to[name] == 'undefined' ? this.clone(from[name], null) : to[name];
        }

        return to;
    },

    extend(base, extend) {
        let res = this.clone(base);
        for (let i in extend) {
            if (base.hasOwnProperty(i)) {
                if(typeof base[i] === 'object') {
                    res[i] = this.extend(base[i], extend[i]);
                }
                else {
                    res[i] = extend[i];
                }
            }
            else {
                res[i] = extend[i];
            }
        }
        return res;
    },

    /**
     * creates method names for lifecycles ("hook":"action" or "action" if not pre/post)
     * @param hook
     * @param action
     * @returns {string}
     */
    hookString(hook, action){
        return (hook ? `${hook}:` : '') + action;
    },

    /**
     * mutate original data and returns the array of changed properties
     * @param source (object) - original data
     * @param map (object) - new data to compare against 'source'
     * @param change (boolean) - if true - will change the values in 'source' according to 'map'
     * @returns {{}} - map of changed properties in 'source', e.g.:
     * {
     *      someProp: {
     *          oldValue: '1',
     *          newValue: '2'
     *      }
     * }
     */
    setChanges(source, map, change, isShallow) {
        let changedProps = {};
        for(let prop in map) {
            let isDifferent = false;
            const isSourceObject = typeof source[prop] === 'object' && source[prop] !== null;
            const isMapObject = typeof map[prop] === 'object' && map[prop] !== null;
            if(isSourceObject || isMapObject) {
                let base = {};
                base[prop] = [];
                let changedPropsInObject = getChangedPropsInObject(source[prop], map[prop], base, prop);
                isDifferent = Object.keys(changedPropsInObject[prop]).length > 0;
                if (isDifferent) {
                    if(!isShallow) {
                        Object.assign(changedProps, getChangedAsObjects(source, map, changedPropsInObject));
                    }
                    else {
                        const clonedNewValue = map[prop] ? JSON.parse(JSON.stringify(map[prop])) : map[prop];
                        const clonedOldValue = source[prop] ? JSON.parse(JSON.stringify(source[prop])) : source[prop];
                        Object.assign(changedProps, getChangedAsObject(prop, clonedOldValue, clonedNewValue));
                    }
                    if (change) {
                        source[prop] = JSON.parse(JSON.stringify(map[prop]));
                    }
                }
            }
            else {
                if(source[prop] != map[prop]) {
                    const clonedNewValue = map[prop] ? JSON.parse(JSON.stringify(map[prop])) : map[prop];
                    const clonedOldValue = source[prop] ? JSON.parse(JSON.stringify(source[prop])) : source[prop];
                    Object.assign(changedProps, getChangedAsObject(prop, clonedOldValue, clonedNewValue));
                    if(change){
                        source[prop] = clonedNewValue;
                    }
                }
            }
        }
        return changedProps;
    },

    formatValueForValidJSON(obj) {
        if(obj === 0) return 0;
        if(obj === undefined) return null;
        if(typeof obj === 'object') {
            if(obj instanceof Array) {
                for(let i = 0, e = obj.length; i < e; i++) {
                    obj[i] = this.formatValueForValidJSON(obj[i]);
                }
            }
            else {
                for (let key in obj) {
                    obj[key] = this.formatValueForValidJSON(obj[key]);
                }
            }
        }
        return obj;
    },

    //Component Functions
    isInDome(element) {
        let parent = element.parentNode;
        while(parent && parent.tagName.toLowerCase() != 'body') {
            parent = parent.parentNode;
        }
        if(!parent) return false;
        return true;
    },
    isDeepNestedInSameComponent(element) {
        const path = this.getComponentElementsPath(element, true, true);
        for(let i=0, e=path.length-1; i< e; i++) {
            if(path[i] === element.tagName) return true;
        }
        return false;
    },
    getParentComponentElement(element) {
        let child = element;
        let parent;
        do {
            parent = child.parentNode;
            if(!parent) break;
            if(parent._componentElement || parent.tagName.toLowerCase().indexOf(TAG_PREFIX) === 0) {
                return parent;
            }
            child = parent;
        }
        while(parent.tagName.toLowerCase() != 'body');
        return false;
    },
    getComponentElementNameForPath(element) {
        let id = element.getAttribute(TAG_IDENTIFIER) || null;
        if(!id) {
            const siblings = this.getComponentElementSiblings(element);
            const siblingsIndex = this.getComponentElementIndex(element, siblings);
            id = '(' + siblingsIndex + ')';

        }
        return element.tagName + ' ' + id;
    },
    getComponentElementsPath(element, typesOnly, asArray) {
        let child = element;
        let parent;
        let path = [];
        do {
            parent = this.getParentComponentElement(child);
            if(!typesOnly && parent.tagName) {
                 path.push(this.getComponentElementNameForPath(parent));
            }
            else if(parent.tagName) {
                path.push(parent.tagName);
            }
            child = parent;
        }
        while(parent);
        path.reverse();
        if(!typesOnly) {
            path.push(this.getComponentElementNameForPath(element));
        }
        else {
            path.push(element.tagName);
        }
        if(asArray) return path;
        return path.join('>');
    },
    getComponentElementSiblings(element) {
        const parent = this.getParentComponentElement(element);
        let siblings = parent ? Array.from(parent.getElementsByTagName(element.tagName)) : [];
        if(siblings.length > 1) {
            siblings = siblings.filter((node)=> {
                if (node._componentElement && node._componentElement.parent === parent) return true;
                return this.getParentComponentElement(node) === parent;
            });
        }
        return siblings;
    },
    getComponentElementIndex(element, siblings) {
        for(let i=0,e=siblings.length;i<e;i++){
            if(siblings[i]===element) return i;
        }
        return 0;
    },

    getComponent(list, element) {
        if(element.component && element.component.mapItem) return element.component.mapItem;

        const path = element._componentElement.path;

        for(let i=0, e=list.length; i<e; i++) {
            let _item = list[i];
            if(_item &&
                (_item.element === element || _item.path === path)) {
                element.component = _item.element.component;
                _item.setElement(element);
                return _item;
            }
        }
        return false;
    },
    getLooseComponent(list, element) {
        const tagName = element.tagName;
        const id = element.getAttribute(TAG_IDENTIFIER);
        let sameTagList = list.filter((_item)=>_item && _item.tag === tagName);
        let item = null;
        sameTagList.forEach((_item)=>{
            if(!item) {
                const isSameIdentifier = _item.id === id;
                const isSameTag = _item.tag === tagName;
                if (isSameTag && isSameIdentifier) {
                    item = _item;
                }
            }
        });

        if(!id) {
            item = this.getComponent(sameTagList, element);
            //console.groupCollapsed('No use of data-identifier');
            //console.log('PATH:', element._componentElement.path.split('>'));
            //console.info(`
            //    You should use '${TAG_IDENTIFIER}="SOME_ID" if you have several instances of the same component
            //    Otherwise will use dependancy on element index to bind the element to its component class
            //`);
            //console.groupEnd('No use of data-identifier')
        }
        return item;
    }
};