#!/usr/bin/env node
/**
 * PreToolUse color contract.
 *
 * The ESLint guardrails catch *written* class names. They cannot catch the
 * failure that actually ships bad color: picking a shadcn `variant` whose
 * hover resolves, three indirections later, to a hue nobody intended
 * (`ghost` -> `hover:bg-accent` -> `--accent` -> `--accent-500` -> #3b82f6).
 *
 * So instead of blocking, this hook *injects the answer* before the write
 * happens: it parses src/app/globals.css live and hands Claude the resolved
 * value of every semantic token, plus a warning for any token that resolves to
 * an off-palette hue. Checking the palette stops being a step you can skip.
 *
 * Fires only on .tsx under src/ whose pending content mentions color.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";

const PROJECT = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
const CSS = path.join(PROJECT, "src/app/globals.css");

/** Semantic tokens a component author actually reaches for. */
const SEMANTIC = [
  "background",
  "foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "border",
  "input",
  "ring",
];

/** Tailwind-ish class fragments that mean "this edit is making a color call". */
const COLOR_SIGNAL =
  /className|classname|\bcva\(|variant=|\b(bg|text|border|ring|from|via|to)-|hover:|--[a-z-]*color/i;

const exitQuiet = () => process.exit(0);

const readStdin = async () => {
  let raw = "";
  for await (const chunk of process.stdin) raw += chunk;
  return raw;
};

/** Pull `--name: value;` pairs out of one CSS block. */
const parseBlock = (css, selector) => {
  const start = css.indexOf(selector);
  if (start === -1) return {};
  const open = css.indexOf("{", start);
  const end = css.indexOf("\n}", open);
  const body = css.slice(open, end === -1 ? undefined : end);
  const vars = {};
  for (const m of body.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
    vars[m[1]] = m[2].trim();
  }
  return vars;
};

/** Follow `var(--x)` chains to a literal color. */
const resolve = (vars, name, depth = 0) => {
  const raw = vars[name];
  if (!raw || depth > 8) return raw ?? null;
  const ref = raw.match(/^var\(--([\w-]+)\)$/);
  return ref ? resolve(vars, ref[1], depth + 1) : raw;
};

/**
 * Which ramp a literal belongs to, by exact membership — NOT by hue distance.
 * Hue geometry is too blunt here: navy #32368C sits ~20deg from blue #3b82f6,
 * so any tolerance loose enough for the ends of the navy ramp also waves the
 * blue through. globals.css already declares the ramps; ask it.
 */
const BRAND_RAMPS = new Set(["primary", "green", "yellow"]);
const NEUTRAL_RAMPS = new Set(["neutral"]);

/** Tokens deliberately outside the brand ramps. */
const EXEMPT = new Set(["destructive", "destructive-foreground"]);

const buildRampIndex = (vars) => {
  const index = new Map(); // "#hex" -> Set(ramp names)
  for (const [name, value] of Object.entries(vars)) {
    const m = /^([a-z]+)-(\d{2,3})$/.exec(name);
    if (!m) continue;
    const hex = value.trim().toLowerCase();
    if (!index.has(hex)) index.set(hex, new Set());
    index.get(hex).add(m[1]);
  }
  return index;
};

const BARE = new Set(["#ffffff", "#000000", "transparent"]);

/** Returns a reason string when the token is off-system, else null. */
const offPaletteReason = (token, value, index) => {
  if (EXEMPT.has(token)) return null;
  const hex = (value ?? "").trim().toLowerCase();
  if (BARE.has(hex)) return null;

  const ramps = index.get(hex);
  if (!ramps) return null; // one-off literal, not part of any ramp — leave it
  const names = [...ramps];
  if (names.some((r) => BRAND_RAMPS.has(r) || NEUTRAL_RAMPS.has(r))) return null;
  return `from the \`${names.join("/")}\` ramp, which is not a brand ramp`;
};

const main = async () => {
  let payload;
  try {
    payload = JSON.parse((await readStdin()) || "{}");
  } catch {
    exitQuiet();
  }

  const input = payload?.tool_input ?? {};
  const file = input.file_path ?? "";
  if (!/\.tsx$/.test(file)) exitQuiet();
  if (!file.includes(`${path.sep}src${path.sep}`)) exitQuiet();

  const pending = [input.content, input.new_string, input.old_string]
    .filter((v) => typeof v === "string")
    .join("\n");
  if (pending && !COLOR_SIGNAL.test(pending)) exitQuiet();

  let css;
  try {
    css = await readFile(CSS, "utf8");
  } catch {
    exitQuiet();
  }

  const vars = { ...parseBlock(css, ":root"), ...parseBlock(css, "@theme") };
  const rampIndex = buildRampIndex(vars);
  const lines = [];
  const offenders = [];

  for (const token of SEMANTIC) {
    const value = resolve(vars, token);
    if (!value) continue;
    const raw = vars[token];
    const via = raw && raw !== value ? ` (via ${raw})` : "";
    const reason = offPaletteReason(token, value, rampIndex);
    if (reason) offenders.push(`--${token} (${reason})`);
    lines.push(`  --${token}: ${value}${via}${reason ? "  <-- OFF-PALETTE" : ""}`);
  }

  const context = [
    "DESIGN COLOR CONTRACT (resolved live from src/app/globals.css).",
    "You are about to write color into a .tsx file. Use these values, do not guess:",
    "",
    ...lines,
    "",
    "Brand hues are ONLY: primary navy #32368C, green #4CAF93, yellow #F2C94C.",
    "`--destructive` is the one sanctioned red. See docs/design_system.md.",
    offenders.length
      ? [
          "",
          `WARNING — off-system semantic token(s): ${offenders.join("; ")}.`,
          "shadcn's `ghost` and `outline` variants hover with `bg-accent`/`text-accent-foreground`,",
          "so any button using them inherits that hue. If you need a different hover, pass an",
          "explicit `hover:bg-*` — className wins over the variant via tailwind-merge.",
        ].join("\n")
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        additionalContext: context,
      },
    }),
  );
  process.exit(0);
};

main().catch(() => process.exit(0));
