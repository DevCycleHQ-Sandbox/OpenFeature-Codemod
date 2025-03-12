import type { API, FileInfo, Options } from "jscodeshift";
import { Identifier, ASTPath, VariableDeclarator } from "jscodeshift";

export default function transform(
  fileInfo: FileInfo,
  api: API,
  options?: Options
): string {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  // Replace DevCycleUser type references with EvaluationContext
  root
    .find(j.TSTypeReference, {
      typeName: { name: "DevCycleUser" },
    })
    .forEach((path) => {
      path.node.typeName = j.identifier("EvaluationContext");
    });

  // Find variable declarations with DevCycleUser or EvaluationContext type
  root
    .find(j.VariableDeclarator)
    .filter((path: ASTPath<VariableDeclarator>): boolean => {
      const id = path.node.id as Identifier;
      const typeAnnotation = id.typeAnnotation?.typeAnnotation;

      return !!(
        j.Identifier.check(id) &&
        typeAnnotation &&
        j.TSTypeReference.check(typeAnnotation) &&
        j.Identifier.check(typeAnnotation.typeName) &&
        ["DevCycleUser", "EvaluationContext"].includes(
          (typeAnnotation.typeName as any).name
        )
      );
    })
    .forEach((path) => {
      if (path.node.init && j.ObjectExpression.check(path.node.init)) {
        j(path.node.init)
          .find(j.ObjectProperty, {
            key: { name: "user_id" },
          })
          .forEach((propPath) => {
            j(propPath).replaceWith(
              j.objectProperty(
                j.identifier("targetingKey"),
                propPath.node.value
              )
            );
          });
      }
    });

  // Find all variable declarations that will be used in variableValue/variable calls
  const variableUsages = new Set<string>();
  root
    .find(j.CallExpression, {
      callee: {
        type: "MemberExpression",
        property: {
          type: "Identifier",
          name: (name: string) =>
            name === "variableValue" || name === "variable",
        },
      },
    })
    .forEach((path) => {
      const firstArg = path.node.arguments[0];
      if (j.Identifier.check(firstArg)) {
        variableUsages.add(firstArg.name);
      }
    });

  // Transform user_id to targetingKey in object literals used in variable calls
  root
    .find(j.VariableDeclarator)
    .filter((path) => {
      const id = path.node.id;
      return j.Identifier.check(id) && variableUsages.has(id.name);
    })
    .forEach((path) => {
      if (path.node.init && j.ObjectExpression.check(path.node.init)) {
        j(path.node.init)
          .find(j.ObjectProperty, {
            key: { name: "user_id" },
          })
          .forEach((propPath) => {
            j(propPath).replaceWith(
              j.objectProperty(
                j.identifier("targetingKey"),
                propPath.node.value
              )
            );
          });
      }
    });

  // Transform user_id to targetingKey in direct object arguments
  root
    .find(j.CallExpression, {
      callee: {
        type: "MemberExpression",
        property: {
          type: "Identifier",
          name: (name: string) =>
            name === "variableValue" || name === "variable",
        },
      },
    })
    .forEach((path) => {
      if (
        path.node.arguments[0] &&
        j.ObjectExpression.check(path.node.arguments[0])
      ) {
        j(path.node.arguments[0])
          .find(j.ObjectProperty, {
            key: { name: "user_id" },
          })
          .forEach((propPath) => {
            j(propPath).replaceWith(
              j.objectProperty(
                j.identifier("targetingKey"),
                propPath.node.value
              )
            );
          });
      }
    });

  return root.toSource();
}
