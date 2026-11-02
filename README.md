<p align="center">
  <a href="https://docleus.io"><img src="./.github/assets/docleus.svg" width="88" alt="Docleus logo" /></a>
</p>

<h1 align="center">Plugin Template</h1>

<p align="center">
  <strong>Your next Docleus plugin starts here.</strong><br />
  A working counter block, four runtime entries, and tests to build on.
</p>

<p align="center">
  <a href="LICENSE"><img alt="MIT license" src="https://img.shields.io/badge/license-MIT-111111?style=flat-square" /></a>
  <img alt="Public preview in preparation" src="https://img.shields.io/badge/preview-0.0.1-cfcfcf?style=flat-square" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178c6?style=flat-square" />
  <a href="https://docleus.io"><img alt="Online documentation" src="https://img.shields.io/badge/docs-docleus.io-111111?style=flat-square" /></a>
</p>

<p align="center">
  <a href="https://docleus.io">Documentation</a> &middot;
  <a href="#usage">Get started</a> &middot;
  <a href="https://github.com/Docleus/docleus">Run Docleus</a> &middot;
  <a href="https://github.com/Docleus/.github/blob/main/CONTRIBUTING.md">Contribute</a>
</p>

---

Template for new Docleus plugins. It is a small working plugin: a `template.counter` block that renders a button on published sites and counts clicks there.

## Usage

Copy this directory to `docleus-plugin-<name>`, then rename the package in `package.json`, `docleus.plugin.json`, and `src/shared/index.ts`. Update the repository, bugs, and homepage metadata in `package.json` and the `repository-name` input in `.github/workflows/ci.yml` to identify the new repository. `pnpm install --frozen-lockfile`, `pnpm build`, and `pnpm check` should then pass. Rename or remove the counter block (`src/shared/counter.ts` and its uses) once your plugin has blocks of its own.

`@docleus/sdk` is a peer dependency; the host provides it. The
`link:../docleus-core/packages/*` dev dependencies let the tests run against the
real core services, so the plugin must sit next to `docleus-core` in a
side-by-side workspace.

## Writing a plugin

A plugin is a package with a manifest and up to four entries. Each entry runs in one place and is built to `dist/`. The smallest useful plugin is a server entry that registers something with a core service:

```ts
import { definePlugin } from "@docleus/sdk";

export const plugin = definePlugin({
  name: "@acme/plugin-hello",
  inject: ["http"],
  apply(ctx) {
    ctx.http.route("GET", "/api/acme/hello", () =>
      Response.json({ hello: "world" }),
    );
  },
});
```

`inject` lists the services the plugin needs; it starts once they are available and stops when one goes away. Everything registered through `ctx` (services, routes, event listeners, jobs, timers) is undone when the plugin unloads, so a plugin keeps no module-level state. Plugins talk to each other through namespaced services (`ctx.provide("acme.comments", ...)` in one, `inject: ["acme.comments"]` in the other), never by importing each other.

The public services, events, and extension points are declared by the typed
exports and TSDoc in `@docleus/sdk`. Every extension point is `experimental`
before 1.0 and may change in a minor version.

## Manifest

`docleus.plugin.json` describes the package to the host:

| Field                  | Meaning                                                                                                                              |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `name`, `version`      | The package name and its exact version                                                                                               |
| `engines.docleus`      | The platform versions the plugin supports, as an npm-style range (`^0.0.1`). Outside it the plugin is refused at install and at boot |
| `entries`              | `shared`, `server`, `editor` and `site` files in `dist/`; at least one                                                               |
| `requires`, `provides` | Services the plugin needs from other plugins, and core services it replaces (`docleus-plugin-blobs-s3` provides `blobs`)             |
| `syntax`               | Markdown syntax the plugin claims, such as `directive:acme.callout`                                                                  |
| `exposes`              | Browser modules the plugin adds to the host import map for other plugins                                                             |
| `islands`              | Interactive block types on published sites, mapped to their browser module                                                           |

Keep `engines.docleus` and the `@docleus/sdk` peer range in `package.json` in
step. The maintainers' `scripts/compat` checks both for every plugin.

The first public preview uses `^0.0.1` for both ranges. This means
`>=0.0.1 <0.0.2`: releasing for `0.0.2` requires explicitly updating the
compatibility range and testing against that platform.

## Trying it in an instance

Add a row for the plugin to a bundle and serve it from `docleus-core`:

```yaml
- id: hello
  plugin: ../docleus-plugin-hello
```

```sh
pnpm build
pnpm --dir ../docleus-core docleus serve --dev --bundle ../docleus-plugin-hello/bundle.yaml --data /tmp/hello --port 4000
```

`--dev` signs any email in as an instance admin. Organizations created in the browser enable installed plugins automatically; organizations created through the API need explicit enablement. Existing organizations can enable the plugin in Settings, Plugins. To install a built plugin into a running instance instead, `npm pack` it and upload the tarball under Instance settings, Plugins.

## Entries

Each entry is listed in `docleus.plugin.json` and points at a file the build writes to `dist/`. Keep only the entries your plugin needs.

- `shared` (`src/shared`): types and validators used by the other entries, such as `COUNTER_TYPE` and `parseCounterProps`.
- `server` (`src/server`): exports `plugin`, loaded by the server. It registers the counter block type with `ctx.blocks` and its HTML renderer with `ctx.render`.
- `editor` (`src/editor`): exports `plugin`, loaded in the editor in the browser. It registers the counter block and a "Counter" slash menu item with `ctx.editor`.
- `site` (`src/site/index.ts`): a plain module script that runs on every page of a published site. Visitor pages have no Cordis and no `ctx`.

Everything a plugin registers through `ctx` is undone when it unloads. The browser entries are built separately (`dist/editor`, `dist/site`) so that their chunks stay inside the directory the host serves. They never bundle React or the SDK; the host provides both through an import map.

## Islands

An island is an interactive block on a published site. The server renderer wraps the block's static markup in `<div data-island="<type>" data-block="<block id>">` and returns `islands: [{ blockId, type, props }]`. The manifest maps the block type to a browser module:

```json
"islands": { "template.counter": "./dist/site/counter.js" }
```

On pages that contain such a block, the site runtime imports that module and calls its `mount(element, props)` export with the island element and the props from the renderer. Islands are mounted, not hydrated: `src/site/counter.ts` validates its props, replaces the server markup with a live button, and returns a cleanup function. Pages without the block load nothing. The site entry and every island file must sit in one directory (here `dist/site`), which is copied into published sites.

## Tests

- `src/**/*.test.ts`: unit tests for the validator, the renderer, the editor registrations, and the island (with happy-dom).
- `tests/site.test.ts`: renders a page with the real `core-render` service and checks the island markup and props.
- `tests/round-trip.test.ts`: writes the counter to Markdown and reads it back with `createMarkdownRoundTrip` from `@docleus/testing`, as a fast-check property, and checks that it survives while the plugin is uninstalled. A plugin with its own Markdown codec passes the codec instead of `[]`.
- `tests/manifest.test.ts`: parses the manifest with the SDK's `parseManifest` and checks that every entry and island file is a tsdown output.

## Development

Use Node.js 24 and pnpm 11.21.0. Keep this repository next to `docleus-core`
with its original directory name; the `link:` development dependencies need
that layout. Install core before this repository:

```sh
pnpm --dir ../docleus-core install --frozen-lockfile
pnpm install --frozen-lockfile
pnpm check
pnpm build
```

`pnpm check` runs typecheck, lint, formatting, dependency boundaries, licenses,
and unit/in-process integration tests. Browser and external-service tests,
where provided, are separate and need the sibling repositories listed in
their setup files. The SDK is a host-provided peer dependency; packages remain
private and are not installed from npm. All extension points are experimental
before 1.0.

## Community

[Contributing](https://github.com/Docleus/.github/blob/main/CONTRIBUTING.md) &middot;
[Code of conduct](https://github.com/Docleus/.github/blob/main/CODE_OF_CONDUCT.md) &middot;
[Security](https://github.com/Docleus/.github/blob/main/SECURITY.md) &middot;
[Support](https://github.com/Docleus/.github/blob/main/SUPPORT.md)

## License

[MIT](LICENSE)
