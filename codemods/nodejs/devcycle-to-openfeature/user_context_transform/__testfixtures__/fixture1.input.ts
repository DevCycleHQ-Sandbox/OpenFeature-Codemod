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
