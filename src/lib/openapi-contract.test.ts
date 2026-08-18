import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

/**
 * Guards docs/openapi.yaml against drift.
 *
 * The Flutter client lives in a separate repo and generates its Dart API client
 * from that spec, so a route renamed or deleted here would otherwise surface as
 * a runtime 404 on a phone. This turns it into a failing build instead.
 *
 * Scope is deliberately structural — path and HTTP method only. It cannot
 * verify response bodies; those are covered by each route's own test.
 */

const SPEC_PATH = path.join(process.cwd(), "docs", "openapi.yaml");

interface Operation {
  method: string;
  apiPath: string;
  /** Repo-relative route handler the operation must resolve to. */
  file: string;
}

/**
 * Minimal reader for the `paths:` block. A YAML parser is not a dependency of
 * this project, and the spec's indentation is machine-written and stable.
 */
function parseOperations(spec: string): Operation[] {
  const operations: Operation[] = [];
  let inPaths = false;
  let apiPath: string | null = null;

  for (const line of spec.split("\n")) {
    if (/^paths:/.test(line)) {
      inPaths = true;
      continue;
    }
    if (!inPaths) continue;
    // A non-indented key means the paths block has ended.
    if (/^[a-z]/.test(line)) break;

    const pathMatch = line.match(/^ {2}(\/\S+):\s*$/);
    if (pathMatch) {
      apiPath = pathMatch[1];
      continue;
    }

    const methodMatch = line.match(/^ {4}(get|post|patch|put|delete):\s*$/);
    if (!methodMatch || !apiPath) continue;

    operations.push({
      method: methodMatch[1].toUpperCase(),
      apiPath,
      // /api/x/{id}/y  ->  src/app/api/x/[id]/y/route.ts
      file: `src/app${apiPath.replace(/\{(\w+)\}/g, "[$1]")}/route.ts`,
    });
  }

  return operations;
}

const spec = readFileSync(SPEC_PATH, "utf8");
const operations = parseOperations(spec);

describe("docs/openapi.yaml contract", () => {
  it("declares operations", () => {
    // Guards the parser itself — a silent zero would make every case below vacuous.
    expect(operations.length).toBeGreaterThan(0);
  });

  it.each(operations)(
    "$method $apiPath has a route handler",
    ({ method, file }) => {
      expect(
        existsSync(path.join(process.cwd(), file)),
        `missing ${file}`,
      ).toBe(true);

      const source = readFileSync(path.join(process.cwd(), file), "utf8");
      expect(
        new RegExp(`export async function ${method}\\b`).test(source),
        `${file} does not export ${method}`,
      ).toBe(true);
    },
  );

  it("pins every Prisma enum the mobile client depends on", () => {
    // These become Dart enums. A value added in schema.prisma but missing here
    // deserializes to an unknown variant on the phone.
    const schema = readFileSync(
      path.join(process.cwd(), "prisma", "schema.prisma"),
      "utf8",
    );

    const mirrored = [
      "UserRole",
      "UserStatus",
      "StudentStatus",
      "Gender",
      "Specialization",
      "DayOfWeek",
      "AttendanceStatus",
      "AttendanceMethod",
      "SessionStatus",
      "LeaveType",
      "LeaveStatus",
      "CreditOwnerType",
      "CreditEntryType",
      "CreditSource",
      "NotificationType",
    ];

    for (const name of mirrored) {
      const block = schema.match(
        new RegExp(`enum ${name} \\{([^}]*)\\}`, "m"),
      )?.[1];
      expect(block, `enum ${name} not found in schema.prisma`).toBeDefined();

      const values = (block ?? "")
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("//"));

      const specBlock = spec.match(
        new RegExp(
          `    ${name}:\\n      type: string\\n      enum:([\\s\\S]*?)\\n    \\w`,
        ),
      )?.[1];

      for (const value of values) {
        expect(
          specBlock?.includes(value) || spec.includes(`enum: [${value}`),
          `${name}.${value} is missing from openapi.yaml`,
        ).toBeTruthy();
      }
    }
  });
});
