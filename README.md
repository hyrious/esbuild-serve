## esbuild-serve

[![GitHub Repo](https://img.shields.io/badge/github-hyrious/esbuild--serve-blue)](https://github.com/hyrious/esbuild-serve/) ![total lines](https://img.shields.io/tokei/lines/github/hyrious/esbuild-serve) [![npm package](https://img.shields.io/npm/v/@hyrious/esbuild-serve)](https://www.npmjs.com/package/@hyrious/esbuild-serve) [![install size](https://packagephobia.com/badge?p=@hyrious/esbuild-serve)](https://packagephobia.com/result?p=@hyrious/esbuild-serve)

### Install

Install it globally,

```shell-session
npm i -g @hyrious/esbuild-serve
```

> You can also use `yarn` or `pnpm`.

or add it to your devDependencies,

```shell-session
npm i -D @hyrious/esbuild-serve
```

or use it from `npx` directly.

### Usage

Inside your front-end project, given such directory structure:

```
(root).
    /index.html
        ...(inner text)...
        <script data-src="main.tsx" type="module" src="main.js"></script>
    /main.tsx
```

> Use `<script data-src src>` so that
> the html page can be reused as the production code.
> But this is opinionated, you can use `<script src="main.tsx">`.
> The rewrite will only occur on relative paths.

simply run

```shell-session
> esbuild-serve
server is listening to http://localhost:4000
```

then an http server will be created and every time you
**access the page** or **modify the file** indicated by `data-src`,
the server will use esbuild to re-generate bundled file and
tell browser to refresh.

Since esbuild is very quick, this server will not use any "cache"
technologies and its implementation is _slow_ and dirty. You should never
put the server to production.

### Built-in behaviors

For convenience, there are some built-in bahaviors to make it zero-config-able.

-   404.html or index.html will be used by default for not found page, you can
    use it to build single page application.
-   with `--build` (notice to put the dir/index.html before this option), it
    bundles your files.

### Todo

-   No HMR, use [vite][] if you need it.
-   Raise an issue if you need something.

### License

MIT @ [hyrious](https://github.com/hyrious)

[vite]: https://github.com/vitejs/vite
