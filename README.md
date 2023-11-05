<h1 align="center">Welcome to Lilith!</h1>
<p>
  <img alt="Version" src="https://img.shields.io/badge/version-0.2.0-blue.svg?cacheSeconds=2592000" />
  <a href="#" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  </a>
</p>

#### A simple state manager written in Typescript

## How to Install

Copy, paste and run, like most packages.

```sh
npm i @atsu/lilith
```

## Usage

First of all, you just need to know one simple concept

1. `value`, `watch` and `unwatch`: These words are the core of Lilith.

    Use a `value` to read and write new data.

    You `watch` for changes and do something about it, and you `unwatch` when you want to stop watching a value.

Then you are good to go, this is a basic example on how to use it.

```ts
import { useState } from "@atsu/lilith";

const [Lilith, watchLilith, unwatchLilith] = useState({
    list: [],
    flag: false,
});

const onLilithUpdate = ({ list, flag }) => {
    console.log("I will receive this updated ", list);
    console.log("I will receive this updated flag as", flag);
};

watchLilith(onLilithUpdate); // I want to watch for updates

Lilith.list = ["I want to add this"]; // This will trigger an update
Lilith.flag = true; // This will trigger an update again

unwatchLilith(onLilithUpdate); // I am responisble and clean my listeners
```

## Typescript

After you define your state, it should be possible to have type inference.

```ts
Lilith; // Should be of type { list: any[], flag: boolean }
```

This is nice, and enforces a type safe development, but it can be a bit hard to read if you have a big section.

Plus, we have an `any[]` in the list type, TS took the initial values to type it.

We can do it better, so we simply define an `LilithState` interface to feed the useState generic:

```ts
interface LilithState {
    list: string[];
    flag: boolean;
}
```

And include it in the `useState` as `useState<LilithState>`.

Or you can always make your code organized, I prefer it this way:

```ts
const initialLilithState: LilithState = {
    list: [],
    flag: false,
};
const [Lilith, watchLilith, unwatchLilith] = useState(initialLilithState);
```

And that's it, really simple!

You can organize multiple states as sections of a store, if you want to separate concerns and also to separate the watchers' event handlers.

```ts
export const MyAppStore = {
    Lilith: useState(initialLilithState);
    azuma: useState(initialAzumaState);
    atago: useState(initialAtagoState);
}
```

```ts
/* In another file */
const [azuma, watchAzuma, unwatchAzuma] = MyAppStore.azuma;
```

### Configuration

If you wanna see what's going on every update, just enable `debug` mode:

```ts
const [Lilith, watchLilith, unwatchLilith] = useState(initialLilithState, {
    debug: true,
});
```

This way Lilith will log any change update into the console.

## Common questions and answers

Q: This basically describes the `Publish-subscribe pattern`, why not simply use a message system?

A: I do not want to define messages and map them in an Enum. Lilith 0.2.x used this method of doing things.

Q: Why I would use this instead of Redux or Pinia or any other store management?

A: The main point of Lilith is simplicity, it resolves the problem of needing a State and Event management and only that.
This gives you also the benefit of integrating on almost any project (that uses npm).

## Author

👤 **Tsukugi**

-   Github: [@Tsukugi](https://github.com/Tsukugi)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/Tsukugi/Lilith/issues).

## Show your support

Give a ⭐️ if this project helped you!

---
