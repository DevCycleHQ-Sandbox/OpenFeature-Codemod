# DevCycle to OpenFeature Node.js - User Context Transform CodeMod

Create a codemod that updates the `DevCycleUser` object to an OpenFeature `EvaluationContext` object.

- Replace the `DevCycleUser` object / types with an `EvaluationContext`
- Rename the `user_id` field to `targetingKey` in the `EvaluationContext`
- If the code is using Typescript types where its typed as `DevCycleUser`, update it to use `EvaluationContext` from `@openfeature/server-sdk`.

### Before

```ts
export interface DevCycleRequest extends Request {
  user: DevCycleUser;
}

const user: DevCycleUser = {
  user_id: "123",
  email: "test@test.com",
  name: "Test User",
  customData: {
    custom_field: "custom_value",
    number_field: 123,
    boolean_field: true,
  },
  privateCustomData: {
    private_field: "private_value",
  },
};

const varValue = devCycleClient.variableValue(
  { user_id: "123" },
  "test-variable",
  "default"
);

const user2 = { user_id: "1234", email: "test@test.com", name: "Test User" };
const boolVarValue = devCycleClient.variable(
  user2,
  "test-boolean-variable",
  false
);
```

### After

```ts
export interface DevCycleRequest extends Request {
  user: EvaluationContext;
}

const user: EvaluationContext = {
  targetingKey: "123",
  email: "test@test.com",
  name: "Test User",
  customData: {
    custom_field: "custom_value",
    number_field: 123,
    boolean_field: true,
  },
  privateCustomData: {
    private_field: "private_value",
  },
};

const varValue = devCycleClient.variableValue(
  { targetingKey: "123" },
  "test-variable",
  "default"
);

const user2 = {
  targetingKey: "1234",
  email: "test@test.com",
  name: "Test User",
};
const boolVarValue = devCycleClient.variable(
  user2,
  "test-boolean-variable",
  false
);
```
