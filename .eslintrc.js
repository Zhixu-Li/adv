

module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true, //this tells ESlint "yes, Promises are allowed"
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: 'espree',
    ecmaVersion: 2021, // ✅ Allows async/await, Promise, etc.
    sourceType: 'module'
  },
  extends: [
    "eslint:recommended",
    "plugin:vue/recommended"  // Use this if "vue3-recommended" fails
  ],
  rules: {
    "vue/multi-word-component-names": "off"
  },
};
