# DevCycle to OpenFeature NodeJS - Variable Transform CodeMod

This Codemod runs a series of DevCycle Codemods in a workflow to convert your Node.js project from using [DevCycle's Node.js Server SDK](https://docs.devcycle.com/sdk/server-side-sdks/node/) to using [OpenFeature's NodeJS SDK](https://openfeature.dev/docs/reference/technologies/server/javascript/) with [DevCycle's OpenFeature Provider](https://docs.devcycle.com/sdk/server-side-sdks/node/node-openfeature).

The workflows that it runs are:

- [Update Imports](https://codemod.com/registry/devcycle-to-openfeature-nodejs-update-imports)
- [Initialization Transform](https://codemod.com/registry/devcycle-to-openfeature-nodejs-initialization-transform)
- [User Context Transform](https://codemod.com/registry/devcycle-to-openfeature-nodejs-user-context-transform)
- [Variable Transform](https://codemod.com/registry/devcycle-to-openfeature-nodejs-variable-transform)
