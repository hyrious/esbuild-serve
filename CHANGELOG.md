# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

[Unreleased]

## [0.3.6] - 2021-06-16
### Fixed
- Correctly find source file when in nested folder.
- Should `bundle: true`.

## [0.3.5] - 2021-06-15
### Added
- `esbuild-serve init` to generate an example index.html file.
- `esbuild-serve --build`.

## [0.3.4] - 2021-06-15
Breaking: This version completely rewrites this library. Now it becomes a tiny
wrapper of `esbuild --serve`. (It just helps you run the serve command and
do auto reload things.)

### Added
- `esbuild-serve --dry-run` to show the calculated serve command.

## [0.3.3] - 2021-06-06
Update dependencies only.

## [0.3.2] - 2021-03-31
### Fixed
- Use proper `index.html` if it exists.
- Delete `outdir` if `outfile` is defined.

## [0.3.1] - 2021-03-30
### Fixed
- Not exit when stopped.

## [0.3.0] - 2021-03-27
Breaking: This version completely rewrites this library. Now it becomes a tiny
wrapper of esbuild `serve()` and `build()`.

### Added
- Config file `esbuild.config.ts`.

### Removed
- Everything.

## [0.2.0] - 2021-01-29
### Added
- Add `--crazy` mode to refresh the page through `innerHTML=`.

## [0.1.8] - 2021-01-29
### Fixed
- Incorrect CSS MIME.

## [0.1.7] - 2021-01-28
### Changed
- Use `<script type="module"` instead.

## [0.1.3] - 2021-01-02
### Added
- Add a flag `--jsx=preact` as an alias of `jsx-factory=h`.

## [0.1.2] - 2021-01-02
Nothing new, update the build script.

## [0.1.1] - 2021-01-02
### Added
- You can add build options passed to esbuild.
- Improve 404 redirection.

## 0.1.0 - 2021-01-02
### Added
- Basic support.

[0.3.6]: https://github.com/hyrious/esbuild-serve/compare/v0.3.5...v0.3.6
[0.3.5]: https://github.com/hyrious/esbuild-serve/compare/v0.3.4...v0.3.5
[0.3.4]: https://github.com/hyrious/esbuild-serve/compare/v0.3.3...v0.3.4
[0.3.3]: https://github.com/hyrious/esbuild-serve/compare/v0.3.2...v0.3.3
[0.3.2]: https://github.com/hyrious/esbuild-serve/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/hyrious/esbuild-serve/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/hyrious/esbuild-serve/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/hyrious/esbuild-serve/compare/v0.1.8...v0.2.0
[0.1.8]: https://github.com/hyrious/esbuild-serve/compare/v0.1.7...v0.1.8
[0.1.7]: https://github.com/hyrious/esbuild-serve/compare/v0.1.3...v0.1.7
[0.1.3]: https://github.com/hyrious/esbuild-serve/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/hyrious/esbuild-serve/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/hyrious/esbuild-serve/compare/v0.1.0...v0.1.1
