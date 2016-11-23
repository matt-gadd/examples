const ConcatSource = require("webpack-core/lib/ConcatSource");
const GlobalModuleRegistryPlugin = function (options) {
	this.options = options || {};
};

function stripPath(basePath, path) {
	return path.replace(basePath + '/', '').replace(/\..*$/, '');
}

GlobalModuleRegistryPlugin.prototype.apply = function(compiler) {

	const idMap = {};
	const basePath = this.options.basePath;
	const relative = /^\.(\.*)\//;
	const nodeModules = /\/node_modules\//;
	const bundleLoader = /bundle.*\!/;

	compiler.plugin('compilation', function(compilation, params) {

		compilation.moduleTemplate.plugin('module', (source, module) => {
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

module.exports = GlobalModuleRegistryPlugin;

