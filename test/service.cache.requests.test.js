import SepCon from '../src/index';

let expect = chai.expect;

describe('Service Cache Requests', ()=> {
    let testNum = 0;
    const scope = SepCon.createScope();

    beforeEach(function () {
        testNum++;
    });

    it('should have resolve and reject as arguments at service requests', (done) => {
        let counter = 0;
        scope.createService({
            id: 'testService' + testNum,
        }, {
            cache: {
                requests: {
                    clickMe: {
                        storage: false
                    }
                }
            },
            requests: {
                clickMe(resolve, reject, number, letter) {
                    counter++;
                    let num = (() => {
                        switch(number) {
                            case 1:
                                return 10;
                            case 5:
                                return 29348745;
                            case 10:
                                return 25342;
                            default:
                                return 'miau';
                        }
                    })();
                    let char = (() => {
                        switch(letter) {
                            case 'a':
                                return 'z';
                            case 'b':
                                return 'n';
                            case 'c':
                                return 'A';
                            default:
                                return 'bchfff';
                        }
                    })();
                    resolve(num + '' + char);
                }
            }
        });
        scope.service('testService' + testNum).requests.clickMe().then((res) => {
            expect(res).to.be.a('string');
            expect(res).to.be.equal('miaubchfff');
            expect(counter).to.be.equal(1);

            scope.service('testService' + testNum).requests.clickMe().then((res) => {
                expect(res).to.be.equal('miaubchfff');
                expect(counter).to.be.equal(1);

                scope.service('testService' + testNum).requests.clickMe(1, 'a').then((res) => {
                    expect(res).to.be.equal('10z');
                    expect(counter).to.be.equal(2);

                    scope.service('testService' + testNum).requests.clickMe().then((res) => {
                        expect(res).to.be.equal('miaubchfff');
                        expect(counter).to.be.equal(2);

                        scope.service('testService' + testNum).requests.clickMe(1, 'a').then((res) => {
                            expect(res).to.be.equal('10z');
                            expect(counter).to.be.equal(2);

                            scope.service('testService' + testNum).requests.clickMe(5, 'c').then((res) => {
                                expect(res).to.be.equal('29348745A');
                                expect(counter).to.be.equal(3);
                                done();
                            });
                        });
                    });
                });
            });
        });



    });

});