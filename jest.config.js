/** @returns {Promise<import('jest').Config>} */

const esModules = [
  'axios',
  'query-string',
  'decode-uri-component',
  'split-on-first',
  'filter-obj',
].join('|');

const config = {
  roots: ['<rootDir>'],
  verbose: true,
  moduleNameMapper: {
    '@/(.*)': '<rootDir>/src/$1',
    '\\.css$': '<rootDir>/tests/__mocks__/styleMock.js',
  },
  moduleDirectories: ['node_modules', 'src'],
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/unit/setup.js'],
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
};

module.exports = config;
