const webpack = require('webpack');
const RequirePlugin = require('umd-compat-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
	entry: './src/main.ts',
	debug: true,
	devtool: 'source-map',
	target: 'node',
	resolve: {
		root: __dirname,
		extensions: ['', '.ts', '.tsx', '.js']
	},
	module: {
		unknownContextRegExp: /$^/,
		unknownContextCritical: false,
		exprContextRegExp: /$^/,
		exprContextCritical: false,
		loaders: [
			{ test: /src\/.*\.ts?$/, loader: 'ts-loader' }
		],
		preLoaders: [
			{
				test: /dojo-.*\.js$/,
				loader: "source-map-loader"
			}
		]
	},
	plugins: [
		new CopyWebpackPlugin([
			{ from: 'src/index.html', to: 'index.html' },
			{ from: 'node_modules/todomvc-common/base.css', to: 'base.css' },
			{ from: 'node_modules/todomvc-app-css/index.css', to: 'index.css' }
		]),
		new RequirePlugin(),
		new webpack.IgnorePlugin(/examples/),
		new webpack.optimize.DedupePlugin(),
		new webpack.optimize.UglifyJsPlugin({ compress: { warnings: false }})
	],
	output: {
		path: './dist',
		filename: 'main.js',
	}
};
