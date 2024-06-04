/** @returns {Promise<import('jest').Config>} */

process.env.VUE_APP_SUPPORTED_LANGUAGES = 'en|pt';
process.env.VUE_APP_VERSION = '0.0.0';
process.env.VUE_APP_BOTHUB_NLP_BASE_URL = 'http://localhost:2657/';
process.env.VUE_APP_BOTHUB_WEBAPP_BASE_URL = 'http://localhost:8080/';

const config = {
  setupFilesAfterEnv: ['./__tests__/jest.setup.js'],
  rootDir: 'src/',
  testEnvironment: 'jsdom',
  testMatch: ['**/__tests__/**/*.spec.js'],
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
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '.*\\.(svg)$': '<rootDir>/tests/__mocks__/fileMock.js',
  },
  transformIgnorePatterns: [],
  automock: false,
};

module.exports = config;
