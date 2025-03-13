import { describe, it } from "vitest";
import jscodeshift, { type API } from "jscodeshift";
import transform from "../src/index.js";
import assert from "node:assert";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const buildApi = (parser: string | undefined): API => ({
  j: parser ? jscodeshift.withParser(parser) : jscodeshift,
  jscodeshift: parser ? jscodeshift.withParser(parser) : jscodeshift,
  stats: () => {
    console.error(
      "The stats function was called, which is not supported on purpose"
    );
  },
  report: () => {
    console.error(
      "The report function was called, which is not supported on purpose"
    );
  },
});

describe("update-imports", () => {
  it.each(["fixture1", "fixture2"])("test %s", async (fixture) => {
    const INPUT = await readFile(
      join(__dirname, "..", "__testfixtures__", `${fixture}.input.ts`),
      "utf-8"
    );
    const OUTPUT = await readFile(
      join(__dirname, "..", "__testfixtures__", `${fixture}.output.ts`),
      "utf-8"
    );

    const actualOutput = transform(
      {
        path: "index.js",
        source: INPUT,
      },
      buildApi("tsx"),
      {}
    );

    const normalizeImports = (code: string) =>
      code
        .replace(/\s+/g, " ") // Replace multiple whitespace with single space
        .replace(/{\s+/g, "{") // Remove space after {
        .replace(/\s+}/g, "}") // Remove space before }
        .replace(/,\s+/g, ",") // Remove space after commas
        .replace(/,}/g, "}") // Remove trailing commas
        .trim();

    assert.deepEqual(
      normalizeImports(actualOutput || ""),
      normalizeImports(OUTPUT)
    );
  });
});
