export default {
mount: {
    send: function(step, hook) {
        if(step.target === 'state') {
            if(hook === 'pre') {
                this.base.state.addRoutes();
            }
        }
        else {
            this.base.updateState();
        }
        return [this.params];
    },
    retrieve: function(step, hook, res) {
        if(step.target === 'component') {
            this.base.onRender(res);
        }
    },
    sequence: [
        {
            target: 'state',
            action: 'mount'
        },
        {
            target: 'component',
            action: 'render'
        },
    ]
},
    localChange: {
        send: function(step, hook) {
            if(step.target === 'state') {
                if(hook === false) {
                    this.base.state.updateLocalProps(this.params);
                    this.base.updateState();
                }
            }
            else {
                this.base.updateState();
            }
            return [this.params];
        },
        retrieve: function(step, hook, res) {
            if(step.target === 'component') {
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
        send: function(step, hook) {
            if(step.target === 'component') {
                this.base.updateState();
            }
            return [this.params];
        },
        retrieve: function(step, hook, res) {
            if(step.target === 'component') {
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
    globalChange: {
        send: function(step, hook) {
            if(step.target === 'state') {
                if(hook === false) {
                    this.base.state.updateGlobalProps();
                    this.base.updateState();
                }
            }
            else {
                this.base.updateState();
            }
            return [this.params];
        },
        retrieve: function(step, hook, res) {
            if(step.target === 'component') {
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
        send: function(step, hook) {
            if(step.target === 'state') {
                if(hook === false) {
                    this.base.state.updateReferencedProps();
                }
            }
            else {
                this.base.updateState();
            }
            return [this.params];
        },
        retrieve: function(step, hook, res) {
            if(step.target === 'component') {
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

    destroy: {
        send: function(step, hook) {
            return [];
        },
        retrieve: function(step, hook, res) {

        },
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

    mountModifier: {
        send: function(step, hook) {
            if(hook === 'pre') {
                this.base.addRoutes();
            }
            return [this.params];
        },
        sequence: [
            {
                target: 'modifier',
                action: 'mount'
            }
        ]
    }
};