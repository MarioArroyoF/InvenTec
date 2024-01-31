// webpack.config.js
module.exports = {
    // ...
    externals: {
      'node:events': 'commonjs node:events',
      'node:stream': 'commonjs node:stream',
    },
    plugins: [
        // Work around for Buffer is undefined:
        // https://github.com/webpack/changelog-v5/issues/10
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
        }),
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),
    ],
    // ...
  };
  