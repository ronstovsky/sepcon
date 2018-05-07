export default {
    mount: {
        send: function (step, hook) {
            if (step.target === 'state') {
                if (hook === 'pre') {
                    this.base.state.addRoutes();
                }
            }
            else {
                this.base.updateState();
            }
            return [true];
        },
        retrieve: function (step, hook, res) {
            if (step.target === 'component') {
                this.base.onRender(res);
            }
        },
        sequence: [
            {
                target: 'state',
                action: 'mount'
            },
            {
                target: 'state',
                action: 'attach'
            },
            {
                target: 'component',
                action: 'render'
            },
        ]
    },
    resume: {
        send: function (step, hook) {
            if (step.target === 'component') {
                this.base.updateState();
            }
            return [true];
        },
        retrieve: function (step, hook, res) {
            if (step.target === 'component') {
                this.base.onRender(res);
            }
        },
        sequence: [
            {
                target: 'state',
                action: 'attach'
            },
            {
                target: 'component',
                action: 'render'
            },
        ]
    },
    localChange: {
        send: function (step, hook, params) {
            if (step.target === 'state') {
                if (hook === false) {
                    this.base.state.updateLocalProps(params[0]);
                    this.base.updateState();
                }
            }
            else {
                this.base.updateState();
            }
            return params;
        },
        retrieve: function (step, hook, res) {
            if (step.target === 'component') {
                this.base.onRender(res);
            }
        },
        sequence: [
            {
                target: 'state',
                action: 'change'
            },
            {
                target: 'component',
                action: 'render'
            },
        ]
    },
    externalChange: {
        send: function (step, hook, params) {
            if (step.target === 'component') {
                this.base.updateState();
            }
            return params;
        },
        retrieve: function (step, hook, res) {
            if (step.target === 'component') {
                this.base.onRender(res);
            }
        },
        sequence: [
            {
                target: 'state',
                action: 'attach'
            },
            {
                target: 'state',
                action: 'change'
            },
            {
                target: 'component',
                action: 'render'
            },
        ]
    },
    globalChange: {
        send: function (step, hook, params) {
            if (step.target === 'state') {
                if (hook === false) {
                    this.base.state.updateGlobalProps();
                    this.base.updateState();
                }
            }
            else {
                this.base.updateState();
            }
            return params;
        },
        retrieve: function (step, hook, res) {
            if (step.target === 'component') {
                this.base.onRender(res);
            }
        },
        sequence: [
            {
                target: 'state',
                action: 'change'
            },
            {
                target: 'component',
                action: 'render'
            },
        ]
    },
    referenceChange: {
        send: function (step, hook, params) {
            if (step.target === 'state') {
                if (hook === false) {
                    this.base.state.updateReferencedProps();
                    this.base.updateState();
                }
            }
            else {
                this.base.updateState();
            }
            return params;
        },
        retrieve: function (step, hook, res) {
            if (step.target === 'component') {
                this.base.onRender(res);
                if(hook === 'post') {
                    this.base.onDescendantChange();
                }
            }
        },
        sequence: [
            {
                target: 'state',
                action: 'change'
            },
            {
                target: 'component',
                action: 'render'
            },
        ]
    },
    descendantChange: {
        sequence: [
            {
                target: 'component',
                action: 'descendantChange'
            },
        ]
    },

    destroy: {
        sequence: [
            {
                target: 'state',
                action: 'destroy'
            },
            {
                target: 'component',
                action: 'destroy'
            },
        ]
    },

    mountBase: {
        send: function (step, hook, params) {
            if (hook === 'pre') {
                this.base.addRoutes();
            }
            return params;
        },
        sequence: [
            {
                target: 'modifier',
                action: 'mount'
            }
        ]
    },
    globalChangeModifier: {
        sequence: [
            {
                target: 'modifier',
                action: 'change'
            }
        ]
    },
    serviceRequest: {
        send: function (step, hook, params) {
            if (hook === false) {
                this.base.request(params[0], params[2]);
            }
            return params;
        },
        sequence: [
            {
                target: 'base',
                action: 'request'
            },
        ]
    },
    serviceChannel: {
        send: function (step, hook, params) {
            if (hook === false) {
                this.base.channel(params[0], params[1]);
            }
            return params;
        },
        sequence: [
            {
                target: 'base',
                action: 'channel'
            },
        ]
    }
};