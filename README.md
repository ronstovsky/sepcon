# SepCon JS [![NPM Version](https://img.shields.io/npm/v/sepcon.svg?style=flat)]() [![Github Releases](https://img.shields.io/github/downloads/sepcon-rnd/sepcon/latest/total.svg?style=flat)]()
Probably not the last JS framework you'll live to see


## About SepCon JS ##

SepCon JS is a Javascript framework based on CustomElements. Derived from the separation of concerns (SoC) design principle, and its architecture is influenced with MVVM and FLUX patterns.


## The Ingredients ##

* **Component (+ Component State)** - The Component is basically the SepCon view unit, and it goes hand in hand with its Component State, which is some sort of a view-model.
* **Data** - This is a global object, that can be shared among all SepCon Components. For the Components (or their States to be exact) - any given Data property is a read-only, and cannot be altered directly.
* **Modifier** - This is a collection of methods that have access to all Data properties, and are privileged to alter them.


## The Key Concept ##

SepCon's Components are basically HTML5 customElements, no transpiler of any sort is needed to pass methods and properties from parent to child Component, and theoretically speaking - after creating a SepCon Component, you could initiate its instances anywhere in the HTML like so:
```html
<x-sepcon-COMPONENT_NAME></x-sepcon-COMPONENT_NAME>
```

Any passed methods and properties are basic string representation defined as data attributes on the element, e.g:
```html
<x-sepcon-COMPONENT_NAME data-properties="{'someProp': { 'value': 'someValue'}"></x-sepcon-COMPONENT_NAME>
```

## The SoC design principle in practice ##

### Component vs Component State ###

In oppose to some of today's trendy JS frameworks, where the "view" units are usually very powerful - with SepCon there's an intended separation of logic, that is being held in the State, from the rendering mechanism, which is the Component's responsibillity.
While the State defines all its properties and methods, with segregation of scopes (local/external/global), the view is only aware of the State's properties and methods in general, and will have no trace of their segregations.

I.E.
In the State there will be:
```javascript
props: { 
    local: { 
        someProp: 'someValue' 
    } 
}
```
But in the Component itself the property path will be:
```javascript
this.props.someProp
```
In addition - the "view" itself won't be able to alter the State's properties, it could only call the State's methods, which in their scope (which is the State scope) *does* have that ability.

### Data vs Modifier ###

While the Component-State has both properties *and* the privilege to change them, data objects are just plain static objects, that are accessible to all Component-States. In order to alter them, the Component-State should call methods located in the modifiers. Again - access to them are available to all Component-States, and they are basically some sort of an API to enable manipulation of the global Data objects.


## The Component State Segregation ##

The 3 main segregations in the State are: local, external and global

**Local** - The local properties can be changed with setProps method. Local methods will run in the State scope.

I.E.
Local method that will increase a local counter on every execution
```javascript
state: {
    props: {
        local: { 
            counter: 0
        }
    },
    methods: {
        local: {
            increaseCounter() {
                this.setProps({
                    counter: this.props.local.counter++
                });
            }
        }
    }
}
```

**External** - The external properties cannot be altered, they are read-only and are set at (or passed from) the parent Component.

**Global** - The global properties are references to Data properties, and are also read-only like externals, but on referenced Data properties' changes - they will be changed automatically. Global methods are references to Modifier methods.

I.E.
The property *userName* is derived from a Data named *user*, under the property *name*.
The method *changeUserName* points to a method named *setUserName* located at a Modifier named *userActions*. Global methods has a unique function named *pass* that enables to pass arguments to the modifier. If the arguments are expected to be passed directly from the Component, without any special formatting or handling, there is no need to define a *pass* function.
Important to keep in mind that this function should return an array, that will be parsed as arguments in the modifier methods' scope. 
```javascript
state: {
    props: {
        global: { 
            userName: {
                data: 'user',
                key: 'name'
            }
        }
    },
    methods: {
        global: {
            changeUserName: {
                modifier: 'userActions',
                key: 'setUserName',
                pass(newName) {
                    newName = 'Mr. ' + newName;
                    return [newName];
                }
            }
        }
    }
}
```
