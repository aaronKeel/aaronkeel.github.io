const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    hot: true,
    historyApiFallback: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/templates/base-page.html',
      favicon: 'src/assets/favicon.png',
      filename: 'index.html',
      hash: true,
      chunks: ['index'],
    }),
    new HtmlWebpackPlugin({
      template: 'src/templates/base-page.html',
      favicon: 'src/assets/favicon.png',
      filename: 'triangles.html',
      hash: true,
      chunks: ['triangles'],
    }),
  ],
  entry: {
    index: './src/js/pages/index.js',
    triangles: './src/js/pages/triangles.js',
  },
  output: {
    filename: '[name].[contenthash].bundle.js',
    chunkFilename: '[name].[contenthash].bundle.js',
    path: path.resolve(__dirname),
  },
  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: ['.js', 'jsx'],
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
};
