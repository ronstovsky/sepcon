import SepCon from '../src/index';

let expect = chai.expect;

describe('Component Extension', ()=>{
    let testNum = 0;
    const scope = SepCon.createScope();
    scope.createData({
        id: 'globals',
        data: {
            number: 5,
            propToChange: null
        }
    });
    scope.createModifier({
        id: 'globals',
        modifier: {
            methods: {
                updateNumber() {
                    this.setProps('globals', {
                        number: Math.round(Math.random() * 1000)
                    });
                }
            }
        }
    });
    const parent = scope.createComponent({
        id: 'parent',
        component: {
            state: {
                props: {
                    local: {
                        number: 0,
                        text: ''
                    },
                    global: {
                        num: {
                            data: 'globals',
                            key: 'number'
                        }
                    }
                },
                methods: {
                    local: {
                        printNumber() {
                            console.log('print number', this.props.local.number);
                            return this.props.local.number;
                        },
                        printText() {
                            console.log('print text', this.props.local.text);
                            return this.props.local.text;
                        }
                    }
                },
                mount() {
                    this.setProps({
                        number: Math.round(Math.random() * 1000),
                        text: parseInt(Date.now() * 1000 + Math.round(Math.random() * 1000)).toString(36)
                    }, true);
                }
            },
            render() {
                return `${this.props.text} ${this.props.number} ${this.props.num}<br />`;
            }
        }
    });

    beforeEach(function() {
        testNum++;
    });

    it('should remain parent methods and props', function(done) {
        const child = scope.createComponent({
            id: 'child'+testNum,
            extend: 'parent',
            component: {
                state: {
                    props: {
                        local: {
                            array: []
                        }
                    }
                },
                render() {
                    expect(this.props).to.have.property('number');
                    expect(this.props).to.have.property('text');
                    expect(this.props).to.have.property('array');
                    expect(this.props).to.have.property('num');
                    expect(this.props.num).to.be.equal(5);
                    this.methods.done();
                    return `${JSON.stringify(this.props)}`;
                }
            }
        });

        let DIV = document.createElement('div');
        DIV.innerHTML = child.createTag()
            .methods({
                done
            })
            .render();
        document.getElementById('ui-tests').appendChild(DIV);
    });
    it('should have super property to point to parent', function(done) {
        const child = scope.createComponent({
            id: 'child'+testNum,
            extend: 'parent',
            component: {
                state: {
                    props: {
                        local: {
                            array: []
                        }
                    },
                    mount() {
                        expect(this.super).to.have.property('mount');
                        expect(this.super.methods.local).to.have.property('printNumber');
                        expect(this.super.methods.local).to.have.property('printText');
                        this.super.mount.apply(this, arguments);
                    }
                },
                render() {
                    expect(this.super).to.be.an('object');
                    expect(this.super).to.have.property('render');
                    expect(this.super.render).to.not.equal(this.render);
                    this.methods.done();
                    return `${this.props.array.length} ${this.super.render.apply(this, arguments)}`;
                }
            }
        });

        let DIV = document.createElement('div');
        DIV.innerHTML = child.createTag()
            .methods({
                done
            })
            .render();
        document.getElementById('ui-tests').appendChild(DIV);
    });
    it('should call inherited methods', function(done) {
        const child = scope.createComponent('child'+testNum, 'parent', {
            state: {
                methods: {
                    local: {
                        printText() {
                            return this.super.methods.local.printText.apply(this, arguments);
                        }
                    }
                },
                mount() {
                    this.setProps({
                        text: 'Hello',
                        number: 15
                    }, true);
                }
            },
            render() {
                expect(this.methods.printText()).to.be.equal('Hello');
                expect(this.methods.printNumber()).to.be.equal(15);
                this.methods.done();
            }
        });

        let DIV = document.createElement('div');
        DIV.innerHTML = child.createTag()
            .methods({
                done
            })
            .render();
        document.getElementById('ui-tests').appendChild(DIV);
    });
});