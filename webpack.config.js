module.exports = {
    entry: [
        './index'
    ],
    output: {
        path: 'dist/',
        filename: 'index.js',
        libraryTarget: 'commonjs',
    },
    externals: ['moment', 'moment-timezone'],
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel'
            }
        ]
    }
}
