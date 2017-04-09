import SepCon from '../src/index';

let expect = chai.expect;

describe('Component Global Segregation (+ Data & Modifier)', ()=>{
    let testNum = 0;
    const scope = SepCon.createScope();
    scope.createData({
        id: 'globals',
        data: {
            number: 5,
            object: {
                prop1: 1,
                prop2: 2,
                object: {
                    prop1: 1,
                    prop2: 2,
                }
            },
            array: [
                { prop1: 1 },
                { prop2: 2 },
                { prop3: 3 },
            ]
        }
    });

    beforeEach(function() {
        testNum++;

        document.getElementById('ui-tests').innerHTML = '';
    });

    it('should execute change on bind property change', function(done) {
        scope.createModifier({
            id: 'modifier'+testNum,
            modifier: {
                methods: {
                    set() {
                        let object = this.getProp('globals', 'object');
                        let array = this.getProp('globals', 'array');
                        object.object.prop1 = 5;
                        array[0].prop1 = {
                            prop1: 1,
                            prop2: 2,
                            prop3: 3,
                        };
                        this.setProps('globals', { object, array });
                    }
                }
            }
        });
        const testComp = scope.createComponent({
            id: 'test'+testNum,
            component: {
                state: {
                    props: {
                        global: {
                            objProp1: {
                                data: 'globals',
                                key: 'object.object.prop1'
                            },
                            arrProp1: {
                                data: 'globals',
                                key: 'array.0.prop1'
                            }
                        }
                    },
                    methods: {
                        global: {
                            set: {
                                modifier: 'modifier'+testNum,
                                key: 'set'
                            }
                        }
                    },
                    mount() {
                        this.methods.global.set();
                    },
                    change(changed) {
                        expect(changed).to.have.property('objProp1');
                        expect(changed.objProp1).to.have.property('oldValue');
                        expect(changed.objProp1).to.have.property('newValue');
                        expect(changed.objProp1.oldValue).to.be.equal(1);
                        expect(changed.objProp1.newValue).to.be.equal(5);

                        expect(changed).to.have.property('arrProp1');
                        expect(changed.arrProp1).to.have.property('oldValue');
                        expect(changed.arrProp1).to.have.property('newValue');
                        expect(changed.arrProp1.oldValue).to.be.equal(1);
                        expect(changed.arrProp1.newValue).to.have.property('prop1');
                        expect(changed.arrProp1.newValue).to.have.property('prop2');
                        expect(changed.arrProp1.newValue).to.have.property('prop3');
                        expect(changed.arrProp1.newValue.prop1).to.be.equal(1);
                        expect(changed.arrProp1.newValue.prop2).to.be.equal(2);
                        expect(changed.arrProp1.newValue.prop3).to.be.equal(3);

                        done();
                    }
                }
            }
        });
        let DIV = document.createElement('div');
        DIV.innerHTML = testComp.createTag().render();
        document.getElementById('ui-tests').appendChild(DIV);
    });
});