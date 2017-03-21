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

<a name="component-tag"></a>
## Component Tag
In order to create and initialize a new [**Component**][component] instance, we simply need to add its representing element into the DOM. But this might get tricky, if we would like to pass properties and methods to it.  
Theoretically speaking, if we would have insert a new html element directly to the DOM, it would have look something similar to this:
```html
<x-sepcon-mycomponent></x-sepcon-mycomponent>
```
*(And it would actually work)*

But - if we would like to pass properties we would need to add some data attribute:
```html
<x-sepcon-mycomponent data-properties="{prop1:'abc', prop2: 123}"></x-sepcon-mycomponent>
```
It will start to get a bit more difficult to maintain.

And if we would want to pass a reference to one of the [**Component State**][component-state]'s properties, so that on changes it will automatically get updated, *without* re-rendering the parent [**Component**][component]?

And if we would like to pass callbacks to that new [**Component**][component] instance? How could we represnt it in the HTML?  
Or even a less "extreme" case - if we would like to pass an object, we will need to parse it in such a way that the HTML won't break.

So we have a unique method for this ability - the [**Component Tag**][component-tag] object.

### Declaration
We can get this by two ways.
1. Getting a [**Component Tag**][component-tag] object directly from SepCon:
   ```javascript
   import SepCon from 'sepcon';
   const myComponentTag = SepCon.createTag('myComponent');
   ```
2. Using the returned value of the `createComponent` method:
   ```javascript
   import SepCon from 'sepcon';
   const myComponent = SepCon.createComponent({id: 'myComponent', component: {});
   const myComponentTag = myComponent.createTag();
   ```

### Passing Data
The [**Component Tag**][component-tag] object has a few methods in order to pass relevant data into the new [**Component**][component] instance.
* **Static Values - `props`, `methods`**  
  These are premitives or objects as one through `props`, and functions through `methods`.  
  The only thing to remember is that these values will be completely dettached of any original logic (wether it's a local/global property/method of the parent [**Component State**][component-state]).
  ```javascript
  myComponentTag
  	.props({
  		prop1: 'abc'
  	})
  	.methods({
  		method1: function() {}
  	});
  ```
* **Referenced Values - `refProps`, `refMethods`**  
  These are directly derived of the parent [**Component State**][component-state].  
  In other words - we will supply a key, and the child's [**Component State**][component-state] will be bind to the original property of the parent (if passed through `refProps`), or be able to execute the passed method throughout all of its segregations  - **Local** > **External** > **Global** (if passed through `refMethods`).
  ```javascript
  myComponentTag
  	.refProps({
  		prop2: 'propFromState'
  	})
  	.refMethods({
  		method2: 'methodFromState'
  	});
  ```
* **HTML**  
  Passing a pure HTML string.  
  ```javascript
  myComponentTag.html('<div>Hello World</div>');
  ```
  This html will be available only to the [**Component**][component] itself via the `html` property, to get the string itself, nor via the `children` property which holds an array of DOM elements.
  ```javascript
  render() {
  	return `<div>
    	${this.html}
    	<hr />
    	${this.children.length
    		? this.children.map(el => el.outerHTML).join('') 
    		: ''}
    </div>`;
  }
  ```
* **Identifier**  
  If iterating over some array of items, and we want to create some [**Component**][component] instance for each, it would be for the best to use the `id` method, to pass an identifier to distinguish from each other.  
  If we won't use an `id` - performance might get affected (harder coupling between an existing [**Component**][component] instance to a re-rendered DOM element).
  ```javascript
  let componentTags = [];
  for(let key in this.props.someArray) {
  	const myComponentTag = myComponent.createTag();
  	myComponentTag.id(key);
  	componentTags.push(myComponentTag);
  }
  ```

### Rendering The Tag
After setting up the [**Component Tag**][component-tag] with all of the relevant properties and methods - it's time to render it's representing HTML, in order to set parent [**Component**][component] DOM element's `innerHTML`.

We have 1 method for that - `render`, but it can be used in 2 different ways:
1. Fully rendered DOM element:
   ```javascript
   myComponentTag.render();
   ```
   *Will return:*
   ```html
   <x-sepcon-mycomponent 
   		data-properties="..." 
   		data-methods="..."
   		data-identifier="...">
   			Passed HTML
   </x-sepcon-mycomponent>
   ```
2. Partial rendered DOM element - `open` / `close`.  
   This will be used in case we would like to pass the html manually, rather then using the `html` method of the [**Component Tag**][component-tag].
   
   Creating the opening tag:
   ```javascript
   myComponentTag.render('open');
   ```
   *Will return:*
   ```html
   <x-sepcon-mycomponent 
   		data-properties="..." 
   		data-methods="..."
   		data-identifier="...">
   			Passed HTML
   </x-sepcon-mycomponent>
   ```
   
   Creating the closing tag:
   ```javascript
   myComponentTag.render('close');
   ```
   *Will return:*
   ```html
   </x-sepcon-mycomponent>
   ```
   
<a name="lifecycle"></a>
## Lifecycles
The goal behind the [**Lifecycles**][lifecycle] can be splitted into three:
1. Sync of two or more scopes and/or methods and thus creating a sequence.
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

<a name="router"></a>
## Router
SepCon uses a pretty simple, straight-forward [**Router**][router], that is available for use within [**Component-States**][component-state] and [**Modifiers**][modifier].  
They are the only privileged classes to use the SepCon's [**Router**][router]. In their instances' scopes - you'll have a `router` property under the `this` context:
```javascript
state:{
	change() {
		console.log(this.router);
	}
}
```

### Setting Routes
In oppose to the common use-case of frameworks' routers, with SepCon it's a bit different - both [**Component-States**][component-state] and [**Modifiers**][modifier] have to set a `router` property in their declaration that will hold an array of different routes' RegExps.
```javascript
routes: [
	{
		match: /^\s*$/,
		handler: function() {
			console.log('This is the root page');
		}
	}
]
```
*This pattern could be applied to both [**Component-States**][component-state] and [**Modifiers**][modifier], in exactly the same way.  
Once a route will match the RegExp supplied at the `match` property, the `handler` function will be executed. The context (`this`) will be of the instance.*  

*In a [**Component-State**][component-state] it will look something similar to this:*
```javascript
component: {
	state: {
		//props: {},
		//methods: {},
		//mount() {},
		//change(changed) {},
		routes: []
	}
}
```
*In a [**Modifier**][modifier] it will look something similar to this:*
```javascript
modifier: {
	//methods: {},
	//mount() {},
	routes: []
}
```

### Methods
The [**Router**][router] has (currently) two *main* methods:
* **Navigate**  
  The default behavior for the SepCon [**Router**][router] is to use the history API, i.e - `pushState` . Therefore it's recommended to use the [**Router**][router]'s `navigate` method.  
  ```javascript
  this.router.navigate(url);
  ```
* **Get URL**  
  Instead of analysing the `window.location` object, we can simply use the `getFragment` method
  ```javascript
  let url = this.router.getFragment();
  ```

### Changing The Router Configuration
We can change (currently) only the routing `mode` (*'history'* (default) or *'hash'*), and the `root` relative URL.  
This is feasible via SepCon's `setConfiguration` method.
```javascript
import SepCon from 'sepcon';
SepCon.setConfiguration({
    router: {
        mode: 'hash',
        root: '/home'
    }
});
```

[data]: #data
[modifier]: #modifier
[component]: #component
[component-state]: #component-state
[component-state--changed-object]: #component-state--changed-object
[component-tag]: #component-tag
[lifecycle]: #lifecycle
[router]: #router

