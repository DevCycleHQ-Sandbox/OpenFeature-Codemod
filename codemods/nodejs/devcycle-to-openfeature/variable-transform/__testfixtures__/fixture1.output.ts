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
