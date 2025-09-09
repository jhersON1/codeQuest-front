import { dirname } from "path"
import { fileURLToPath } from "url"
import { FlatCompat } from "@eslint/eslintrc"
import typescriptParser from "@typescript-eslint/parser"
import typescriptEslint from "@typescript-eslint/eslint-plugin"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  {
    ignores: [
      "**/*.swp",
      "**/.vscode",
      ".vscode/settings.json",
      "node_modules",
      ".pnp",
      "**/.pnp.js",
      "coverage",
      ".next/",
      "out/",
      "build",
      "eslint.config.mjs",
      "**/.DS_Store",
      "**/*.pem",
      "**/npm-debug.log*",
      "**/yarn-debug.log*",
      "**/yarn-error.log*",
      "**/.pnpm-debug.log*",
      "**/.env",
      "**/.vercel",
      "**/*.tsbuildinfo",
      "**/next-env.d.ts",
      "**/*.env",
      "**/package-lock.json",
      "**/yarn.lock",
      "**/tsconfig.tsbuildinfo",
      "**/pnpm-lock.yaml",
      "lint-staged.config.mjs",
      "postcss.config.mjs",
      ".jest/**/*.ts",
    ],
  },

  // Next.js configuration
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // TypeScript and React configuration
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "@typescript-eslint": typescriptEslint,
    },
    rules: {
      // TypeScript rules
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          disallowTypeAnnotations: true,
          fixStyle: "inline-type-imports",
        },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      "@next/next/no-img-element": "off",

      // React rules
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",

      // Import rules
      "import/order": [
        "warn",
        {
          groups: ["builtin", "external", "internal", ["parent", "sibling"], "index"],
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
          distinctGroup: true,
          "newlines-between": "always",
        },
      ],

      // project rules
      "no-nested-ternary": "error",
    },
  },

  // JavaScript files
  {
    files: ["**/*.js", "**/*.jsx"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      ecmaFeatures: {
        jsx: true,
      },
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
    },
  },
]

export default eslintConfig
