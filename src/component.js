import common from './common';
import { TAG_IDENTIFIER } from './constants';

// will return a wrapped component with the framework's integration layer
export default class Component {

    constructor(componentDefinition, root, element, parent, parentElement) {
        this.active = false;

        this._eventsCallbacks = {};
        this.scoped = common.clone(componentDefinition);
        this.scoped.html = element.originalInnerHTML;
        this.scoped.children = element.originalChildren;
        this.scoped.element = element;
        this.scoped.id = element.getAttribute(TAG_IDENTIFIER);

        delete this.scoped.state;
        if(this.scoped.super) {
            delete this.scoped.super.state;
        }

        this.parent = parent;

        this.state = new root.classes.ComponentState(componentDefinition.state, this, root);
        this.sequencer = new root.classes.Sequencer(this, root.sequencerConfig);


        this.mapItem = root.addComponent(this, element, parentElement);
    }

    bindEvents() {
        if (!this.scoped.events) return;
        if(this.scoped.isInitiatedEvents) {
            this.unbindEvents();
        }

        this.scoped.events.forEach((evObj)=> {
            //getting the target - selector or the whole element
            const _target = evObj.selector ? this.scoped.element.querySelector(evObj.selector) : this.scoped.element;
            //storing callbacks in a map to keep reference for later unbinding on demand
            this._eventsCallbacks[evObj.selector + ':' + evObj.event + ':' + evObj.callback] = this.scoped[evObj.callback].bind(this.scoped);
            _target.addEventListener(evObj.event, this._eventsCallbacks[evObj.selector + ':' + evObj.event + ':' + evObj.callback], false);
        });
        this.scoped.isInitiatedEvents = true;
    }
    unbindEvents() {
        if (!this.scoped.events || !this.scoped.isInitiatedEvents) return;

        this.scoped.events.forEach((evObj)=> {
            //getting the target - selector or the whole element
            const _target = evObj.selector ? this.scoped.element.querySelector(evObj.selector) : this.scoped.element;
            //using the eventsCallback map for live reference for removing it on demand
            _target.removeEventListener(evObj.event, this._eventsCallbacks[evObj.selector + ':' + evObj.event + ':' + evObj.callback], false);
        });
        this.scoped.isInitiatedEvents = false;
    }

    initialize(element) {
        // execute state mount and sync with render sequence
        this.active = true;
        this.setStateData();
        this.sequencer.startSequence('mount');
    }

    //after change, the element is re-attached to the DOM so have to attach it
    resume(element) {
        this.active = true;
        this.unbindEvents();
        this.scoped.element = element;
        if (!this.currentHtml) {
            this.initialize();
            return;
        }
        this.setStateData();
        this.updateState();
        let isInitialHTMLChanged = this.scoped.html != this.scoped.element.originalInnerHTML;
        this.scoped.html = this.scoped.element.originalInnerHTML;
        this.scoped.children = this.scoped.element.originalChildren;
        this.scoped.element.innerHTML = this.currentHtml;
        this.bindEvents();
        this.state.addRoutes();
        const localChanged = common.setChanges(this.componentPrevProps, this.scoped.props);
        if (Object.keys(localChanged).length > 0 || isInitialHTMLChanged) {
            this.sequencer.startSequence('externalChange', localChanged);
        }
    }

    updateState() {
        this.scoped.props = this.state.getProps();
        this.scoped.methods = this.state.getMethods();
    }

    setStateData() {
        this.state.setExternals();
        this.state.updateReferencedProps();
        this.state.updateGlobalProps();
        this.mapItem.updateAfterComponentInit();
    }

    onStateChange(changed) {
        this.sequencer.startSequence('localChange', changed);
    }

    onReferenceChange(changed) {
        const localChanged = this.state.getReferenceStatePropNames(changed);
        this.sequencer.startSequence('referenceChange', localChanged);
    }

    onGlobalStateChange(changed) {
        const localChanged = this.state.getGlobalStatePropNames(changed);
        this.sequencer.startSequence('globalChange', localChanged);
    }

    onRender(html) {
        if(html != this.currentHtml) {
            this.scoped.element.innerHTML = this.currentHtml = html;
            this.bindEvents();
        }
    }

    onDestroy() {
        this.active = false;
        this.state.removeRoutes();
        this.unbindEvents();
        this.componentPrevProps = common.clone(this.scoped.props);
        this.sequencer.startSequence('destroy');
    }
}