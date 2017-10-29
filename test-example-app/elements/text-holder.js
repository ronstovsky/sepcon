import { SepCon } from '../../src/index';

export default SepCon.createComponent({
    id: 'text-holder',
    component: {
        state: {
            props: {
                local: {value: 'Not set'}
            }
        },
        view: {
            render() {
                return `<div class="sepcon sepcon-element">
                    ${this.props.value}
                </div>`;
            }
        }
    }
});