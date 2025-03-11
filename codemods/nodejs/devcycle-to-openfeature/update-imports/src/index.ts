import type { API, FileInfo, Options, ImportDeclaration } from "jscodeshift";

export default function transform(
  fileInfo: FileInfo,
  api: API,
  options?: Options
): string {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  // Check if the file imports initializeDevCycle, DevCycleClient, or DevCycleUser
  const importsInitializeDevCycle =
    root
      .find(j.ImportDeclaration, {
        source: { value: "@devcycle/nodejs-server-sdk" },
      })
      .find(j.ImportSpecifier, {
        imported: { name: "initializeDevCycle" },
      })
      .size() > 0;

  const importsDevCycleClient =
    root
      .find(j.ImportDeclaration, {
        source: { value: "@devcycle/nodejs-server-sdk" },
      })
      .find(j.ImportSpecifier, {
        imported: { name: "DevCycleClient" },
      })
      .size() > 0;

  const importsDevCycleUser =
    root
      .find(j.ImportDeclaration, {
        source: { value: "@devcycle/nodejs-server-sdk" },
      })
      .find(j.ImportSpecifier, {
        imported: { name: "DevCycleUser" },
      })
      .size() > 0;

  // Only proceed if any of these are imported
  if (
    !importsInitializeDevCycle &&
    !importsDevCycleClient &&
    !importsDevCycleUser
  ) {
    return root.toSource();
  }

  // Remove specific imports from @devcycle/nodejs-server-sdk
  root
    .find(j.ImportDeclaration, {
      source: { value: "@devcycle/nodejs-server-sdk" },
    })
    .forEach((path) => {
      const specifiers = path.node.specifiers?.filter((specifier) => {
        return (
          specifier.type === "ImportSpecifier" &&
          specifier.imported &&
          "name" in specifier.imported &&
          specifier.imported.name === "DevCycleProvider"
        );
      });

      if (specifiers && specifiers.length > 0) {
        path.node.specifiers = specifiers;
      } else {
        j(path).remove();
      }
    });

  // Add new imports based on what's being imported
  const importDeclarations: ImportDeclaration[] = [];

  // Add DevCycleProvider and OpenFeature if either initializeDevCycle or DevCycleClient is imported
  if (importsInitializeDevCycle || importsDevCycleClient) {
    importDeclarations.push(
      j.importDeclaration(
        [j.importSpecifier(j.identifier("DevCycleProvider"))],
        j.literal("@devcycle/nodejs-server-sdk")
      ),
      j.importDeclaration(
        [
          j.importSpecifier(j.identifier("OpenFeature")),
          j.importSpecifier(j.identifier("Client")),
          ...(importsDevCycleUser
            ? [j.importSpecifier(j.identifier("EvaluationContext"))]
            : []),
        ],
        j.literal("@openfeature/server-sdk")
      )
    );
  } else if (importsDevCycleUser) {
    importDeclarations.push(
      j.importDeclaration(
        [j.importSpecifier(j.identifier("EvaluationContext"))],
        j.literal("@openfeature/server-sdk")
      )
    );
  }

  // Insert new imports at the top of the file
  if (importDeclarations.length > 0) {
    root.get().node.program.body.unshift(...importDeclarations);
  }

  return root.toSource();
}
