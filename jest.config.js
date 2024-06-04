/** @returns {Promise<import('jest').Config>} */

const esModules = [
  'axios',
  'query-string',
  'decode-uri-component',
  'split-on-first',
  'filter-obj',
].join('|');

process.env.VUE_APP_SUPPORTED_LANGUAGES = 'en|pt';
process.env.VUE_APP_VERSION = '0.0.0';
process.env.VUE_APP_BOTHUB_NLP_BASE_URL = 'http://localhost:2657/';
process.env.VUE_APP_BOTHUB_WEBAPP_BASE_URL = 'http://localhost:8080/';

const config = {
  setupFilesAfterEnv: ['./__tests__/jest.setup.js'],
  rootDir: 'src/',
  testMatch: ['**/__tests__/**/*.spec.js'],
  verbose: true,
  moduleNameMapper: {
    '@/(.*)': '<rootDir>/$1',
    '\\.css$': '<rootDir>/tests/__mocks__/styleMock.js',
  },
  moduleDirectories: ['node_modules', 'src'],
  testEnvironment: 'jsdom',
  transformIgnorePatterns: [`/node_modules/(?!${esModules})`],
  moduleFileExtensions: [
    'js',
    'json',
    // tell Jest to handle `*.vue` files
    'vue',
  ],
  transform: {
    // process `*.vue` files with `vue-jest`
    '.*\\.(vue)$': 'vue-jest',
    '.*\\.(js)$': 'babel-jest',
  },
  automock: false,
};

module.exports = config;
