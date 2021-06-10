# esbuild-serve

[![GitHub Repo](https://img.shields.io/badge/github-hyrious/esbuild--serve-blue)](https://github.com/hyrious/esbuild-serve/) ![total lines](https://img.shields.io/tokei/lines/github/hyrious/esbuild-serve) [![npm package](https://img.shields.io/npm/v/@hyrious/esbuild-serve)](https://www.npmjs.com/package/@hyrious/esbuild-serve)

### Usage

Serve your static site:

```bash
> npx @hyrious/esbuild-serve
[esbuild-serve] serving http://localhost:3000
```

Build your static site:

```bash
> npx @hyrious/esbuild-serve --build
```

### Description

This is a simple wrapper of [`esbuild --serve`](https://esbuild.github.io/api/#serve),
which enables auto reload and zero-config development.

**Difference to [vite]**:

1. Vite doesn't do bundle in development for the best speed. This tool does bundle
   everything into a single file.
2. `index.html` in vite is part of your source code, development and production will
   treat it differently. While in this tool, `index.html` is part of your production site.
3. You can have multiple entry points, but if you do that, their output file names
   must be the same with the source files', this is limited by esbuild build options.\
   e.g. if you request `js/app.js` and `js/home.js`, there must be `some-folder/app.ts` and `some-folder/home.js` in your source code.

### Zero-config Assumptions

This tool follows the example usage from esbuild document, which gives:

```bash
esbuild src/app.js --servedir=www --outdir=www/js --bundle
```

That is to say, you need a public folder with `index.html` in it to formalize a static site.

Recommended folder names: `public`, `www`, `dist`, `(root folder)`.

Run `esbuild-serve init` to create an example folder with an example index.html.

### Config

Create an `esbuild.config.ts`:

```ts
import { defineConfig } from "@hyrious/esbuild-serve";

export default defineConfig({
  serve: {},
  build: {},
});
```

### Todo

- [Access metafile in serve mode](https://github.com/evanw/esbuild/issues/1072).\
  Due to this problem, currently it must run `esbuild.build` to generate metafile
  to search dependency files to watch for auto reload.

### License

MIT @ [hyrious](https://github.com/hyrious)

[vite]: https://github.com/vitejs/vite
