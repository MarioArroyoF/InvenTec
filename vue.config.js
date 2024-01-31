module.exports = {
    configureWebpack: {
        resolve: {
            fallback: {
                "crypto": require.resolve("crypto-browserify"),
                "stream": require.resolve("stream-browserify"),
                "dgram": require.resolve("dgram-browserify"),
                "net": require.resolve("net-browserify"),
                "http": require.resolve("stream-http"),
                "https": require.resolve("https-browserify"),
                "timers": require.resolve("timers-browserify"),
                "os": require.resolve("os-browserify/browser"),
                "dns": false, // Depending on your use case
                "constants": require.resolve("constants-browserify"),
                "child_process": false, // Depending on your use case
                "fs": false, // Depending on your use case
                "events": false, // Depending on your use case
                "stream": false, // Depending on your use case
                path: require.resolve('path-browserify'),
                tls: require.resolve("tls"),
                'node:events': require.resolve("events"),
                'node:stream': require.resolve("stream"),
                "querystring": require.resolve("querystring-es3"),
                zlib: require.resolve('browserify-zlib')

            },
        },
    },
};
