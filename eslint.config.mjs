import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * Project guardrails — see docs/design_system.md and CLAUDE.md.
 *
 * The machine-checkable subset of the project rules, so the design system and
 * architecture boundaries hold without depending on anyone (human or AI)
 * remembering to read the docs.
 *
 * HARD rules are errors and have zero violations today — if one fires it is a
 * real regression, not pre-existing debt. SOFT rules are warnings because the
 * correct fix needs judgment.
 */

/** Class strings that must never appear. */
const BANNED_CLASSES = [
  {
    // The radius ceiling is 20px (rounded-lg). Anything larger is out of system.
    re: /\brounded-(xl|2xl|3xl|4xl)\b/,
    msg: "Radius out of system. Use rounded-sm (10px: inputs, chips, buttons, icon tiles), rounded-md (16px: cards), or rounded-lg (20px: modals, hero media). — docs/design_system.md §4",
  },
  {
    re: /\brounded-(input|card|modal)\b/,
    msg: "rounded-input/card/modal were deleted from globals.css. Use rounded-sm / rounded-md / rounded-lg. — docs/design_system.md §4.1",
  },
  {
    // (?<![a-z-]) keeps `drop-shadow-lg` legal: that is a filter, not elevation.
    re: /(?<![a-z-])shadow-(lg|xl|2xl|2lg)\b/,
    msg: "Oversized shadow. Elevation is hairline-first: resting cards use `border border-border`, hoverable cards add `hover:shadow-sm`, overlays use `shadow-md`. — docs/design_system.md §5",
  },
  {
    re: /\bshadow-(primary|yellow|green|red|blue|teal|brand)-[0-9]/,
    msg: "Colored shadows are banned. Only shadow-xs / shadow-sm / shadow-md exist. — docs/design_system.md §5",
  },
  {
    re: /\b(bg|text|border|from|to|via|ring|fill|stroke|accent|divide|outline)-(brand|teal|surface|hairline|ink|success|warning|danger|info)\b/,
    msg: "Deleted Jago token. Map it — brand→primary-900/800/950, teal→green, ink→foreground, ink-secondary→neutral-600, ink-muted→muted-foreground, hairline→border, surface→muted, danger→destructive, warning→yellow-600, success→green-600. — docs/design_system.md §2.3",
  },
  {
    re: /var\(--(color-(brand|teal|surface|hairline|ink|success|warning|danger|info)|radius-(input|card|modal)|shadow-(card|modal|hover))/,
    msg: "This CSS variable was deleted from globals.css and now resolves to nothing, rendering the element unstyled. — docs/design_system.md §1",
  },
];

/** Needs judgment to fix — flagged, never blocked. */
const SOFT_CLASSES = [
  {
    re: /\b(bg|text|border|from|to|via)-(blue|indigo|purple|violet|pink|emerald|cyan|amber|orange|rose|sky|lime)-[0-9]/,
    msg: "Off-palette hue. The system is primary / green / yellow plus semantic tokens. Legitimate exceptions — third-party brand colors, categorical encoding in *Columns.tsx, red-* destructive affordances — are listed in docs/design_system.md §2.4. If this is one of them, add an eslint-disable-next-line with a reason.",
  },
];

/** Reports any listed pattern found in a string literal or template chunk, so
 *  className, cn(...), cva() bases and extracted constants are all covered. */
const makeClassRule = (patterns, description) => ({
  meta: { type: "problem", docs: { description }, schema: [] },
  create(context) {
    const check = (node, text) => {
      if (typeof text !== "string") return;
      // Report every violation on the node, not just the first — otherwise a
      // class string with three problems takes three fix-and-relint rounds.
      for (const { re, msg } of patterns) {
        if (re.test(text)) context.report({ node, message: msg });
      }
    };
    return {
      Literal: (node) => check(node, node.value),
      TemplateElement: (node) => check(node, node.value?.raw),
    };
  },
});

const ds = {
  rules: {
    "banned-classes": makeClassRule(
      BANNED_CLASSES,
      "Disallow class names removed from the design system",
    ),
    "off-palette": makeClassRule(
      SOFT_CLASSES,
      "Flag hues outside the brand palette",
    ),
  },
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "next-env.d.ts",
  ]),

  // ---- Design system ----
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { ds },
    rules: {
      "ds/banned-classes": "error",
      "ds/off-palette": "warn",
    },
  },

  // ---- Architecture: component size (CLAUDE.md "split over 150 lines") ----
  // 63 files exceed this today, so it stays a warning until they are split.
  {
    files: ["src/**/*.tsx"],
    rules: {
      "max-lines": [
        "warn",
        { max: 150, skipBlankLines: true, skipComments: true },
      ],
    },
  },

  // ---- Architecture: import boundaries ----
  // features/ is domain logic; it must not reach up into a route.
  // Type-only imports stay legal so shared types don't force a premature move.
  {
    files: ["src/features/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/src/app/*", "@/src/app/**"],
              message:
                "features/ must not import from app/. Move the shared code into features/ or components/ instead. Type-only imports are allowed.",
              allowTypeImports: true,
            },
          ],
        },
      ],
    },
  },
  // components/ is global-shared: no route imports, no feature coupling.
  {
    files: ["src/components/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/src/app/*", "@/src/app/**"],
              message:
                "components/ is global-shared and must not import from app/. Type-only imports are allowed.",
              allowTypeImports: true,
            },
            {
              group: ["@/src/features/*", "@/src/features/**"],
              message:
                "components/ is global-shared and must not depend on one feature. If it needs feature logic it belongs in features/[feature]/components/. Type-only imports are allowed.",
              allowTypeImports: true,
            },
          ],
        },
      ],
    },
  },

  // ---- Architecture: Prisma singleton ----
  // prisma/seed.ts is outside src/ and legitimately builds its own client.
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/lib/prisma.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: 'NewExpression[callee.name="PrismaClient"]',
          message:
            "Use the singleton: import { prisma } from '@/src/lib/prisma'. Instantiating PrismaClient per-module exhausts the connection pool.",
        },
      ],
    },
  },

  // ---- Tests: relax structural limits ----
  {
    files: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"],
    rules: { "max-lines": "off" },
  },
]);

export default eslintConfig;
