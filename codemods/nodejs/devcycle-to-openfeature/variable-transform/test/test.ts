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
  it("test #1", async () => {
    const INPUT = await readFile(
      join(__dirname, "..", "__testfixtures__/fixture1.input.ts"),
      "utf-8"
    );
    const OUTPUT = await readFile(
      join(__dirname, "..", "__testfixtures__/fixture1.output.ts"),
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
        .replace(/\(\s+/g, "(") // Remove space after opening parenthesis
        .replace(/\s+\)/g, ")") // Remove space before closing parenthesis
        .replace(/\s+;/g, ";") // Remove space before semicolon
        .replace(/"\s+/g, '"') // Remove space after opening quote
        .replace(/\s+"/g, '"') // Remove space before closing quote
        .replace(/'\s+/g, "'") // Remove space after opening single quote
        .replace(/\s+'/g, "'") // Remove space before closing single quote
        .trim();

    assert.deepEqual(
      normalizeImports(actualOutput || ""),
      normalizeImports(OUTPUT)
    );
  });
});
