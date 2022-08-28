/* eslint-disable import/no-extraneous-dependencies */
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
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
    new HtmlWebpackPlugin({
      template: 'src/templates/base-page.html',
      favicon: 'src/assets/favicon.png',
      filename: 'triangleScatter.html',
      hash: true,
      chunks: ['triangleScatter'],
    }),
    new HtmlWebpackPlugin({
      template: 'src/templates/base-page.html',
      favicon: 'src/assets/favicon.png',
      filename: 'vertexTriangle.html',
      hash: true,
      chunks: ['vertexTriangle'],
    }),
  ],
  entry: {
    index: './src/js/pages/index.js',
    triangles: './src/js/pages/triangles.js',
    triangleScatter: './src/js/pages/triangleScatter.js',
    vertexTriangle: './src/js/pages/vertexTriangle.js',
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
