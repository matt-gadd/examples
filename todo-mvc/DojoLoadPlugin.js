const ConcatSource = require('webpack-core/lib/ConcatSource');
const NormalModuleReplacementPlugin = require('webpack').NormalModuleReplacementPlugin;
const DojoLoadPlugin = function (options) {
	this.options = options || {};
};

function stripPath(basePath, path) {
	return path.replace(basePath + '/', '').replace(/\..*$/, '');
}

DojoLoadPlugin.prototype.apply = function(compiler) {

	const idMap = {};
	const basePath = compiler.options.resolve.root[0];
	const relative = /^\.(\.*)\//;
	const nodeModules = /\/node_modules\//;
	const bundleLoader = /bundle.*\!/;

	compiler.apply(new NormalModuleReplacementPlugin(/dojo-core\/load\.js/, basePath + '/load.js'));

	compiler.parser.plugin("expression require", function (expr) {
		this.state.current.meta.isPotentialLoad = true;
		return true;
	});

	compiler.plugin('compilation', function(compilation, params) {

		compilation.moduleTemplate.plugin('module', (source, module) => {
			if (module.meta && module.meta.isPotentialLoad) {
				const path = stripPath(basePath, module.userRequest);
				const require = `var require = function() { return '${path}'; };`;
				return new ConcatSource(require, '\n', source);
			}
			const load = idMap['dojo-core/load'] || { id: null };
			module = module || {};
			if (module.id === load.id) {
				const moduleMap = `var __modules__ = ${ JSON.stringify(idMap) };`;
				return new ConcatSource(moduleMap, '\n', source);
			}
			return source;
		});

		compilation.plugin('optimize-module-ids', function(modules) {
			modules.forEach((module) => {
				const { rawRequest, userRequest, context } = module;
				if (rawRequest) {
					if(!rawRequest.match(/^\W/)) {
						let modulePath = rawRequest;
						let lazy = false;
						if (rawRequest.match(bundleLoader)) {
							const afterLoader = userRequest.split('!')[1];
							modulePath = stripPath(basePath, afterLoader);
							lazy = true;
						}
						idMap[modulePath] = { id: module.id, lazy };
					}
					else if (rawRequest.match(relative) && !context.match(nodeModules)) {
						const modulePath = stripPath(basePath, userRequest);
						idMap[modulePath] = { id: module.id, lazy: false };
					}
				}
			});
		});
	});
};

module.exports = DojoLoadPlugin;

