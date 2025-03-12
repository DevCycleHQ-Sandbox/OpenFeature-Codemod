# OpenFeature Codemods

This repository is a collection of Codemods to help convert codebases from a vendor to OpenFeature SDKs. For example this can help if you'd like to convert:

- Node.js application using [DevCycle's Node.js Server SDK](https://docs.devcycle.com/sdk/server-side-sdks/node/) to using [OpenFeature's NodeJS SDK](https://openfeature.dev/docs/reference/technologies/server/javascript/) with [DevCycle's OpenFeature Provider](https://docs.devcycle.com/sdk/server-side-sdks/node/node-openfeature)
- Node.js application using LaunchDarkly Node.js SDK to using [OpenFeature's NodeJS SDK](https://openfeature.dev/docs/reference/technologies/server/javascript/) with LaunchDarklys OpenFeature Provider

**Note: these codemods are just the starting point, they should cover most of the brute-force work, but will need manual cleanup to work in your codebase**

## Testing The Codemods

In each folder first install packages using `pnpm install`, then run the tests using `pnpm test`. The tests primarily just ensure that the test fixtures under `__testfixtures__` transform correctly using the Codemod.