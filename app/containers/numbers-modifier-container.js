import { SepCon } from '../../src/index';
import Counter from './../components/counter';

export default SepCon.createComponent('numbers-modifier-container', {
    render() {
        return `
        <div class="sepcon sepcon-container">
            ${Counter.createTag().render()}
        </div>`;
    }
});