const webpack = require('webpack');
const UMDCompatPlugin = require('umd-compat-webpack-plugin');

module.exports = {
	entry: './_build/src/main.js',
	debug: true,
	devtool: 'cheap-module-source-map',
	target: 'node',
	extensions: ['', '.js'],
	resolve: {
		root: __dirname,
		modulesDirectories: ['node_modules'],
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
	plugins: [
		new UMDCompatPlugin(),
		new webpack.ResolverPlugin([
			new webpack.ResolverPlugin.FileAppendPlugin(['/main.js'])
		]),
		new webpack.IgnorePlugin(/examples/),
		new webpack.optimize.UglifyJsPlugin()
	],
	output: {
		path: './_build/dist',
		filename: 'index.js',
	}
};
