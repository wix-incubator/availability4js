require('babel-register')({
    presets: ['stage-2', 'es2015'],
    plugins: ['transform-runtime', 'transform-strict-mode']
});
