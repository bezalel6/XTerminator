const webpack = require('webpack');
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const srcDir = path.join(__dirname, '..', 'src');

// Export a function that returns the configuration
module.exports = (env = {}, argv = {}) => {
  // Default to development if mode is not specified
  const isProd = argv.mode === 'production';
  const manifestFile = isProd ? 'manifest.json' : 'manifest.dev.json';

  return {
    entry: {
      popup: path.join(srcDir, 'popup', 'popup.tsx'),
      options: path.join(srcDir, 'options.tsx'),
      content_script: path.join(srcDir, 'content_script', 'index.tsx'),
      background: path.join(srcDir, 'background.ts'),
    },
    output: {
      path: path.join(__dirname, '../dist'),
      filename: 'js/[name].js',
    },
    optimization: {
      // Disable code splitting
      splitChunks: false,
      // Preserve modules
      moduleIds: 'named',
      chunkIds: 'named',
      // Add development-specific optimizations
      ...(isProd
        ? {}
        : {
            removeAvailableModules: false,
            removeEmptyChunks: false,
            splitChunks: false,
          }),
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: {
            loader: 'ts-loader',
            options: {
              // Add transpileOnly for faster builds in development
              ...(isProd ? {} : { transpileOnly: true }),
            },
          },
          exclude: /node_modules/,
        },
        {
          test: /\.js$/,
          include: /node_modules\/lit-html/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            },
          },
        },
      ],
    },
    devtool: false,
    resolve: {
      extensions: ['.ts', '.tsx', '.js'],
      modules: [srcDir, 'node_modules'],
      alias: {
        lib: path.join(srcDir, 'lib'),
        'lit-html': path.resolve(__dirname, '../node_modules/lit-html/'),
        'lit-html/directives/': path.resolve(__dirname, '../node_modules/lit-html/directives/'),
        'lit-element': path.resolve(__dirname, '../node_modules/lit-element/lit-element.js'),
      },
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          {
            from: '.',
            to: './',
            context: 'public',
            globOptions: {
              ignore: ['**/manifest*.json'],
            },
          },
          {
            from: manifestFile,
            to: 'manifest.json',
            context: 'public',
          },
        ],
        options: {},
      }),
      // Add environment variables to make manifest type accessible in code if needed
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(isProd ? 'production' : 'development'),
        'process.env.MANIFEST_TYPE': JSON.stringify(isProd ? 'production' : 'development'),
        'process.env.IS_PRODUCTION': JSON.stringify(isProd),
      }),
    ],
  };
};
