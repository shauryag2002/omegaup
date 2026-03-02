module.exports = {
  root: true,
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
  },
  env: {
    jquery: true,
    node: true,
  },
  plugins: ['@typescript-eslint', 'jest-dom'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:jest-dom/recommended',
    // Vue 3 ruleset.
    'plugin:vue/vue3-recommended',
    'prettier',
    'prettier/@typescript-eslint',
    'prettier/vue',
  ],
  rules: {
    // Disabling this rule since inferrable types are still useful to declare
    // for humans.
    '@typescript-eslint/no-inferrable-types': 'off',

    // This rule is just annoying, since it prevents (legitimate) no-op
    // functions from being defined.
    '@typescript-eslint/no-empty-function': 'off',

    // Avoid using bracket type assertions, since those are the old syntax.
    '@typescript-eslint/consistent-type-assertions': 'error',

    // Keep disabled during @vue/compat migration. Remove once all .sync
    // modifiers are converted to v-model:propName.
    'vue/no-deprecated-v-bind-sync': 'off',

    // TODO(#4778): Add key to ALL v-for.
    'vue/require-v-for-key': 'off',

    // Keep disabled during @vue/compat migration. Remove once components
    // are fully migrated to Vue 3 template syntax.
    'vue/no-v-for-template-key-on-child': 'off',

    // TODO: Remove all these exceptions.
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-namespace': 'off',
  },
};
