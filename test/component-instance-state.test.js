import SepCon from '../src/index';

let expect = chai.expect;

describe('Component Unit', ()=> {
    let testNum = 0;
    const scope = SepCon.createScope();
    beforeEach(function () {
        testNum++;
    });
    it('should change reference properties if changed at parent', (done) => {
        const child = scope.createComponent({
            id: 'test-' + testNum + '-child',
        }, {
            state: {
                change(changed) {
                    if (changed.check) {
                        expect(changed.check.newValue).to.be.equal(1);
                        done();
                    }
                }
            }
        });
        const parent = scope.createComponent({
            id: 'test-' + testNum + '-parent',
        }, {
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
            view: {
                render() {
                    const childElement = child.createTag()
                        .refProps({check: 'passedProp'});
                    expect(this.props.passedProp).to.be.equal(0);
                    return childElement.render();
                }
            }
        });
        let DIV = document.createElement('div');
        DIV.innerHTML = parent.createTag().render();
        document.getElementById('ui-tests').appendChild(DIV);
    });

    it('should change reference properties if changed at parent - also for "sub" properties', (done) => {
        const child = scope.createComponent({
            id: 'test-' + testNum + '-child',
        }, {
            state: {
                change(changed) {
                    if (changed.check) {
                        expect(changed.check.newValue).to.be.equal(1);
                        done();
                    }
                }
            }
        });
        const parent = scope.createComponent({
            id: 'test-' + testNum + '-parent',
        }, {
            state: {
                props: {
                    local: {
                        mainObj: {
                            passedProp: 0
                        }
                    }
                },
                'post:mount'() {
                    let mainObj = {
                        passedProp: this.props.local.mainObj.passedProp + 1
                    };
                    this.setProps({mainObj}, true);
                },
                change() {
                    return false;
                }
            },
            view: {
                render() {
                    const childElement = child.createTag()
                        .refProps({check: 'mainObj.passedProp'});
                    expect(this.props.mainObj.passedProp).to.be.equal(0);
                    return childElement.render();
                }
            }
        });
        let DIV = document.createElement('div');
        DIV.innerHTML = parent.createTag().render();
        document.getElementById('ui-tests').appendChild(DIV);
    });

    it('should change reference properties if changed at grandparent - "sub"/normal properties as well', (done) => {
        const child = scope.createComponent({
            id: 'test-' + testNum + '-child',
        }, {
            state: {
                change(changed) {
                    if (changed.checkChild1) {
                        expect(changed.checkChild1.newValue).to.be.equal(1);
                        expect(changed.checkChild2.newValue).to.be.equal('b');
                        done();
                    }
                }
            }
        });
        const parent = scope.createComponent({
            id: 'test-' + testNum + '-parent',
        }, {
            state: {
                change(changed) {
                    if (changed.checkParent1) {
                        expect(changed.checkParent1.newValue).to.be.equal(1);
                        expect(changed.checkParent2.newValue).to.be.equal('b');
                        //done();
                    }
                }
            },
            view: {
                render() {
                    const childElement = child.createTag()
                        .refProps({
                            checkChild1: 'checkParent1',
                            checkChild2: 'checkParent2'
                        });
                    return childElement.render();
                }
            }
        });
        const grandparent = scope.createComponent({
            id: 'test-' + testNum + '-grandparent',
        }, {
            state: {
                props: {
                    local: {
                        mainObj: {
                            passedProp: 0
                        },
                        mainProp: 'a'
                    }
                },
                'post:mount'() {
                    let mainObj = {
                        passedProp: this.props.local.mainObj.passedProp + 1
                    };
                    this.setProps({
                        mainObj,
                        mainProp: 'b'
                    }, true);
                },
                change() {
                    return false;
                }
            },
            view: {
                render() {
                    const parentElement = parent.createTag()
                        .refProps({
                            checkParent1: 'mainObj.passedProp',
                            checkParent2: 'mainProp'
                        });
                    expect(this.props.mainObj.passedProp).to.be.equal(0);
                    expect(this.props.mainProp).to.be.equal('a');
                    return parentElement.render();
                }
            }
        });
        let DIV = document.createElement('div');
        DIV.innerHTML = grandparent.createTag().render();
        document.getElementById('ui-tests').appendChild(DIV);
    });

    it('should recognize referenced properties if external on parent', (done) => {
        const child = scope.createComponent({
            id: 'test-' + testNum + '-child',
        }, {
            state: {
                mount() {
                    expect(this.props.external.check).to.be.equal(1);
                    done();
                }
            }
        });
        const parent = scope.createComponent({
            id: 'test-' + testNum + '-parent',
        }, {
            view: {
                render() {
                    const childElement = child.createTag()
                        .refProps({check: 'passedProp'});
                    expect(this.props.passedProp).to.be.equal(1);
                    return childElement.render();
                }
            }
        });
        let DIV = document.createElement('div');
        DIV.innerHTML = parent.createTag().props({passedProp: 1}).render();
        document.getElementById('ui-tests').appendChild(DIV);
    });

    it('should execute passed annonymus method', (done) => {
        const child = scope.createComponent({
            id: 'test-' + testNum + '-child',
        }, {
            view: {
                render() {
                    this.methods.executeCb();
                }
            }
        });
        const parent = scope.createComponent({
            id: 'test-' + testNum + '-parent',
        }, {
            view: {
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
            id: 'test-' + testNum + '-child',
        }, {
            view: {
                render() {
                    this.methods.executeCb();
                }
            }
        });
        const parent = scope.createComponent({
            id: 'test-' + testNum + '-parent',
        }, {
            state: {
                methods: {
                    local: {
                        executeMe() {
                            done();
                        }
                    }
                }
            },
            view: {
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

    it('should execute passed state method on next() from local override', (done) => {
        const child = scope.createComponent({
            id: 'test-' + testNum + '-child',
        }, {
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
            view: {
                render() {
                    this.methods.executeCb();
                }
            }
        });
        const parent = scope.createComponent({
            id: 'test-' + testNum + '-parent',
        }, {
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
            view: {
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
            id: 'test-' + testNum,
        }, {
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
            view: {
                render(changed) {
                    if (changed && changed.prop) {
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