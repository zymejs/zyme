const TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const TSLintPlugin = require('tslint-webpack-plugin');

module.exports = {
    mode: 'development',
    resolve: {
        extensions: ['.ts', '.js', '.vue'],
        plugins: [new TsConfigPathsPlugin()]
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: require.resolve('ts-loader'),
                options: {
                    appendTsSuffixTo: [/\.vue$/]
                }
            },
            {
                test: /\.vue$/,
                loader: require.resolve('vue-loader')
            }
        ]
    },
    stats: {
        errorDetails: true
    },
    plugins: [
        new VueLoaderPlugin(),
        new TSLintPlugin({
            files: ['./src/**/*.ts', './test/**/*.ts']
        })
    ],
    devtool: 'inline-source-map'
};
