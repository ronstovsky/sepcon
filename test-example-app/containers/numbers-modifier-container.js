import { SepCon } from '../../src/index';
import Counter from './../components/counter';

export default SepCon.createComponent({
    id: 'numbers-modifier-container',
}, {
    view: {
        render() {
            return `<div class="sepcon sepcon-container">
                    ${Counter.createTag().render()}
                </div>`;
        }
    }
});