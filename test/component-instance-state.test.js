import SepCon from '../src/index';

let expect = chai.expect;

describe('Component Unit', ()=>{
    let testNum = 0;
    const scope = SepCon.createScope();
    beforeEach(function(){
        testNum++;
    });
    it('should change reference properties if changed at parent', (done) => {
        const child = scope.createComponent('test-'+testNum+'-child', {
            state: {
                change(changed) {
                    if(changed.check) {
                        done();
                    }
                }
            },
            render() {
                return `check: ${this.props.check}`;
            }
        });
        const parent = scope.createComponent('test-'+testNum+'-parent', {
            state: {
                props: {
                    local: {
                        passedProp: 0
                    }
                },
                'post:mount'() {
                    this.setProps({ passedProp: this.props.local.passedProp + 1 }, true);
                },
                change() {
                    return false;
                }
            },
            render() {
                const childElement = child.createTag()
                    .refProps({ check: 'passedProp' });
                expect(this.props.passedProp).to.be.equal(0);
                return `passedProp: ${this.props.passedProp} => ${childElement.render()}`;
            }
        });
        let DIV = document.createElement('div');
        DIV.innerHTML = parent.createTag().render();
        document.getElementById('ui-tests').appendChild(DIV);
    });

    it('should execute passed annonymus method', (done) => {
        const child = scope.createComponent('test-'+testNum+'-child', {
            render() {
                this.methods.executeCb();
            }
        });
        const parent = scope.createComponent('test-'+testNum+'-parent', {
            render() {
                const childElement = child.createTag()
                    .methods({
                        executeCb: done
                    });
                return childElement.render();
            }
        });
        let DIV = document.createElement('div');
        DIV.innerHTML = parent.createTag().render();
        document.getElementById('ui-tests').appendChild(DIV);
    });

    it('should execute passed state method', (done) => {
        const child = scope.createComponent('test-'+testNum+'-child', {
            render() {
                this.methods.executeCb();
            }
        });
        const parent = scope.createComponent('test-'+testNum+'-parent', {
            state: {
                methods: {
                    local: {
                        executeMe() {
                            done();
                        }
                    }
                }
            },
            render() {
                const childElement = child.createTag()
                    .refMethods({
                        executeCb: 'executeMe'
                    });
                return childElement.render();
            }
        });
        let DIV = document.createElement('div');
        DIV.innerHTML = parent.createTag().render();
        document.getElementById('ui-tests').appendChild(DIV);
    });

    it('should execute passed annonymus method', (done) => {
        const child = scope.createComponent('test-'+testNum+'-child', {
            render() {
                this.methods.executeCb();
            }
        });
        const parent = scope.createComponent('test-'+testNum+'-parent', {
            render() {
                const childElement = child.createTag()
                    .methods({
                        executeCb: done
                    });
                return childElement.render();
            }
        });
        let DIV = document.createElement('div');
        DIV.innerHTML = parent.createTag().render();
        document.getElementById('ui-tests').appendChild(DIV);
    });

    it('should execute passed state method on next() from local override', (done) => {
        const child = scope.createComponent('test-'+testNum+'-child', {
            state: {
                methods: {
                    local: {
                        executeCb(next) {
                            console.log('will pass?');
                            expect(next).to.be.a('function');
                            next();
                        }
                    }
                }
            },
            render() {
                this.methods.executeCb();
            }
        });
        const parent = scope.createComponent('test-'+testNum+'-parent', {
            state: {
                methods: {
                    local: {
                        executeMe() {
                            console.log('yes');
                            done();
                        }
                    }
                }
            },
            render() {
                const childElement = child.createTag()
                    .refMethods({
                        executeCb: 'executeMe'
                    });
                return childElement.render();
            }
        });
        let DIV = document.createElement('div');
        DIV.innerHTML = parent.createTag().render();
        document.getElementById('ui-tests').appendChild(DIV);
    });
});