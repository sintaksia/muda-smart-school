#!/usr/bin/env node
/**
 * PostToolUse guardrail.
 *
 * Lints the single file Claude just wrote and feeds any violation straight
 * back to it. Errors (deleted design-system tokens, banned radius/shadows,
 * import-boundary breaks, PrismaClient instantiation) exit 2, which blocks and
 * returns stderr to the model so it corrects the file in the same turn instead
 * of discovering the problem at commit time. Warnings are surfaced but never
 * block.
 *
 * Rules live in eslint.config.mjs — this is only the delivery mechanism.
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const run = promisify(execFile);

const readStdin = async () => {
  let raw = "";
  for await (const chunk of process.stdin) raw += chunk;
  return raw;
};

const main = async () => {
  let payload;
  try {
    payload = JSON.parse((await readStdin()) || "{}");
  } catch {
    process.exit(0); // never break the session on a malformed payload
  }

  const file = payload?.tool_input?.file_path;
  if (!file || !/\.(ts|tsx)$/.test(file)) process.exit(0);
  if (!file.includes(`${process.cwd()}/src/`) && !file.startsWith("src/")) {
    process.exit(0);
  }

  let stdout = "";
  try {
    const res = await run("pnpm", ["exec", "eslint", "--format", "json", file], {
      cwd: process.cwd(),
      timeout: 60_000,
      maxBuffer: 10 * 1024 * 1024,
    });
    stdout = res.stdout;
  } catch (err) {
    // eslint exits non-zero when it finds errors; that is the normal path.
    stdout = err?.stdout ?? "";
    if (!stdout) process.exit(0); // eslint itself failed — don't block work
  }

  let results;
  try {
    results = JSON.parse(stdout);
  } catch {
    process.exit(0);
  }

  const messages = results.flatMap((r) => r.messages ?? []);
  const errors = messages.filter((m) => m.severity === 2);
  const warnings = messages.filter((m) => m.severity === 1);

  const fmt = (m) => `  ${file}:${m.line}:${m.column}  ${m.message} [${m.ruleId ?? "?"}]`;

  if (errors.length) {
    console.error(
      [
        `Guardrail: ${errors.length} error(s) in the file you just wrote.`,
        ...errors.map(fmt),
        "",
        "Fix these before continuing. See docs/design_system.md and CLAUDE.md.",
      ].join("\n"),
    );
    process.exit(2); // blocks, and returns this text to the model
  }

  if (warnings.length) {
    console.log(
      [`Guardrail: ${warnings.length} warning(s) (non-blocking):`, ...warnings.map(fmt)].join("\n"),
    );
  }
  process.exit(0);
};

main().catch(() => process.exit(0));
