const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const getGitHash = () => {
    const gitDirectory = path.resolve(__dirname, '.git');
    const head = fs.readFileSync(path.join(gitDirectory, 'HEAD'), 'utf8').trim();
    if (!head.startsWith('ref: ')) {
        return head.substring(0, 7);
    }

    const ref = head.substring(5);
    const looseRef = path.join(gitDirectory, ref);
    if (fs.existsSync(looseRef)) {
        return fs.readFileSync(looseRef, 'utf8').trim().substring(0, 7);
    }

    const packedRefs = fs.readFileSync(path.join(gitDirectory, 'packed-refs'), 'utf8');
    const packedRef = packedRefs.split('\n').find(line => line.endsWith(` ${ref}`));
    return packedRef ? packedRef.substring(0, 7) : 'unknown';
};

module.exports = (env = {}) => {
    const pkg = require('./package.json');
    const githash = getGitHash();

    return {
        mode: env.production ? 'production' : 'development',
        entry: {
            'bundle/husky-range': './workspace/src/bundle/husky-range.js',
            'bundle/base': './workspace/src/bundle/base.js',
            'bundle/extra': './workspace/src/bundle/extra.js',
            'bundle/lazy': './workspace/src/bundle/lazy.js',
            'bundle/index': './workspace/src/bundle/index.js',
            'smarteditor2': './workspace/src/bundle/index.js'
        },
        output: {
            filename: 'js/[name].js',
            path: path.resolve(__dirname, 'dist')
        },
        module: {
            rules: [
                {
                    test: /bundle\/.*\.js$/,
                    exclude: [
                        /node_modules/,
                    ],
                    query: {
                        presets: [
                            ['env', {
                                targets: {
                                    browsers: ['> 0.5%', 'not ie <= 11']
                                },
                                loose: true
                            }]
                        ],
                        "plugins": []
                    },
                    loader: "babel-loader"
                }
            ]
        },
        plugins: [
            new CleanWebpackPlugin(),
            new CopyWebpackPlugin([
                'workspace/static',
                {
                    from: 'node_modules/jquery/dist/jquery.min.js',
                    to: 'js/lib/jquery.min.js'
                }
            ]),
            new webpack.DefinePlugin({
                __VERSION__: JSON.stringify(pkg.version),
                __HASH__: JSON.stringify(githash)
            }),
            new webpack.BannerPlugin('Copyright (C) NAVER corp. Licensed under LGPL v2. @see https://github.com/naver/smarteditor2/blob/master/LICENSE.md')
        ],
        optimization: {
            minimizer: [new UglifyJsPlugin()]
        },
        devServer: {
            contentBase: path.join(__dirname, 'dist'),
            openPage: 'SmartEditor2.html'
        }
    };
};
