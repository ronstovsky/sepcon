import { SepCon } from './../src/index';

SepCon.setConfiguration({
    //logs: false,
    //router: {
    //    mode: 'hash'
    //},
});
class Component extends SepCon.classes.Component {
    initialize() {
        //console.log('Extended Component - initialize()');
        super.initialize();
    }
    resume(element) {
        console.log('extend resume', element);
        super.resume(element);
    }
}
SepCon.classes.Component = Component;

class ComponentDefinition extends SepCon.classes.ComponentDefinition {
    registerElement() {
        console.log('Extended Component Definition - registerElement()');
        super.registerElement();
    }
}
SepCon.classes.ComponentDefinition = ComponentDefinition;