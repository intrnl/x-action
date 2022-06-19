# x-action

Library for binding events to custom elements-based controllers.

```
npm install @intrnl/x-action
pnpm install @intrnl/x-action
yarn add @intrnl/x-action
```

## Why?

While working with libraries and frameworks like React and Svelte has been
very fun, I found it to be rather overkill for working on simple projects.

I've found [Stimulus][stimulus] approach with controllers to snug neatly in
between React and manual DOM bindings, but I didn't feel like committing
entirely into its paradigm and would prefer something that I can quickly
iterate on if situation ever calls for it.

The existence of custom elements/Web Components has also made it unnecessary
for a library like this to have to manage controllers and their lifecycles,
which allows this library to be under 800 bytes in size when gzip'd.

## Getting started

`x-action`, as the library name would suggest, would use the `x-action`
attribute to bind events to a corresponding controller.

> **Note**  
> The controller in question must be a standalone custom element, and not a
> custom element that extends/inherits an existing built-in element.
> [See here for details][mdn-ce-overview]

### Example

> **Note**
> The `x-target` attribute isn't mandatory, nor does it come from this library,
> but it's recommended that you do this when targetting a specific element from
> a controller.

```html
<hello-world>
  <input type='text' x-target='hello-world.name'>

  <button x-action='click:hello-world#greet'>
    Greet
  </button>
</hello-world>
```

```js
import '@intrnl/x-action';

class HelloWorldElement extends HTMLElement {
  #name = this.querySelector(`[x-target~='hello-world.name']`);

  greet () {
    const message = `Hello, ${this.#name.value}!`;
    alert(message);
  }
}

customElements.define('hello-world', HelloWorldElement);
```

### Action Syntax

The action syntax follows a pattern of `event:target#method`

- `event` is the name of a DOM event, e.g. `click` or `input`
- `target` is the name of a controller in the ancestry
- `method` is the name of a public method in the controller, this could be
  omitted where it will default to `handleEvent`

### Binding Actions to Self

Note that you can also use `this` as target, where it will point to the element
where that action is being defined on, assuming that the element is a
controller. This is very useful for dealing with nested controllers.

```html
<x-tree>
  <!-- this will bind `click` to the upper `x-tree` controller -->
  <x-tree x-action='click:x-tree#foo'>
  </x-tree>

  <!-- this will bind `click` to itself -->
  <x-tree x-action='click:this#foo'>
  </x-tree>
<x-tree>
```


[stimulus]: https://stimulus.hotwired.dev/
[mdn-ce-overview]: https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#high-level_view
