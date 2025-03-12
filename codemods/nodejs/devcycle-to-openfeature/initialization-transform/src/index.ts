import type { API, FileInfo, Options } from "jscodeshift";

export default function transform(
  fileInfo: FileInfo,
  api: API,
  options?: Options
): string {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  // Replace DevCycleClient type with Client from OpenFeature
  root
    .find(j.TSTypeReference, {
      typeName: {
        name: "DevCycleClient",
      },
    })
    .forEach((path) => {
      path.node.typeName = j.identifier("Client");
    });

  // Find all calls to initializeDevCycle, including chained calls
  const initializeDevCycleCalls = root.find(j.CallExpression, {
    callee: {
      name: "initializeDevCycle",
    },
  });

  // Find chained calls
  const chainedCalls = root.find(j.CallExpression, {
    callee: {
      type: "MemberExpression",
      object: {
        type: "CallExpression",
        callee: {
          name: "initializeDevCycle",
        },
      },
    },
  });

  // Find assignments using initializeDevCycle
  const assignmentCalls = root.find(j.AssignmentExpression, {
    right: {
      type: "AwaitExpression",
      argument: {
        type: "CallExpression",
        callee: {
          type: "MemberExpression",
          object: {
            type: "CallExpression",
            callee: {
              name: "initializeDevCycle",
            },
          },
        },
      },
    },
  });

  // Find variable declarations using initializeDevCycle
  const variableDeclarations = root.find(j.VariableDeclarator, {
    init: {
      type: "AwaitExpression",
      argument: {
        type: "CallExpression",
        callee: {
          type: "MemberExpression",
          object: {
            type: "CallExpression",
            callee: {
              name: "initializeDevCycle",
            },
          },
        },
      },
    },
  });

  // Combine all sets of calls
  const allCalls = [
    ...initializeDevCycleCalls.paths(),
    ...chainedCalls.paths(),
    ...assignmentCalls.paths(),
    ...variableDeclarations.paths(),
  ];

  allCalls.forEach((path) => {
    const parent = path.parentPath;
    if (!parent) return;

    let variableName: string | undefined;
    if (j.VariableDeclarator.check(path.node)) {
      if (j.Identifier.check(path.node.id)) {
        variableName = path.node.id.name;
      }
    } else if (j.AssignmentExpression.check(path.node)) {
      if (j.Identifier.check(path.node.left)) {
        variableName = path.node.left.name;
      }
    } else {
      return;
    }

    if (!variableName) return;

    const providerName = variableName
      .replace(/client/i, "provider")
      .replace(/^([A-Z])/, (_, letter) => letter.toLowerCase())
      .replace(/^([a-z])/, (_, letter) => letter.toUpperCase());
    const openFeatureClientName = "openFeatureClient";

    let args;
    if (j.VariableDeclarator.check(path.node)) {
      const init = path.node.init;
      if (
        j.AwaitExpression.check(init) &&
        j.CallExpression.check(init.argument) &&
        j.MemberExpression.check(init.argument.callee)
      ) {
        // Handle chained calls like .onClientInitialized()
        const callExpr = init.argument.callee.object;
        if (j.CallExpression.check(callExpr)) {
          args = callExpr.arguments;
        }
      } else if (
        j.AwaitExpression.check(init) &&
        j.CallExpression.check(init.argument)
      ) {
        args = init.argument.arguments;
      }
    } else if (j.AssignmentExpression.check(path.node)) {
      const right = path.node.right;
      if (
        j.AwaitExpression.check(right) &&
        j.CallExpression.check(right.argument) &&
        j.MemberExpression.check(right.argument.callee)
      ) {
        // Handle chained calls like .onClientInitialized()
        const callExpr = right.argument.callee.object;
        if (j.CallExpression.check(callExpr)) {
          args = callExpr.arguments;
        }
      } else if (
        j.AwaitExpression.check(right) &&
        j.CallExpression.check(right.argument)
      ) {
        args = right.argument.arguments;
      }
    }

    const providerInit = j.newExpression(
      j.identifier("DevCycleProvider"),
      args || []
    );

    const openFeatureSetup = j.awaitExpression(
      j.callExpression(
        j.memberExpression(
          j.identifier("OpenFeature"),
          j.identifier("setProviderAndWait")
        ),
        [j.identifier(providerName)]
      )
    );

    const openFeatureClientInit = j.variableDeclaration("const", [
      j.variableDeclarator(
        j.identifier(openFeatureClientName),
        j.callExpression(
          j.memberExpression(
            j.identifier("OpenFeature"),
            j.identifier("getClient")
          ),
          []
        )
      ),
    ]);

    if (j.VariableDeclarator.check(path.node)) {
      path.node.init = providerInit;
      if (j.Identifier.check(path.node.id)) {
        path.node.id = j.identifier(providerName);
      }
    } else if (j.AssignmentExpression.check(path.node)) {
      const declaration = j.variableDeclaration("const", [
        j.variableDeclarator(j.identifier(providerName), providerInit),
      ]);
      parent.replace(declaration);
    }

    const statements = [
      j.expressionStatement(openFeatureSetup),
      openFeatureClientInit,
    ];

    const block = parent.parentPath;
    if (j.BlockStatement.check(block.node)) {
      const index = block.node.body.indexOf(parent.node);
      block.node.body.splice(index + 1, 0, ...statements);
    }

    root
      .find(j.Identifier, {
        name: variableName,
      })
      .forEach((usage) => {
        if (usage.parentPath.node === path.node) return;
        usage.node.name = openFeatureClientName;
      });
  });

  return root.toSource();
}
