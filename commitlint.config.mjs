/** @type {import('@commitlint/types').UserConfig} */
const config = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat", // new feature
        "fix", // bug fix
        "docs", // documentation
        "style", // formatting, missing semicolons, etc
        "refactor", // code restructure without feature/fix
        "perf", // performance improvements
        "test", // adding tests
        "chore", // build process, dependencies
        "revert", // revert a commit
        "ci", // CI/CD changes
      ],
    ],
    "subject-case": [2, "always", "lower-case"],
    "subject-empty": [2, "never"],
    "type-empty": [2, "never"],
  },
};

export default config;
