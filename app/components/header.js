import { SepCon } from '../../src/index';
import TextHolder from './../elements/text-holder';


SepCon.createComponent({
    id: 'decorator-test',
    component: {
        state: {
            methods: {
                local: {
                    debug() {
                        console.log('the decorator "debug"', this);
                    }
                }
            },
            mount() {
                console.log('the decorator "mount"', this);
                this.methods.local.debug.call(this);
            }
        },
        render() {
            console.log('the decorator "render"', this);
            this.debugComponent();
        },
        debugComponent() {
            console.log('the decorator "debugComponent', this);
        }
    }
});

export default SepCon.createComponent({
    id: 'header',
    decorators: ['decorator-test'],
    component: {
        state: {
            props: {
                global: {
                    currentPage: {
                        data: 'site',
                        key: 'currentPage'
                    }
                }
            },
            methods: {
                local: {
                    debug() {
                        console.log('the actual component "debug"', this);
                    }
                }
            }
        },
        'render'() {
            console.log('the actual component "render"', this);
            this.methods.debug();
            if (!this.props.currentPage) {
                return '';
            }
            const title = TextHolder.createTag()
                .props({value: this.props.currentPage.title});
            const description = TextHolder.createTag()
                .props({value: this.props.currentPage.description});
            return `
            <div class="sepcon sepcon-component">
                ${title.render()}
                ${description.render()}
            </div>`;
        },
        debugComponent() {
            console.log('the actual component "debugComponent', this);
        }
    }
});