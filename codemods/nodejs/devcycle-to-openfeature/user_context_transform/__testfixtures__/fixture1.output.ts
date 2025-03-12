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
