# DevCycle to OpenFeature NodeJS - Update Imports CodeMod

This Codemod helps to convert DevCycle NodeJS SDK implementations to the OpenFeature NodeJS SDK using the DevCycle Provider. It handles the first step of the conversion by updating the packages imports:

- Only if the file is using `initializeDevCycle`, removes the imports of `initializeDevCycle`, and replaces those imports with `DevCycleProvider` from `@devcycle/nodejs-server-sdk`
- Only if the file is using `DevCycleClient`, removes the import of `DevCycleClient`, and replaces those imports with `DevCycleProvider` from `@devcycle/nodejs-server-sdk`
- Replaces `DevCycleUser` type with `EvaluationContext` from `@openfeature/server-sdk`
- Add imports for `OpenFeature` from `@openfeature/server-sdk` if the file is using `initializeDevCycle` or `DevCycleClient`

## Before

```ts
import {
  initializeDevCycle,
  DevCycleClient,
} from "@devcycle/nodejs-server-sdk";
```

## After

```ts
import { DevCycleProvider } from "@devcycle/nodejs-server-sdk";
import { OpenFeature, Client } from "@openfeature/server-sdk";
```

