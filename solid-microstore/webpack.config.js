const webpack = require('webpack');
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")

module.exports = {
  plugins: [
    new NodePolyfillPlugin()
  ]
};
