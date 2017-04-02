import { SepCon } from '../../src/index';

export default SepCon.createComponent({
    id: 'select',
    component: {
        state: {
            props: {
                local: {name: 'select', options: [{value: null, label: 'Loading'}]}
            },
            methods: {
                local: {
                    onchange(next, value) {
                        console.log('select changed', value);
                        next(value);
                    },
                },
            },
        },
        'events': [
            {event: 'change', selector: 'select', callback: 'handleChange'}
        ],
        'render'() {
            let options = [];
            for (let i = 0, e = this.props.options.length; i < e; i++) {
                const option = this.props.options[i];
                const isSelected = this.props.selected === option.value ? 'selected="selected"' : '';
                options.push(`<option ${isSelected} value="${option.value}">${option.label}</option>`);
            }
            return `<div class="sepcon sepcon-element">
                <select name="${this.props.name}">
                    ${options.join('')}
                </select>
            </div>`;
        },
        handleChange(e) {
            this.methods.onchange(e.target.value);
        }
    }
});