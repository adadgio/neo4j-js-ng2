# Neo4jJs (v2)

A Neo4j graph database explorer, editor and dashboard.

[Features and bugs roadmap](https://trello.com/b/NLtaurIH/neo4j-js-https-githubcom-adadgio-neo4j-js-ng2)

Table of Contents
=================

* [Improvements over v1](#improvements-over-v1)
* [Getting started](#getting-started)
  * [Pre-requisites](#pre-requisites)
  * [Quick configuration](#quick-configuration)
* [Graph events](#graph-events)
* [Running in production](#running-in-production)
* [Running in development](#running-in-development)
* [Graph events](#graph-events)
* [Known issues](#known-issues)
* [License](#license)

## Improvements over v1

**Bug improvements**

- Settings can now be updated on the fly via the UI.
- Better separated components thanks to Angular2.
- **Much much cleaner code** for developers to build upon.
- Better events handling in graph and database interaction.
- Annoying bugs and annoying features fixed from v1.

**New features**

- Links details are no editable.
- Links can be created in the create mode.
- Added a plain *cypher query* mode in the main search bar.
- Settings are served from a `settings.json` file but are then loaded/edited from local storage.

## Getting started

@todo

### Pre-requisites

- Neo4j must be installed [Neo4j quick install instructions here](https://www.digitalocean.com/community/tutorials/how-to-install-neo4j-on-an-ubuntu-vps)
- Neo4j Basic Authentication must have been configured (by default)

### Quick configuration

- With Angular2: serve projeect with `ng serve`and navigate to `http://localhost:4200/`
- Without Angular2: create a virtual host on your machine and point it to the `dist` folder
- Copy `src/assets/neo4j.settings.json.dist` to `neo4j.settings.json` and change with your settings
- Change client `authBasic` value to `Basic: <authString>`. Auth string is a base64 encode of neo4j `username:password`


## Graph events

@todo

## Running in production

Clone the repository and point an Apache2 or Nginx virtual host to the `./dist` folder (see `./support` files for examples).

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Known issues

- Chrome:  **Compatibility OK** (no known issues)
- In Firefox local storage is not shared between tabs so you might experience settings or debug logs inconsistent views.
- There is a bug in Firefox when you create relationships between nodes. The dragline randomly stays stuck on the node (1/2 times).

## Licence

You do absolutely what you want with that project (MIT Licence).
