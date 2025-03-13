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

  // Find all assignments using initializeDevCycle
  root
    .find(j.AssignmentExpression, {
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
    })
    .forEach((path) => {
      if (!j.Identifier.check(path.node.left)) return;
      if (!j.AwaitExpression.check(path.node.right)) return;

      const variableName = path.node.left.name;
      const providerName = variableName
        .replace(/client/i, "Provider")
        .replace(/^([A-Z])/g, (letter: string) => letter.toLowerCase());

      const callExpr = path.node.right.argument;
      if (
        !j.CallExpression.check(callExpr) ||
        !j.MemberExpression.check(callExpr.callee)
      )
        return;

      const initCall = callExpr.callee.object;
      if (!j.CallExpression.check(initCall)) return;

      const args = initCall.arguments;

      // Create the new provider initialization
      const providerInit = j.variableDeclaration("const", [
        j.variableDeclarator(
          j.identifier(providerName),
          j.newExpression(j.identifier("DevCycleProvider"), args)
        ),
      ]);

      // Create OpenFeature setup
      const openFeatureSetup = j.expressionStatement(
        j.awaitExpression(
          j.callExpression(
            j.memberExpression(
              j.identifier("OpenFeature"),
              j.identifier("setProviderAndWait")
            ),
            [j.identifier(providerName)]
          )
        )
      );

      // Create OpenFeature client initialization
      const clientInit = j.variableDeclaration("const", [
        j.variableDeclarator(
          j.identifier("openFeatureClient"),
          j.callExpression(
            j.memberExpression(
              j.identifier("OpenFeature"),
              j.identifier("getClient")
            ),
            []
          )
        ),
      ]);

      // Replace the original assignment with the new statements
      if (!path.parent) return;
      path.parent.replace(providerInit, openFeatureSetup, clientInit);

      // Update all references to the original client variable
      root
        .find(j.Identifier, {
          name: variableName,
        })
        .forEach((idPath) => {
          if (idPath.parentPath.node === path.node) return;
          idPath.node.name = "openFeatureClient";
        });
    });

  // Find direct initializeDevCycle calls
  root
    .find(j.VariableDeclaration, {
      declarations: [
        {
          init: {
            type: "CallExpression",
            callee: {
              name: "initializeDevCycle",
            },
          },
        },
      ],
    })
    .forEach((path) => {
      const declaration = path.node.declarations[0];
      if (!declaration || !j.VariableDeclarator.check(declaration)) return;
      if (!j.Identifier.check(declaration.id)) return;

      const variableName = declaration.id.name;
      const providerName = variableName
        .replace(/client/i, "Provider")
        .replace(/^([A-Z])/g, (letter: string) => letter.toLowerCase());

      const init = declaration.init;
      if (!init || !j.CallExpression.check(init)) return;

      const args = init.arguments;

      // Create the new provider initialization
      const providerInit = j.variableDeclaration("const", [
        j.variableDeclarator(
          j.identifier(providerName),
          j.newExpression(j.identifier("DevCycleProvider"), args)
        ),
      ]);

      // Create OpenFeature setup
      const openFeatureSetup = j.expressionStatement(
        j.awaitExpression(
          j.callExpression(
            j.memberExpression(
              j.identifier("OpenFeature"),
              j.identifier("setProviderAndWait")
            ),
            [j.identifier(providerName)]
          )
        )
      );

      // Create OpenFeature client initialization
      const clientInit = j.variableDeclaration("const", [
        j.variableDeclarator(
          j.identifier(variableName),
          j.callExpression(
            j.memberExpression(
              j.identifier("OpenFeature"),
              j.identifier("getClient")
            ),
            []
          )
        ),
      ]);

      // Replace the original declaration and add the new statements
      const statements = [providerInit, openFeatureSetup, clientInit];
      path.replace(...statements);

      // Remove any subsequent onClientInitialized calls
      root
        .find(j.ExpressionStatement, {
          expression: {
            type: "AwaitExpression",
            argument: {
              type: "CallExpression",
              callee: {
                type: "MemberExpression",
                object: { name: variableName },
                property: { name: "onClientInitialized" },
              },
            },
          },
        })
        .remove();
    });

  return root.toSource();
}
