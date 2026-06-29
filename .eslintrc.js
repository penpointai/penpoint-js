module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest', // Use 'latest' to avoid updating this year after year
    sourceType: 'module',
    project: './tsconfig.json', // Enables type-aware linting
  },
  plugins: ['@typescript-eslint', 'jest'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended', // Use the plugin-scoped version
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:jest/recommended',
    // This must be the last item. It does two things:
    // 1. Disables ESLint rules that conflict with Prettier.
    // 2. Adds the Prettier plugin and enables the `prettier/prettier` rule.
    'plugin:prettier/recommended',
  ],
  rules: {
    // Your custom rules are good. You can keep them as is.
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    // Add any other specific overrides you need here.
  },
  env: {
    node: true,
    jest: true,
  },
  // Tells ESLint to ignore build output, node_modules, and generated SDK code
  // (src/generated/* is emitted by openapi-typescript and is not hand-formatted).
  ignorePatterns: ['dist/', 'node_modules/', '.eslintrc.js', 'src/generated/'],
};