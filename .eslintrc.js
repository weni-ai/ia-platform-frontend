module.exports = {
  root: true,
  env: {
    es2021: true,
  },
  extends: ['@weni/eslint-config/vue2'],
  rules: {
    'vue/multi-word-component-names': 'off',
    'vue/no-unused-components': 'off',
    'vue/no-mutating-props': 'off',
    'vue/valid-next-tick': 'off',
    'no-unused-vars': 'off',
    'no-undef': 'off',
  },
};
