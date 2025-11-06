import globals from "globals";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import vueParser from "vue-eslint-parser";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: [
      "**/.nuxt/**",
      "**/node_modules/**",
      "**/.output/**",
      "**/dist/**",
      "**/.git/**",
      "stylelint.config.cjs",
    ],
  },
  ...tseslint.configs.recommendedTypeChecked,
  pluginVue.configs["flat/recommended"],
  {
    files: ["**/*.{ts,tsx,cts,mts,js,jsx,cjs,mjs}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ["./tsconfig.eslint.json"],
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        defineAppConfig: "readonly",
        defineNuxtConfig: "readonly",
        definePageMeta: "readonly",
        defineOptions: "readonly",
        useRoute: "readonly",
      },
    },
    rules: {
      "vue/multi-word-component-names": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
    },
  },
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        project: ["./tsconfig.eslint.json"],
        extraFileExtensions: [".vue"],
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        defineAppConfig: "readonly",
        defineNuxtConfig: "readonly",
        definePageMeta: "readonly",
        defineOptions: "readonly",
        useRoute: "readonly",
      },
    },
    plugins: {
      vue: pluginVue,
    },
    rules: {
      "vue/multi-word-component-names": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
    },
  },
]);
