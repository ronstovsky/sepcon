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
        console.log(changed);

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
});