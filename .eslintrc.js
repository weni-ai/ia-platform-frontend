module.exports = {
  "root": true,
  "env": {
    "node": true
  },
  "extends": [
    "plugin:vue/essential",
    "eslint:recommended"
  ],
  "parserOptions": {
    "parser": "@babel/eslint-parser"
  },
  "rules": {
    'vue/multi-word-component-names': 'off',
    'vue/no-unused-components': 'off',
    'vue/no-mutating-props': 'off',
    'vue/valid-next-tick': 'off',
    'no-unused-vars': 'off',
    'no-undef': 'off'
  }
};
