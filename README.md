# SepCon JS [![Version](https://img.shields.io/npm/v/sepcon.svg?style=flat)](https://www.npmjs.com/package/sepcon) [![Downloads](https://img.shields.io/npm/dt/sepcon.svg?style=flat)](https://www.npmjs.com/package/sepcon)
Probably not the last JS framework you'll live to see


## About SepCon

SepCon is a Javascript framework based on CustomElements. Derived from the separation of concerns (SoC) design principle, and its architecture is influenced by *VVM and FLUX patterns.

## Installation

SepCon is available for installation using NPM
```
npm install sepcon
```
Or simply download [sepcon.js](https://github.com/ronstovsky/sepcon/blob/master/dist/sepcon.js) (and/or [sepcon.js.gz](https://github.com/ronstovsky/sepcon/blob/master/dist/sepcon.js.gz)) to your project directory

## The Ingredients

* **Component (+ Component State)** - The Component is basically the SepCon view unit, and it goes hand in hand with its Component State, which is some sort of a view-model.
* **Data** - This is a global object, that can be shared among all SepCon Components. For the Components (or their States to be exact) - any given Data property is a read-only, and cannot be altered directly.
* **Modifier** - This is a collection of methods that have access to all Data properties, and are privileged to alter them.


## The Key Concept

SepCon's Components are basically HTML5 customElements, no transpiler of any sort is needed to pass methods and properties from parent to child Component, and theoretically speaking - after creating a SepCon Component, you could initiate its instances anywhere in the HTML like so:
```html
<x-sepcon-COMPONENT_NAME></x-sepcon-COMPONENT_NAME>
```

Any passed methods and properties are basic string representation defined as data attributes on the element, e.g:
```html
<x-sepcon-COMPONENT_NAME data-properties="{'someProp': { 'value': RANDOM_GUID}"></x-sepcon-COMPONENT_NAME>
```

## The SoC design principle in practice

### Component vs Component State

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

### Data vs Modifier

While the Component-State has both properties *and* the privilege to change them, data objects are just plain static objects, that are accessible to all Component-States. In order to alter them, the Component-State should call methods located in the modifiers. Again - access to them are available to all Component-States, and they are basically some sort of an API to enable manipulation of the global Data objects.

For a full documentation go to [the Github Project Page](https://ronstovsky.github.io/sepcon/)
