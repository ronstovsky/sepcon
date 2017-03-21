<a name="data"></a>
## Data
The [**Data**][data] object is a static object that every [**Component**][component] of SepCon can gain access to.  
It has no abillity to add, remove and change any of its properties. We have the [**Modifier**][modifier] for these matters.

### Declaration
Once declared - the [**Data**][data] object exists at the SepCon ecosystem.  
No need to handle any returned value of the creation method `createData`.  
No need to create instances of that [**Data**][data] object.
```javascript
import SepCon from 'sepcon';
SepCon.createData({
    id: 'user',
    data: {
        name: 'Mr. Man',
        age: 99,
        gender: 'female',
        //...
    }
});
```
<a name="modifier"></a>
## Modifier
The [**Modifier**][modifier] is what we need in order to add, edit and remove values of [**Data**][data] objects.

### Declaration
The [**Modifier**][modifier] has a `methods` property, which holds down all methods that are used as an API for all [**Components**][component].  
It could also use `routes` in order to increase its abillity to manage [**Data**][data].  
It has a `mount` lifecycle support.

```javascript
import SepCon from 'sepcon';
SepCon.createModifier({
    id: 'user',
    modifier: {
        methods: {
            setName(name) {
                this.setProps('user', { name });
            }
        },
        routes: [],
        'pre:mount'() {}
        mount() {}
        'post:mount'() {}
    }
});
```

<a name="component"></a>
## Component
### Declaration
The declaration is what basically registers a new `customElement` to the DOM.  
Once a representing element is appended to the DOM - it initializes a new *Component* derived from the **Component Definition**.

```javascript
import SepCon from 'sepcon';
SepCon.createComponent({
    id: 'myComponent',
    component: {
        state: {
            //the Component State is defined here
        },
        render() {}
    }
});
```
*Under the hood, your new component will be registered under a tagName of this structure: `x-sepcon-mycomponent`*  
*It has a `render` [**Lifecycle**][lifecycle] that's triggered when the **Component** is mounted, and whenever a change of the [**Component State**][component-state] occurs*

<a name="component-state"></a>
### The Component State
Every component has its own state. You cannot share this state with other components, even of the same definition.

#### Declaration
The [**Component State**][component-state] is declared as per as the [**Component**][component] itself. It won't be declared seperately.
```javascript
import SepCon from 'sepcon';
SepCon.createComponent({
    id: 'myComponent',
    component: {
        state: {
            props: {
            	//the Properties Segregation is defined here
            },
            methods: {
            	//the Methods Segregation is defined here
            },
            mount() {},
            change(changed) {}
        }
    }
});
```
*The [**Component State**][component-state] has two default [**Lifecycles**][lifecycle] - `mount` and `change`.  
`change` gets one argument - the **changed** object.*

<a name="component-state--changed-object"></a>
#### The `change` [**Lifecycle**][lifecycle]'s *changed* object
The `changed` lifecycle method will get 1 argument, the ***changed*** object - a map of the changed properties in a [**Component State**][component-state].
```javascript
{
	changedProp1: {
    	newValue: 1,
        oldValue: 0
    },
    changedProp2: {
    	newValue: 'hello',
        oldValue: null
    }
}
```
*If a new property is added, the old value will be reprented by `null`.*

#### The State Segregations
The state has an internal segregation that's hidden from the component's scope itself - **Local**, **External** and **Global**.  
The key concept of this division is to enforce order and easier understanding of the code. In the Component scope itself, there won't be any reference to such segregation, there will only be `this.props` and `this.methods`.

##### Local  
The local properties and methods of a [**Component State**][component-state] are declared and handled *ONLY* by the [**Component State**][component-state].

* **Properties**  
  The local properties can be changed with `setProps` method.
  ```javascript
  state: {
      props: {
          local: { 
              counter: 0
          }
      }
  }
  ```
  *We've created a new local property named `counter`.*

* **Methods**  
  Local methods will run in the [**Component State**][component-state]'s scope.
  ```javascript
  state: {
      methods: {
          local: {
              increaseCounter(next) {
                  this.setProps({
                      counter: this.props.local.counter++
                  });
                  next();
              }
          }
      }
   }
   ```
   *`increaseCounter` will increase the local property named `counter` by 1, every time it will get executed. We'll use the `setProps` method of the [**Component State**][component-state] in order to alter state's local properties.*  
   **Notice the `next` method - it's always get passed as the first argument at each local method. In our component we have the abillity to control the methods' flow, we will elaborate on this later on.*


##### External
The external properties cannot be altered, they are read-only and are set at (or passed from) the parent Component.

* **Properties**  
  In the [**Component**][component] scope - external properties will override local properties under the same key.
* **Methods**  
  Local method under the same key as an external method will be in charge of executing it, by using the `next` argument.

##### Global
The declarations under the global segregation are references to [**Data**][data] (properties) and [**Modifiers**][modifier] (methods).

* **Properties**  
  The global properties are references to [**Data**][data] properties, and are also read-only like externals, but on referenced [**Data**][data] properties' changes - they will be changed automatically.

  ```javascript
  state: {
      props: {
          global: { 
              userName: {
                  data: 'user',
                  key: 'name'
              }
          }
      }
  }
  ```
  *The property `userName` is derived from a [**Data**][data] named `user`, under the property `name`.*

* **Methods**
  Global methods are references to [**Modifier**][modifier] methods.
  ```javascript
  state: {
      methods: {
          global: {
              changeUserName: {
                  modifier: 'user',
                  key: 'setName',
                  pass(newName) {
                      newName = 'Mr. ' + newName;
                      return [newName];
                  }
              }
          }
      }
  }
  ```
  *The method `changeUserName` points to a method named `setName` located at a [**Modifier**][modifier] named `user`.*  
  *Global methods has a unique function named `pass` that enables to pass arguments to the [**Modifier**][modifier] itself. If the arguments are expected to be passed directly from the **Component**, without any special formatting or handling, there is no need to define a `pass` function.*  
  *Important to keep in mind that this function should return an array, and it will be parsed as arguments at the [**Modifier**][modifier] methods' scope.*



<a name="lifecycle"></a>
## Lifecycles
The goal behind the [**Lifecycles**][lifecycle] can be splitted into three:
1. Sync of two scopes and thus creating a sequence.
   ```javascript
   state: {
   		mount() {} //executed 1st
   },
   render() {} //executed 2nd
   ```
2. Supply the ability to have hooks for before a given execution (`pre`) and after (`post`) it, systematically:
   ```javascript
   'pre:mount'() {}
   mount() {}
   'post:mount'() {}
   ```
3. Supply the ability to "break the chain" - if at some point we wouldn't want the [**Lifecycle**][lifecycle] to continue, we could stop the sequence by returning a `false` value:
   ```javascript
   state: {
   		'pre:mount'() {} //executed 1st
   		mount() { return false; } //executed 3rd
   },
   'pre:render'() {} //executed 2nd
   render() {} //won't be executed
   ```
[**Modifiers**][modifier] and [**Components**][component] both have [**Lifecycles**][lifecycle].  


### Default Lifecycles
SepCon has a few predefined lifecycles.

[**Component**][component]:  
* `render`  
  Executed with the [**Component State**][component-state]'s `mount` and `change` lifecycles.  
  The value that will be returned should be a string that represents html.  
  The returned value will be inserted to the [**Component**][component]'s representing DOM element

[**Component State**][component-state]:
* `mount`  
  Executed once - when a new [**Component**][component] is added to the DOM.
* `change`  
  Executed on every state property change, whether it's a local, external nor global property.
  Will get 1 argument - [the ***changed*** object][component-state--changed-object]

[**Modifier**][modifier]:
* `mount`  
  Executed once - when a new [**Modifier**][modifier] is defined.


### Changing The Lifecycles Configurations
We can add more lifecycles, as well as override existing ones, by accessing the SepCon's `setConfiguration` method.
```javascript
import SepCon from 'sepcon';
SepCon.setConfiguration({
	sequencer: {
    	myNewMount: {}
    }
});
```

### The Lifecycle Architecture
In order to gain full control we have a function to deal with the arguments that will be passed to each of the lifecycle's steps, and a function that gets the returned value of each step.

```javascript
myNewMount: {
	/**
    * the send function returns an array
    * that will be passed to the lifecycle's methods as arguments
    * this.base is the reference to the SepCon's relevant instance
    * @param step - current step { target, action }
    * @param hook - 'pre'/false/'post'
    * @returns []
    */
    send: function(step, hook) {
        return [...];
    },
    
    /**
    * gets the returned value of a lifecycle's method
    * @param step - current step { target, action }
    * @param hook - 'pre'/false/'post'
    * @param res - the returned value of the current lifecycle step
    */
    retrieve: function(step, hook, res) {},
    
    //the sequence array holds the steps to iterate over
    sequence: [
        {
            target: 'state',
            action: 'mount'
        },
        {
            target: 'component',
            action: 'render'
        },
    ]
}
```


[data]: #data
[modifier]: #modifier
[component]: #component
[component-state]: #component-state
[component-state--changed-object]: #component-state--changed-object
[lifecycle]: #lifecycle


