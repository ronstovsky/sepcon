import SepCon from '../src/index';

let expect = chai.expect;

describe('Service Cache Channels', () => {
    let testNum = 0;
    const scope = SepCon.createScope({
        hash: 'testcache-need-fixed-hash2'
    });
    const createService = (id, cacheConfig, onExecution) => {
        scope.createService({
            id,
        }, {
            cache: {
                channels: {
                    announcements: cacheConfig
                }
            },
            channels: {
                announcements(number, letter) {
                    onExecution();

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
                    return num + '' + char;
                }
            },
            requests: {
                announce(resolve, reject, number, letter) {
                    this.channels.announcements(number, letter);
                    resolve(true);
                },
                clearCacheFor(resolve, reject, args) {
                    this.clearCache('channels', 'announcements', args);
                    resolve(true);
                }
            }
        });
    };

    beforeEach(function () {
        testNum++;
    });

    it('should not invoke the channel if cached but rather return the cached response', (done) => {
        let counter = 0;
        const serviceName = 'testService' + testNum;
        createService(serviceName, { storage: false }, () => counter++);
        const eachResponseTest = (res, counter) => {
            expect(res).to.be.equal(expectedValue);
            expect(counter).to.be.equal(expectedSteps);
        };

        scope.service(serviceName).requests.clearCacheFor();
        let expectedValue = 'miaubchfff';
        let expectedSteps = 1;
        let announcements = 0;
        scope.service(serviceName).channels.announcements('testing'+testNum, (res) => {
            announcements++;

            eachResponseTest(res, counter);

            switch(announcements) {
                case 1:
                    expectedValue = 'miaubchfff';
                    expectedSteps = 1;
                    scope.service(serviceName).requests.announce();
                    break;
                case 2:
                    expectedValue = '29348745A';
                    expectedSteps = 2;
                    scope.service(serviceName).requests.announce(5, 'c');
                    break;
                case 3:
                    expectedValue = '10z';
                    expectedSteps = 3;
                    scope.service(serviceName).requests.announce(1, 'a');
                    break;
                case 4:
                    expectedValue = 'miaubchfff';
                    expectedSteps = 3;
                    scope.service(serviceName).requests.announce();
                    break;
                case 5:
                    expectedValue = '29348745A';
                    expectedSteps = 3;
                    scope.service(serviceName).requests.announce(5, 'c');
                    break;
                case 6:
                    expectedValue = 'miaubchfff';
                    expectedSteps = 4;
                    scope.service(serviceName).requests.clearCacheFor([]);
                    scope.service(serviceName).requests.announce();
                    break;
                case 7:
                    expectedValue = 'miaubchfff';
                    expectedSteps = 4;
                    scope.service(serviceName).requests.announce();
                    break;
                case 8:
                    expectedValue = '10z';
                    expectedSteps = 4;
                    scope.service(serviceName).requests.clearCacheFor([5, 'c']);
                    scope.service(serviceName).requests.announce(1, 'a');
                    break;
                case 9:
                    expectedValue = '29348745A';
                    expectedSteps = 5;
                    scope.service(serviceName).requests.announce(5, 'c');
                    break;
                case 10:
                    expectedValue = '29348745A';
                    expectedSteps = 5;
                    scope.service(serviceName).requests.announce(5, 'c');
                    break;
                case 11:
                    done();
                    break;
            }
        });

        scope.service(serviceName).requests.announce().then();
    });


    it('should not invoke the channel if cached but rather return the cached response - local storage', (done) => {
        let counter = 0;
        const serviceName = 'testService' + testNum;
        createService(serviceName, { storage: 'local' }, () => counter++);
        const eachResponseTest = (res, counter) => {
            expect(res).to.be.equal(expectedValue);
            expect(counter).to.be.equal(expectedSteps);
        };

        scope.service(serviceName).requests.clearCacheFor();
        let expectedValue = 'miaubchfff';
        let expectedSteps = 1;
        let announcements = 0;
        scope.service(serviceName).channels.announcements('testing'+testNum, (res) => {
            announcements++;

            eachResponseTest(res, counter);

            switch(announcements) {
                case 1:
                    expectedValue = 'miaubchfff';
                    expectedSteps = 1;
                    scope.service(serviceName).requests.announce();
                    break;
                case 2:
                    expectedValue = '29348745A';
                    expectedSteps = 2;
                    scope.service(serviceName).requests.announce(5, 'c');
                    break;
                case 3:
                    expectedValue = '10z';
                    expectedSteps = 3;
                    scope.service(serviceName).requests.announce(1, 'a');
                    break;
                case 4:
                    expectedValue = 'miaubchfff';
                    expectedSteps = 3;
                    scope.service(serviceName).requests.announce();
                    break;
                case 5:
                    expectedValue = '29348745A';
                    expectedSteps = 3;
                    scope.service(serviceName).requests.announce(5, 'c');
                    break;
                case 6:
                    expectedValue = 'miaubchfff';
                    expectedSteps = 4;
                    scope.service(serviceName).requests.clearCacheFor([]);
                    scope.service(serviceName).requests.announce();
                    break;
                case 7:
                    expectedValue = 'miaubchfff';
                    expectedSteps = 4;
                    scope.service(serviceName).requests.announce();
                    break;
                case 8:
                    expectedValue = '10z';
                    expectedSteps = 4;
                    scope.service(serviceName).requests.clearCacheFor([5, 'c']);
                    scope.service(serviceName).requests.announce(1, 'a');
                    break;
                case 9:
                    expectedValue = '29348745A';
                    expectedSteps = 5;
                    scope.service(serviceName).requests.announce(5, 'c');
                    break;
                case 10:
                    expectedValue = '29348745A';
                    expectedSteps = 5;
                    scope.service(serviceName).requests.announce(5, 'c');
                    break;
                case 11:
                    done();
                    break;
            }
        });

        scope.service(serviceName).requests.announce().then();
    });
});