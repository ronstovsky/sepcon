import { SepCon } from '../../src/index';
import TextHolder from './../elements/text-holder';

export default SepCon.createComponent('header', {
    state: {
        props: {
            global: {
                currentPage: {
                    data: 'site',
                    key: 'currentPage'
                }
            }
        },
    },
    'render'() {
        if(!this.props.currentPage) {
            return '';
        }
        const title = TextHolder.createTag()
            .props({ value: this.props.currentPage.title });
        const description = TextHolder.createTag()
            .props({ value: this.props.currentPage.description });
        return `
        <div class="sepcon sepcon-component">
            ${title.render()}
            ${description.render()}
        </div>`;
    }
});