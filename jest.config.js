const babelConfig = {
  presets: [
    [
      '@babel/preset-env',
      {
        corejs: 3,
        modules: false,
        useBuiltIns: 'entry',
        targets: {
          esmodules: false,
          node: 'current',
        },
      },
    ],
  ],
  plugins: [
    '@babel/plugin-transform-async-to-generator',
    '@babel/plugin-transform-modules-commonjs',
    '@babel/plugin-proposal-class-properties',
    ['@babel/plugin-transform-typescript', { allowNamespaces: true }],
  ],
};

module.exports = {
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'ts', 'vue'],
  moduleDirectories: ['node_modules'],
  moduleNameMapper: {
    '^vue$': '@vue/compat',
    '^@/(.*)$': '<rootDir>/frontend/www/$1',
    '\\.(css|less)$':
      '<rootDir>/frontend/www/js/omegaup/__mocks__/styleMock.js',
    'monaco-editor':
      '<rootDir>/frontend/www/third_party/js/__mocks__/monacoEditor.js',
    sugar: '<rootDir>/frontend/www/js/omegaup/__mocks__/sugar.js',
  },
  setupFilesAfterEnv: ['<rootDir>/frontend/www/js/omegaup/test.setup.ts'],
  transform: {
    '.*\\.vue$': [
      '@vue/vue3-jest',
      {
        babelConfig,
      },
    ],
    '.*\\.[jt]sx?$': ['babel-jest', babelConfig],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(vue-.*|@vue/.*|monaco-editor|monaco-editor-core)/)',
  ],
  testEnvironmentOptions: {
    url: 'http://localhost:8001/',
  },
};
