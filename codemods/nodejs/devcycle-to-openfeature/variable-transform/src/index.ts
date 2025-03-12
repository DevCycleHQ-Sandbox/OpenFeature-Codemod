import type { API, FileInfo, Options } from "jscodeshift";
import {
  MemberExpression,
  Identifier,
  ASTPath,
  CallExpression,
} from "jscodeshift";

export default function transform(
  file: FileInfo,
  api: API,
  options?: Options
): string | undefined {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  function ensureParentFunctionIsAsync(path: ASTPath): void {
    let currentPath: ASTPath | null = path;
    while (currentPath) {
      const node = currentPath.node;
      if (
        j.FunctionDeclaration.check(node) ||
        j.FunctionExpression.check(node) ||
        j.ArrowFunctionExpression.check(node)
      ) {
        if (!node.async) {
          node.async = true;
          dirtyFlag = true;
        }
        break;
      }
      currentPath = currentPath.parent;
    }
  }

  function createOpenFeatureCall(
    originalIdentifier: string,
    methodName: string,
    keyArg: CallExpression["arguments"][0],
    defaultValueArg: CallExpression["arguments"][0],
    userArg: CallExpression["arguments"][0]
  ) {
    const callExpr = j.callExpression(
      j.memberExpression(
        j.identifier(originalIdentifier),
        j.identifier(methodName)
      ),
      [keyArg, defaultValueArg, userArg]
    );

    return j.awaitExpression(callExpr);
  }

  function getMethodType(
    defaultValue: CallExpression["arguments"][0]
  ): string | null {
    if (j.BooleanLiteral.check(defaultValue)) return "Boolean";
    if (j.StringLiteral.check(defaultValue)) return "String";
    if (j.NumericLiteral.check(defaultValue)) return "Number";
    if (j.ObjectExpression.check(defaultValue)) return "Object";
    return null;
  }

  ["variableValue", "variable"].forEach((methodName) => {
    root
      .find(j.CallExpression, {
        callee: {
          property: { name: methodName },
        },
      })
      .forEach((path) => {
        const [userArg, keyArg, defaultValue] = path.node.arguments;
        if (!userArg || !keyArg || !defaultValue) return;

        const methodType = getMethodType(defaultValue);

        if (methodType) {
          const newMethodName =
            methodName === "variableValue"
              ? `get${methodType}Value`
              : `get${methodType}Details`;

          const originalIdentifier = (
            (path.node.callee as MemberExpression).object as Identifier
          ).name;

          const newCall = createOpenFeatureCall(
            originalIdentifier,
            newMethodName,
            keyArg,
            defaultValue,
            userArg
          );

          ensureParentFunctionIsAsync(path);
          path.replace(newCall);
          dirtyFlag = true;
        }
      });
  });

  if (dirtyFlag) {
    return root.toSource({
      quote: "single",
      wrapColumn: 80,
    });
  }
  return root.toSource();
}

export const parser = "tsx";
