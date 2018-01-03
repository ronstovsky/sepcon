import SepCon from '../src/index';

let expect = chai.expect;

describe('Service Channels', ()=> {
    let testNum = 0;
    const scope = SepCon.createScope();
    scope.createProvider({
        id: 'testProvider',
    }, {
        mount() {
            console.log('mount provider');
        }
    });

    scope.createService({
        id: 'testService',
    }, {
         channels: {
            numberChanged(newNum) {
                return { number: newNum };
            }
        }
    });

    beforeEach(function () {
        testNum++;
    });

    it('should have resolve and reject as arguments at service requests', function (done) {
        scope.createService({
            id: 'testService' + testNum,
        }, {
            channels: {
                testArgs() {
                    return 'testing';
                }
            },
            requests: {
                clickMe() {
                    this.channels.testArgs();
                }
            }
        });

        scope.service('testService' + testNum).channels.testArgs('test'+testNum, (value) => {
            expect(value).to.be.equal('testing');
            done();
        });
        scope.service('testService' + testNum).requests.clickMe();
        scope.service('testService' + testNum).channels.testArgs('test'+testNum, null);
    });
    it('should get a response immediately (still async) on channel subscription if has cache', function(done) {
        scope.service('testService' + (testNum-1)).channels.testArgs('test'+testNum, (value) => {
            expect(value).to.be.equal('testing');
            done();
        });
    });
});