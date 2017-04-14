import changes from '../src/shared/utils.changes';

let expect = chai.expect;

describe('Common (Utils)', ()=>{
    it('should detect changes in any nested object at any depth', () => {
        let source = {
            prop1: '-',
            prop2: '/',
            prop3: '|',
            primitivesArray: [1, 2, 3],
            primitivesObject: {0: 1, 1: 2, 2: 3},
            array: [
                { prop1: 1 },
                { prop2: 2 },
                { prop3: 3 },
            ],
            object: {
                0: { prop1: 'a' },
                1: { prop2: 'b' },
                2: { prop3: 'c' },
            }
        };
        let map = {
            prop1: '-',
            prop2: '|',
            prop3: '|',
            primitivesArray: [1, 3, 3],
            primitivesObject: {0: 1, 1: 3, 2: 3},
            array: [
                { prop1: 1 },
                { prop2: 3 },
                { prop3: 3 },
            ],
            object: {
                0: { prop1: 'a' },
                1: { prop2: 'c' },
                2: { prop3: 'c' },
            }
        };

        const changed = changes.setChanges(source, map);

        expect(changed).to.have.property('prop2');

        expect(changed).to.have.property('primitivesArray');
        expect(changed).to.have.property('primitivesArray.1');

        expect(changed).to.have.property('primitivesObject');
        expect(changed).to.have.property('primitivesObject.1');

        expect(changed).to.have.property('array');
        expect(changed).to.have.property('array.1');
        expect(changed).to.have.property('array.1.prop2');

        expect(changed).to.have.property('object');
        expect(changed).to.have.property('object.1');
        expect(changed).to.have.property('object.1.prop2');
    });

    it('should detect new inserted properties to source object', () => {
        let source = {
            prop1: '-',
            prop2: '/',
            prop3: '|',
            primitivesArray: [1, 2, 3],
            primitivesObject: {0: 1, 1: 2, 2: 3},
            array: [
                { prop1: 1 },
                { prop2: 2 },
                { prop3: 3 },
            ],
            object: {
                0: { prop1: 'a' },
                1: { prop2: 'b' },
                2: { prop3: 'c' },
            }
        };
        let map = {
            prop1: '-',
            prop2: '/',
            prop3: '|',
            prop4: '\\',
            primitivesArray: [1, 2, 3, 4],
            primitivesObject: {0: 1, 1: 2, 2: 3, 3: 4},
            array: [
                {
                    prop1: 1,
                    prop2: 1,
                    prop3: 1,
                },
                { prop2: 2 },
                { prop3: 3 },
                { prop3: 4 },
            ],
            object: {
                0: {
                    prop1: 'a',
                    prop2: 'a',
                    prop3: 'a',
                },
                1: { prop2: 'b' },
                2: { prop3: 'c' },
                3: { prop3: 'd' },
            }
        };

        const changed = changes.setChanges(source, map);
        console.log('changed', changed);

        expect(changed).to.have.property('prop4');

        expect(changed).to.have.property('primitivesArray');
        expect(changed).to.have.property('primitivesArray.3');

        expect(changed).to.have.property('primitivesObject');
        expect(changed).to.have.property('primitivesObject.3');

        expect(changed).to.have.property('array');
        expect(changed).to.have.property('array.0');
        expect(changed).to.have.property('array.0.prop2');
        expect(changed).to.have.property('array.0.prop3');

        expect(changed).to.have.property('array.3');
        expect(changed).to.have.property('array.3.prop3');

        expect(changed).to.have.property('object');
        expect(changed).to.have.property('object.0');
        expect(changed).to.have.property('object.0.prop2');
        expect(changed).to.have.property('object.0.prop3');

        expect(changed).to.have.property('object.3');
        expect(changed).to.have.property('object.3.prop3');
    });

    it('should detect removed properties from source object', () => {
        let source = {
            array: [
                { prop23: 3 },
            ],
            object: {
                0: { prop1: 'a' },
                1: { prop2: 'b' },
                2: { prop3: 'c' },
                3: { prop3: 'c' },
                4: { prop3: 'c' },
            }
        };
        let map = {
            primitivesArray: [1, 2, 3, 4],
            primitivesObject: {0: 1, 1: 2, 2: 3, 3: 4},
            array: [
                {
                    prop1: 1,
                    prop2: 1,
                    prop3: 1,
                },
                { prop2: 2 },
                { prop3: 3 },
                { prop3: 4 },
            ],
            object: {
                0: {
                    prop1: 'a',
                    prop2: 'a',
                    prop3: 'a',
                },
                1: { prop2: 'b' },
                2: { prop3: 'c' },
                3: { prop3: 'd' },
            }
        };

        const changed = changes.setChanges(source, map);
        console.log('changed - removed', changed);


        expect(changed).to.have.property('primitivesArray');
        expect(changed).to.have.property('primitivesArray.3');

        expect(changed).to.have.property('primitivesObject');
        expect(changed).to.have.property('primitivesObject.3');

        expect(changed).to.have.property('array');
        expect(changed).to.have.property('array.0');
        expect(changed).to.have.property('array.0.prop2');
        expect(changed).to.have.property('array.0.prop3');

        expect(changed).to.have.property('array.3');
        expect(changed).to.have.property('array.3.prop3');

        expect(changed).to.have.property('object');
        expect(changed).to.have.property('object.0');
        expect(changed).to.have.property('object.0.prop2');
        expect(changed).to.have.property('object.0.prop3');

        expect(changed).to.have.property('object.3');
        expect(changed).to.have.property('object.3.prop3');
    });

    it('should add any new data from map to source if argument[2] -> true', () => {
        let source = {};
        let map = {
            prop1: '-',
            prop2: '/',
            prop3: '|',
            prop4: '\\',
            primitivesArray: [1, 2, 3, 4],
            primitivesObject: {0: 1, 1: 2, 2: 3, 3: 4},
            array: [
                {
                    prop1: 1,
                    prop2: 1,
                    prop3: 1,
                },
                { prop2: 2 },
                { prop3: 3 },
                { prop3: 4 },
            ],
            object: {
                0: {
                    prop1: 'a',
                    prop2: 'a',
                    prop3: 'a',
                },
                1: { prop2: 'b' },
                2: { prop3: 'c' },
                3: { prop3: 'd' },
            }
        };

        changes.setChanges(source, map, true);
        console.log(JSON.parse(JSON.stringify(source)));

        expect(source).to.have.property('prop1');
        expect(source).to.have.property('prop2');
        expect(source).to.have.property('prop3');
        expect(source).to.have.property('prop4');

        expect(source).to.have.property('primitivesArray');
        expect(source.primitivesArray[0]).to.be.equal(1);
        expect(source.primitivesArray[1]).to.be.equal(2);
        expect(source.primitivesArray[2]).to.be.equal(3);
        expect(source.primitivesArray[3]).to.be.equal(4);

        expect(source.primitivesObject).to.have.property(0);
        expect(source.primitivesObject).to.have.property(1);
        expect(source.primitivesObject).to.have.property(2);
        expect(source.primitivesObject).to.have.property(3);

        expect(source).to.have.property('array');
        expect(source.array[0]).to.be.a('object');
        expect(source.array[0]).to.have.property('prop1');
        expect(source.array[0]).to.have.property('prop2');
        expect(source.array[0]).to.have.property('prop3');

        expect(source).to.have.property('object');
        expect(source.object['0']).to.have.property('prop1');
        expect(source.object['0']).to.have.property('prop2');
        expect(source.object['0']).to.have.property('prop3');
    });

    it('should alter the source to match the map if argument[2] -> true', () => {
        let source = {
            primitivesObject2: {1: 6},
            object2: {
                1: { prop5: 'f' }
            },
            object: {
                0: {
                    prop4: 'b'
                },
                5: { prop0: 'z' }
            }
        };
        let map = {
            prop1: '-',
            prop2: '/',
            prop3: '|',
            prop4: '\\',
            primitivesArray: [1, 2, 3, 4],
            primitivesObject: {0: 1, 1: 2, 2: 3, 3: 4},
            array: [
                {
                    prop1: 1,
                    prop2: 1,
                    prop3: 1,
                },
                { prop2: 2 },
                { prop3: 3 },
                { prop3: 4 },
            ],
            object: {
                0: {
                    prop1: 'a',
                    prop2: 'a',
                    prop3: 'a',
                },
                1: { prop2: 'b' },
                2: { prop3: 'c' },
                3: { prop3: 'd' },
            }
        };

        changes.setChanges(source, map, true);
        console.log(JSON.parse(JSON.stringify(source)));

        expect(source).to.have.property('primitivesArray');
        expect(source).to.have.property('primitivesObject2');
        expect(source.object2).to.have.property('1');
        expect(source.object2['1']).to.have.property('prop5');

        expect(source.object).to.not.have.property(5);

        expect(source.object['0']).to.not.have.property('prop4');


        expect(source.primitivesArray[1]).to.be.equal(2);
        expect(source.primitivesArray[2]).to.be.equal(3);
        expect(source.primitivesArray[3]).to.be.equal(4);

        expect(source.primitivesObject).to.have.property(0);
        expect(source.primitivesObject).to.have.property(1);
        expect(source.primitivesObject).to.have.property(2);
        expect(source.primitivesObject).to.have.property(3);

        expect(source).to.have.property('array');
        expect(source.array[0]).to.be.a('object');
        expect(source.array[0]).to.have.property('prop1');
        expect(source.array[0]).to.have.property('prop2');
        expect(source.array[0]).to.have.property('prop3');

        expect(source).to.have.property('object');
        expect(source.object['0']).to.have.property('prop1');
        expect(source.object['0']).to.have.property('prop2');
        expect(source.object['0']).to.have.property('prop3');
    });
});