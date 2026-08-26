import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import tailwindcss from "eslint-plugin-tailwindcss";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    plugins: { tailwindcss },
    settings: {
      tailwindcss: {
        cssConfigPath: "./src/app/globals.css",
      },
    },
    rules: {
      "tailwindcss/no-custom-classname": "off", // allow non-tailwind utility classes if needed
      "tailwindcss/enforces-shorthand": "warn",
    },
  },
]);

export default eslintConfig;
