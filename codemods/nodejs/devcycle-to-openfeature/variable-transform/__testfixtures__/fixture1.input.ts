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
