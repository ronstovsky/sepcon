import common from '../shared/utils.common';

export default class {
    constructor(base, config) {
        this.base = base;
        //this.state = comp.state;
        this.config = config;
    }
    startSequence(sequence='mount', params=null) {
        this.params = params;
        this.sequence = sequence;
        this.seq = this.config[sequence];

        let promise = Promise;
        if(this.handleSequenceStep('pre')) {
            promise.resolve().then(()=> {
                if (this.handleSequenceStep(false)) {
                    window.requestAnimationFrame(()=> {
                        this.handleSequenceStep('post');
                    });
                }
            });
        }
    }
    handleSequenceStep(hook) {
        for(let i = 0, e = this.seq.sequence.length; i < e; i++){
            const sequenceStep = this.seq.sequence[i];
            let params = this.getStepParams(sequenceStep, hook);

            let target;
            switch(sequenceStep.target) {
                case 'component':
                case 'modifier':
                    target = this.base.scoped;
                    break;
                case 'state':
                    target = this.base.state.scoped;
                    break;
            }
            //let target = sequenceStep.target === 'state' ? this.state.scoped : this.component.scoped;
            const actionHook = common.hookString(hook, sequenceStep.action);
            if(target[actionHook]) {
                const res = target[actionHook].apply(target, params);
                if(res === false) {
                    return false;
                }
                this.handleStepResponse(sequenceStep, hook, res);
            }
        }
        return true;
    }
    getStepParams(step, hook) {
        if(this.seq.send) {
            return this.seq.send.apply(this, [step, hook]);
        }
        else return this.params;
    }
    handleStepResponse(step, hook, res) {
        if(this.seq.retrieve) {
            return this.seq.retrieve.apply(this, [step, hook, res]);
        }
        else {
            return res;
        }
    }
}