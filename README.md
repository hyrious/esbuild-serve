# esbuild-serve

[![GitHub Repo](https://img.shields.io/badge/github-hyrious/esbuild--serve-blue)](https://github.com/hyrious/esbuild-serve/) ![total lines](https://img.shields.io/tokei/lines/github/hyrious/esbuild-serve) [![npm package](https://img.shields.io/npm/v/@hyrious/esbuild-serve)](https://www.npmjs.com/package/@hyrious/esbuild-serve) [![install size](https://packagephobia.com/badge?p=@hyrious/esbuild-serve)](https://packagephobia.com/result?p=@hyrious/esbuild-serve)

### Usage

```shell-session
> npx @hyrious/esbuild-serve
[esbuild-serve] serving http://localhost:3000
```

```shell-session
> npx @hyrious/esbuild-serve --build
```

### Description

This is a simple wrapper of `esbuild --serve`, which enables auto reload and zero-config development. You even don't need an `index.html`.

**Note**: By default, it looks for the only one bundle target in the order of `{index,main,src/index,src/main}.{js,jsx,ts,tsx}`. Bundle result is `index.js` by default.

Difference to Vite: Vite doesn't do bundle in development for the best speed. This tool does bundle everything into a single file.

### Config

Create an `esbuild.config.ts` with contents below:

```ts
import { defineConfig } from "@hyrious/esbuild-serve";
export default defineConfig({
  // ...
});
```

Or if you hate typescript, an example `esbuild.config.js` will be:

```js
/** @type {import('@hyrious/esbuild-serve').UserConfig} */
module.exports = {
  // ...
};
```

Configs:

```ts
import { BuildOptions, ServeOptions } from "esbuild";
interface UserConfig {
  build: BuildOptions;
  serve: ServeOptions;
}
```

### License

MIT @ [hyrious](https://github.com/hyrious)

[vite]: https://github.com/vitejs/vite
