const webpack = require('webpack');
// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
const MomentTimezoneDataPlugin = require('moment-timezone-data-webpack-plugin');

module.exports = {
  
  devServer: {
    proxy: 'https://aws.adverpost.com/'
  },
  transpileDependencies: [
    /\bvue-awesome\b/
  ],
  configureWebpack: {
    devtool: 'source-map',
    plugins: [
      new MomentLocalesPlugin(),
      // new BundleAnalyzerPlugin(),
      new MomentTimezoneDataPlugin({
        startYear: 2016
      }),
      new webpack.ProvidePlugin({
        $: "jquery",
        jQuery: "jquery",
        "window.jQuery": "jquery",
        Popper: ['@popperjs/core', 'default'], // ✅ Updated for Bootstrap 5
      })
    ],
    resolve: {
      alias: {
        ...require('./aliases.config').webpack,
        "vue$": "vue/dist/vue.esm-bundler.js" // ✅ Native Vue 3 support
      }
    }
  },
  chainWebpack: config => {
    config.resolve.alias.set("vue$", "vue/dist/vue.esm-bundler.js"); // ✅ Vue 3 build
  },
  css: {
    sourceMap: true
  }
};
new webpack.DefinePlugin({
  __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false),
  __VUE_OPTIONS_API__: JSON.stringify(true),
  __VUE_PROD_DEVTOOLS__: JSON.stringify(false)
})