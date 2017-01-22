
export default class Router {
    constructor(config) {
        this.routes = [];
        if(config) {
            this.config(config);
        }
    }
    config(options) {
        if(options.mode && options.mode === 'history' && !!(history.pushState)) {
            this.mode = 'history';
        }
        else {
            this.mode = 'hash';
        }
        if(options.root) {
            this.root = this.clearSlashes(options.root) + '/';
        }
        else {
            this.root = '/';
        }
        return this;
    }
    getFragment() {
        let fragment = '';
        if(this.mode === 'history') {
            fragment = this.clearSlashes(decodeURI(location.pathname + location.search));
            fragment = fragment.replace(/\?(.*)$/, '');
            fragment = this.root != '/' ? fragment.replace(this.root, '') : fragment;
        } else {
            let match = window.location.href.match(/#(.*)$/);
            fragment = match ? match[1] : '';
        }
        return this.clearSlashes(fragment);
    }
    clearSlashes(path) {
        return path.toString().replace(/\/$/, '').replace(/^\//, '');
    }
    add(route, state) {
        route.state = state;
        this.routes.push(route);
        const execute = this.check(null, route);
        this.executeHandlers(execute);
        return this;
    }
    remove(state) {
        for(let i=0; i<this.routes.length; i++) {
            const r = this.routes[i];
            if(r.state === state) {
                this.routes.splice(i, 1);
                return this;
            }
        }
        return this;
    }
    flush() {
        this.routes = [];
        this.mode = null;
        this.root = '/';
        return this;
    }
    check(f, route) {
        function checkRoute(route) {
            let match = fragment.match(route.match);
            if (match) {
                return true;
            }
        }
        let fragment = f || this.getFragment();
        let handlers = [];
        if(route) {
            if(checkRoute(route)) {
                handlers.push(route);
            }
        }
        else {
            for (let i = 0; i < this.routes.length; i++) {
                if(checkRoute(this.routes[i])) {
                    handlers.push(this.routes[i]);
                }
            }
        }
        return handlers;
    }
    executeHandlers(matches) {
        if(matches.length === 0) return;
        for(let i=0, e=matches.length; i<e; i++){
            matches[i].handler.call(matches[i].state);
        }
    }
    listen() {
        let self = this;
        let current = self.getFragment();
        let fn = function() {
            if(current !== self.getFragment()) {
                current = self.getFragment();
                const handlers = self.check(current);
                self.executeHandlers(handlers);
            }
        };
        clearInterval(this.interval);
        this.interval = setInterval(fn, 50);
        return this;
    }
    navigate(path) {
        path = path ? path : '';
        if(this.mode === 'history') {
            history.pushState(null, null, this.root + this.clearSlashes(path));
        } else {
            window.location.href = window.location.href.replace(/#(.*)$/, '') + '#' + path;
        }
        return this;
    }
}