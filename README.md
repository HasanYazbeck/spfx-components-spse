# Dynamic Hero SPFx Web Part

An on-premises SharePoint Framework (SPFx) Hero/Banner web part that reads its slides from a SharePoint list. It is built with the legacy Gulp-based SPFx toolchain and is intended for SharePoint Server Subscription Edition or a compatible on-premises farm.

## Web Part Demo

![Bootstrap Slider Web Part Demo](assets/webpart-demo.gif)

## Features

- Creates a responsive Hero banner with a background image, overlay, heading, description, and call-to-action link.
- Uses SharePoint list data rather than hard-coded slides. Active items are ordered by `DisplayOrder`.
- Provides a first-run configuration panel to select an existing list or create a `HeroContent` list and its required fields.
- Validates an existing list before it is selected, and stores the list GUID rather than relying only on its title.
- Supports English and Arabic content automatically from the current SharePoint UI culture, including LTR/RTL direction and localized UI strings.
- Offers Full-width, Feature, and Carousel layouts; carousel navigation, pagination, optional automatic rotation, configurable interval and height, text alignment, overlay strength, fallback image, and link-target options.
- Opts in to SharePoint's full-bleed column with `supportsFullBleed: true`. To use this, place the web part in a **Full-width** page section; it cannot expand beyond a normal page section with CSS alone.
- Packages to an `.sppkg` for deployment to the on-premises App Catalog.

## Hero list schema

Use **Create Hero List Automatically** on first setup, or create/select a list with these internal field names:

| Field                            | Type                   | Purpose                                             |
| -------------------------------- | ---------------------- | --------------------------------------------------- |
| `Title`                          | Single line of text    | English title (the standard SharePoint Title field) |
| `TitleAR`                        | Single line of text    | Arabic title                                        |
| `DescriptionEN`, `DescriptionAR` | Multiple lines of text | English and Arabic descriptions                     |
| `ImageUrl`, `ImageUrlAR`         | Hyperlink or Picture   | English/default and Arabic image URLs               |
| `LinkUrl`                        | Hyperlink or Picture   | CTA destination                                     |
| `LinkTextEN`, `LinkTextAR`       | Single line of text    | CTA labels                                          |
| `DisplayOrder`                   | Number                 | Ascending slide order                               |
| `IsActive`                       | Yes/No                 | Only active items are displayed                     |
| `OpenInNewTab`                   | Yes/No                 | Reserved per-item link preference                   |

## Prerequisites and version compatibility

This is a **legacy SPFx 1.4.1** project. Use the versions below for dependable builds; modern Node.js releases are not supported by this toolchain.

| Tool                        | Version    | Notes                                                               |
| --------------------------- | ---------- | ------------------------------------------------------------------- |
| Node.js                     | **8.17.0** | Pinned in `package.json`                                            |
| npm                         | **6.x**    | Recommended for the lockfile v1 committed here                      |
| SPFx runtime/build packages | **1.4.1**  | `@microsoft/sp-*` dependencies are resolved to 1.4.1                |
| React / React DOM           | **15.6.2** | Required by SPFx 1.4.x                                              |
| Gulp                        | **3.9.1**  | Project dependency; invoke it through `gulp-cli`                    |
| Yeoman (`yo`)               | **3.1.1**  | Needed only to scaffold/recreate a project                          |
| SharePoint generator        | **1.10.0** | Recorded in `.yo-rc.json`; do not run it over this existing project |

The generator is not needed to clone, install, build, serve, or package this repository. Its version is documented only for recreating the scaffold. Because this code targets SPFx 1.4.1, do not run a newer generator in this folder: it can upgrade the solution and make it incompatible with the target farm.

## Clone and install

Use a terminal with Node 8.17.0. With [nvm](https://github.com/nvm-sh/nvm), for example:

```bash
nvm install 8.17.0
nvm use 8.17.0
node --version
npm --version

git clone <repository-url> spfx-components
cd spfx-components
npm ci
```

Install the legacy command-line tools once on your development machine:

```bash
npm install --global yo@3.1.1 gulp-cli@2.3.0 @microsoft/generator-sharepoint@1.10.0
```

> `npm ci` installs the exact dependency tree in `package-lock.json`. Do not use Node 22/npm 10 (or another modern runtime) for this SPFx 1.4.x project.

## Configure the workbench URL

Before serving against a SharePoint farm, change `initialPage` in `config/serve.json` to a workbench on your target site, for example:

```json
"initialPage": "https://sharepoint.contoso.local/sites/demo/_layouts/15/workbench.aspx"
```

The account opening the workbench must have permission to use the site and to create or update the Hero content list if choosing automatic list creation.

## Build and run

Trust the local HTTPS development certificate once, then start the development server:

```bash
gulp trust-dev-cert
gulp serve
```

Gulp serves the local bundle over HTTPS on port `4321` and opens the configured SharePoint workbench. Add the **components** web part, then choose an existing list or create the `HeroContent` data source.

For a compile/bundle check without the workbench:

```bash
gulp clean
gulp bundle
```

## Production package and deployment

Build the production bundle and create the SharePoint package:

```bash
gulp clean
gulp bundle --ship
gulp package-solution --ship
```

Upload `sharepoint/solution/spfx-components.sppkg` to the SharePoint App Catalog, trust/deploy it, and add the web part to a modern page. Test full-width behavior on the actual SharePoint farm; the local SPFx workbench does not emulate a Full-width section.

## Project layout

```text
src/webparts/components/
├── ComponentsWebPart.ts                # SPFx web part and property pane
├── ComponentsWebPart.manifest.json     # Includes full-bleed support
├── components/                         # React Hero component and SCSS module
├── services/HeroDataService.ts          # SharePoint REST list operations
├── models/                              # Hero item and web part property types
└── loc/                                 # English and Arabic strings
```
