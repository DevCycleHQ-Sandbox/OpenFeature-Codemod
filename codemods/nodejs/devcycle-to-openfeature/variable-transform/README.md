# DevCycle to OpenFeature Node.js - Variable Transform CodeMod

This Codemod changes DevCycle variable calls to openfeature flags:

- Replace `variableValue()` and `variable()` calls with `get<Type>Value()` and `get<Type>Details()` respectively, where `<Type>` is `Boolean`, `String`, `Number`, or `Object`.
- move the first parameter (user/context) to the third parameter for each variable call being coverted.
- all Openfeature calls should be awaited.

## Before

```ts
const booleanValue = client.variableValue(user, "boolean-key", false);
const booleanValue2 = client2.variableValue(user2, "boolean-key-2", false);

const booleanVariable = client.variable(user, "boolean-key", false);

const stringValue = client.variableValue(user, "string-key", "default");
const stringVariable = client.variable(user, "string-key", "default");

const numberValue = client.variableValue(user, "number-key", 0.0);
const numberVariable = client.variable(user, "number-key", 0.0);

const objectValue = client.variableValue(user, "object-key", {
  default: true,
});
const objectVariable = client.variable(user, "object-key", {
  default: true,
});

const booleanValue3 = client.variableValue(
  { targetingKey: "1234" },
  "boolean-key",
  false
);
```

### After

```ts
const booleanValue = await client.getBooleanValue("boolean-key", false, user);
const booleanValue2 = await client2.getBooleanValue(
  "boolean-key-2",
  false,
  user2
);
const booleanVariable = await client.getBooleanDetails(
  "boolean-key",
  false,
  user
);

const stringValue = await client.getStringValue("string-key", "default", user);
const stringVariable = await client.getStringDetails(
  "string-key",
  "default",
  user
);

const numberValue = await client.getNumberValue("number-key", 0.0, user);
const numberVariable = await client.getNumberDetails("number-key", 0.0, user);

const objectValue = await client.getObjectValue(
  "object-key",
  {
    default: true,
  },
  user
);
const objectVariable = await client.getObjectDetails(
  "object-key",
  {
    default: true,
  },
  user
);

const booleanValue3 = await client.getBooleanValue("boolean-key", false, {
  targetingKey: "1234",
});
```
