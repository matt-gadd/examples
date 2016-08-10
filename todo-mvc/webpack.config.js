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
		extensions: ['', '.ts', '.tsx', '.js'],
		alias: {
			'dojo-actions': 'dojo-actions/dist/umd',
			'dojo-app': 'dojo-app/dist/umd',
			'dojo-dom': 'dojo-dom/dist/umd',
			'dojo-compose': 'dojo-compose/dist/umd',
			'dojo-routing': 'dojo-routing/dist/umd',
			'dojo-core': 'dojo-core/dist/umd',
			'dojo-shim': 'dojo-shim/dist/umd',
			'dojo-has': 'dojo-has/dist/umd',
			'dojo-widgets': 'dojo-widgets/dist/umd',
			'immutable': 'immutable/dist',
			'maquette': 'maquette/dist',
			'rxjs': '@reactivex/rxjs/dist/amd'
		},
	},
	module: {
		unknownContextRegExp: /$^/,
		unknownContextCritical: false,
		exprContextRegExp: /$^/,
		exprContextCritical: false,
		loaders: [
			{ test: /src\/.*\.ts?$/, loader: 'ts-loader' }
		]
	},
	plugins: [
		new CopyWebpackPlugin([
			{ from: 'src/index.html', to: 'index.html' },
			{ from: 'node_modules/todomvc-common/base.css', to: 'base.css' },
			{ from: 'node_modules/todomvc-app-css/index.css', to: 'index.css' }
		]),
		new webpack.ResolverPlugin([ new webpack.ResolverPlugin.FileAppendPlugin(['/main.js']) ]),
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
