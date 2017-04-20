import SepCon from '../src/index';

let expect = chai.expect;

describe('Component Unit', ()=>{
    let testNum = 0;
    const scope = SepCon.createScope();
    beforeEach(function(){
        testNum++;
    });
    it('should change reference properties if changed at parent', (done) => {
        const child = scope.createComponent({
            id: 'test-'+testNum+'-child',
            component: {
                state: {
                    change(changed) {
                        if (changed.check) {
                            done();
                        }
                    }
                },
                render() {
                    return `check: ${this.props.check}`;
                }
            }
        });
        const parent = scope.createComponent({
            id: 'test-'+testNum+'-parent',
            component: {
                state: {
                    props: {
                        local: {
                            passedProp: 0
                        }
                    },
                    'post:mount'() {
                        this.setProps({passedProp: this.props.local.passedProp + 1}, true);
                    },
                    change() {
                        return false;
                    }
                },
                render() {
                    const childElement = child.createTag()
                        .refProps({check: 'passedProp'});
                    expect(this.props.passedProp).to.be.equal(0);
                    return `passedProp: ${this.props.passedProp} => ${childElement.render()}`;
                }
            }
        });
        let DIV = document.createElement('div');
        DIV.innerHTML = parent.createTag().render();
        document.getElementById('ui-tests').appendChild(DIV);
    });

    it('should execute passed annonymus method', (done) => {
        const child = scope.createComponent({
            id: 'test-'+testNum+'-child',
            component: {
                render() {
                    this.methods.executeCb();
                }
            }
        });
        const parent = scope.createComponent({
            id: 'test-'+testNum+'-parent',
            component: {
                render() {
                    const childElement = child.createTag()
                        .methods({
                            executeCb: done
                        });
                    return childElement.render();
                }
            }
        });
        let DIV = document.createElement('div');
        DIV.innerHTML = parent.createTag().render();
        document.getElementById('ui-tests').appendChild(DIV);
    });

    it('should execute passed state method', (done) => {
        const child = scope.createComponent({
            id: 'test-'+testNum+'-child',
            component: {
                render() {
                    this.methods.executeCb();
                }
            }
        });
        const parent = scope.createComponent({
            id: 'test-'+testNum+'-parent',
            component: {
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
            }
        });
        let DIV = document.createElement('div');
        DIV.innerHTML = parent.createTag().render();
        document.getElementById('ui-tests').appendChild(DIV);
    });

    it('should execute passed annonymus method', (done) => {
        const child = scope.createComponent({
            id: 'test-'+testNum+'-child',
            component: {
                render() {
                    this.methods.executeCb();
                }
            }
        });
        const parent = scope.createComponent({
            id: 'test-'+testNum+'-parent',
            component: {
                render() {
                    const childElement = child.createTag()
                        .methods({
                            executeCb: done
                        });
                    return childElement.render();
                }
            }
        });
        let DIV = document.createElement('div');
        DIV.innerHTML = parent.createTag().render();
        document.getElementById('ui-tests').appendChild(DIV);
    });

    it('should execute passed state method on next() from local override', (done) => {
        const child = scope.createComponent({
            id: 'test-'+testNum+'-child',
            component: {
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
            }
        });
        const parent = scope.createComponent({
            id: 'test-'+testNum+'-parent',
            component: {
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
            }
        });
        let DIV = document.createElement('div');
        DIV.innerHTML = parent.createTag().render();
        document.getElementById('ui-tests').appendChild(DIV);
    });


    it('should update own state on change', (done) => {
        const parent = scope.createComponent({
            id: 'test-'+testNum,
            component: {
                state: {
                    props: {
                        local: {
                            prop: 1
                        }
                    },
                    mount() {
                        this.setProps({prop: 2});
                    }
                },
                render(changed) {
                    if(changed) {
                        console.log('123');
                        expect(this.props.prop).to.be.equal(2);
                        done();
                    }
                }
            }
        });
        let DIV = document.createElement('div');
        DIV.innerHTML = parent.createTag().render();
        document.getElementById('ui-tests').appendChild(DIV);
    });
});