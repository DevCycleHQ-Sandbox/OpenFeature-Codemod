# OpenFeature Codemods

This repository is a collection of Codemods to help convert codebases from an existing vendor's SDKs to OpenFeature SDKs using the existing vendor's OpenFeature Provider.

- [DevCycle to OpenFeature Node.js Codemod](https://codemod.com/registry/devcycle-to-openfeature-nodejs-workflow)
   - Convert your Node.js application using [DevCycle's Node.js Server SDK](https://docs.devcycle.com/sdk/server-side-sdks/node/) to using [OpenFeature's Node.js SDK](https://openfeature.dev/docs/reference/technologies/server/javascript/) with [DevCycle's OpenFeature Provider](https://docs.devcycle.com/sdk/server-side-sdks/node/node-openfeature)
   - Run Codemod using: `codemod devcycle-to-openfeature-nodejs-workflow`
- LaunchDarkly to OpenFeature Node.js Codemod (Coming Soon)
   - Convert your Node.js application using [LaunchDarkly Node.js SDK](https://launchdarkly.com/docs/sdk/server-side/node-js) to using [OpenFeature's Node.js SDK](https://openfeature.dev/docs/reference/technologies/server/javascript/) with [LaunchDarkly's OpenFeature Provider](https://launchdarkly.com/docs/sdk/openfeature/node-js)

**Note: these Codemods are just the starting point, they should cover most of the brute-force work, but will need manual review and cleanup to work in your codebase**

## Run Codemod

First install the Codemod NPM package: 

```bash
npm i -g codemod
```

Run Codemod:
```bash
codemod devcycle-to-openfeature-nodejs-workflow
```

## Testing The Codemods

In each folder first install packages using `pnpm install`, then run the tests using `pnpm test`. The tests primarily just ensure that the test fixtures under `__testfixtures__` transform correctly using the Codemod.