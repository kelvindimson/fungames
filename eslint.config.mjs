import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
// import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import importPlugin from "eslint-plugin-import";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";
import prettierPlugin from "eslint-plugin-prettier";
import onlyWarn from "eslint-plugin-only-warn";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // Global ignores
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/**",
    "public/**",
    "coverage/**",
    "**/*.json",
    "**/*.js",
    "**/*.mjs",
    "**/*.d.ts",
  ]),

  // Your custom config
  {
    plugins: {
      import: importPlugin,
      "simple-import-sort": simpleImportSort,
      "only-warn": onlyWarn,
      "unused-imports": unusedImports,
      prettier: prettierPlugin,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
    },
    rules: {
      // React rules
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",

      // Import sorting
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",

      // Unused imports/vars
      "no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],

      // Import plugin rules
      "import/no-named-as-default": "off",
      "import/no-default-export": "off",
      "import/no-unresolved": "off",
      "import/namespace": [2, { allowComputed: true }],
      "import/no-extraneous-dependencies": "off",

      // TypeScript rules
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-namespace": "off",
      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/restrict-plus-operands": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/strict-boolean-expressions": "off",
      "@typescript-eslint/no-explicit-any": "off",

      // Other rules
      "prefer-const": "off",
      "jsx-a11y/click-events-have-key-events": "off",
      "react-hooks/exhaustive-deps": "off",
    },
  },
]);

export default eslintConfig;