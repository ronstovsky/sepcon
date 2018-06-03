import { SepCon } from '../../src/index';

export default SepCon.createComponent({
    id: 'text-holder',
}, {
    state: {
        props: {
            external: {value: 'Not set'}
        }
    },
    view: {
        lifecycle: {
            render() {
                return `<div class="sepcon sepcon-element">
                    ${this.props.value}
                </div>`;
            }
        }
    }
});