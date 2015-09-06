var path = require('path');

module.exports = function(grunt) {

    grunt.initConfig({
        webpack: {
            all:{
                devtool: 'eval',
                entry: './index',
                output: {
                    path:"dist/",
                    filename:"index.js",
                    libraryTarget: "commonjs2"
                },
                resolve: {
                    extensions: ['', '.js', '.jsx']
                },
                module: {
                    loaders: [
                        {
                        test: /\.json$/,
                        loaders: ['json-loader']
                    },
                    {
                        test: /\.js$/, 
                        loaders: ['babel'],
                    },
                    {
                        test: /\.(png|jpg)$/,
                        loaders: ['url-loader?limit=8192']
                    },
                    {
                        test: /\.css$/,
                        loader: "style-loader!css-loader!less-loader?strictMath!"+__dirname+"/webpack-loaders/css-dir-loader.js!less-loader"
                    }
                    ]
                }
            }
        }
    });
    
    grunt.loadNpmTasks('grunt-webpack');

    grunt.registerTask('default', ['webpack']);
}
