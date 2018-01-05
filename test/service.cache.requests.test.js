import SepCon from '../src/index';

let expect = chai.expect;

describe('Service Cache Requests', () => {
    let testNum = 0;
    const scope = SepCon.createScope({
        hash: 'testcache-need-fixed-hash'
    });

    beforeEach(function () {
        testNum++;
    });

    it('should not invoke the request if cached but rather return the cached response', (done) => {
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
                        switch (number) {
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
                        switch (letter) {
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


    it('should be able to cache to localStorage and continue from there on', (done) => {
        let counter = 0;
        scope.createService({
            id: 'testService' + testNum,
        }, {
            cache: {
                requests: {
                    clickMe: {
                        storage: 'local'
                    }
                }
            },
            requests: {
                clickMe(resolve, reject, number, letter) {
                    counter++;
                    let num = (() => {
                        switch (number) {
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
                        switch (letter) {
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

        const record = localStorage.getItem(scope.hash + ':testService2|request|clickMe[]');
        if (record) {
            console.log('had localStorage cache');
            scope.service('testService' + testNum).requests.clickMe().then((res) => {
                expect(res).to.be.a('string');
                expect(res).to.be.equal('miaubchfff');
                expect(counter).to.be.equal(0);
                localStorage.clear();

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
        }
        else {
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
        }
    });

    it('should be able to cache to localStorage and continue from there on', (done) => {
        let counter = 0;
        scope.createService({
            id: 'testService' + testNum,
        }, {
            cache: {
                requests: {
                    clickMe: {
                        storage: 'local',
                        duration: 200
                    }
                }
            },
            requests: {
                clickMe(resolve, reject, number) {
                    counter++;
                    resolve(number * 2);
                }
            }
        });

        localStorage.clear();
        scope.service('testService' + testNum).requests.clickMe(5).then(res => {
            expect(res).to.equal(10);
            expect(counter).to.equal(1);
            scope.service('testService' + testNum).requests.clickMe(5).then(res => {
                expect(res).to.equal(10);
                expect(counter).to.equal(1);
                console.log('guess it\'s passing');
            });
            setTimeout(() => {
                scope.service('testService' + testNum).requests.clickMe(5).then(res => {
                    expect(res).to.equal(10);
                    expect(counter).to.equal(2);
                    done();
                });
            }, 201);
        });
    });
});