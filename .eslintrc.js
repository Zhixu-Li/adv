

// module.exports = {
//   root: true,
//   env: {
//     browser: true,
//     node: true,
//     es6: true, //this tells ESlint "yes, Promises are allowed"
//   },
//   parser: 'vue-eslint-parser',
//   parserOptions: {
//     parser: 'espree',
//     ecmaVersion: 2021, // ✅ Allows async/await, Promise, etc.
//     sourceType: 'module'
//   },
//   extends: [
//     "eslint:recommended",
//     "plugin:vue/vue3-recommended"  // Use this if "vue3-recommended" fails
//   ],
//   rules: {
//     "vue/multi-word-component-names": "off",
//     "vue/first-attribute-linebreak": "off",           // 🔕 disables the linebreak warning
//     "vue/html-indent": "off",                     
//   },
// };
// module.exports = {
//   root: true,
//   env: {
//     browser: true,
//     node: true,
//     es6: true,
//   },
//   parser: 'vue-eslint-parser',
//   parserOptions: {
//     parser: 'espree',
//     ecmaVersion: 2021,
//     sourceType: 'module'
//   },
//   extends: [
//     'eslint:recommended',
//     'plugin:vue/vue3-recommended', // ✅ For Vue 3 projects
//   ],
//   rules: {
//     // Suppress annoying rules
//     'vue/multi-word-component-names': 'off',
//     'vue/first-attribute-linebreak': 'off',
//     'vue/html-indent': 'off',

//     // Optional: other stylistic rules
//     // 'vue/max-attributes-per-line': ['warn', { singleline: 3 }],
//     // 'vue/html-self-closing': ['warn'],
//   }
// }
module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: 'espree', // You can switch to 'babel-eslint' or '@babel/eslint-parser' if needed
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  extends: [
    'eslint:recommended',
    // 'plugin:vue/vue3-recommended' // ✅ For Vue 3
  ],
  rules: {
    // ✅ Suppress specific template warnings you reported
    'vue/multi-word-component-names': 'off',
    'vue/first-attribute-linebreak': 'off',
    'vue/html-indent': 'off',

    // Optional: Tweak this if you want less aggressive formatting
    // 'vue/max-attributes-per-line': ['warn', { singleline: 3 }],
    // 'vue/singleline-html-element-content-newline': 'off',
  }
}
