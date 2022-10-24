const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { NormalModuleReplacementPlugin, IgnorePlugin } = require('webpack');
const CircularDependencyPlugin = require('circular-dependency-plugin');

/**
 * @type {import('webpack').Configuration}
 */
module.exports = {
  entry: './src/index.ts',
  mode: 'development',
  devtool: 'inline-source-map',
  performance: {
    maxAssetSize: 1024 * 1024 * 10,
    maxEntrypointSize: 1024 * 1024 * 5,
  },
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        // exclude: /node_modules/,
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource'
      },
      {
        test: /\.(glsl)$/i,
        type: 'asset/source'
      }
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Test Game',
      template: './src/public/index.html'
    }),
    new NormalModuleReplacementPlugin(
      /environments\/environment\.ts/,
      './environments/prod.environment.ts'
    ),
    new CircularDependencyPlugin({
      exclude: /node_modules/,
      failOnError: true,
      allowAsyncCycles: true,
    })
  ],
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: {
      "fs": require.resolve("browserify-fs"),
      "path": require.resolve("path-browserify"),
      "stream": require.resolve("stream-browserify"),
      "util": require.resolve("util/"),
      "buffer": require.resolve("buffer/")
    }
  },
  // output: {
  //   filename: 'bundle.js',
  //   path: path.resolve(__dirname, 'dist'),
  // },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 9000,
  },
};