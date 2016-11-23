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
				if (module.rawRequest) {
					if(!module.rawRequest.match(/^\W/)) {
						let modulePath = module.rawRequest;
						let lazy = false;
						if (module.rawRequest.match(/bundle.*\!/)) {
							const afterLoader = module.userRequest.split('!')[1];
							modulePath = stripPath(basePath, afterLoader);
							lazy = true;
						}
						idMap[modulePath] = { id: module.id, lazy };
					}
					else if (module.rawRequest.match(/^\.(\.*)\//) && !module.context.match(/\/node_modules\//)) {
						const modulePath = stripPath(basePath, module.userRequest);
						idMap[modulePath] = { id: module.id, lazy: false };
					}
				}
			});
		});
	});
};

module.exports = GlobalModuleRegistryPlugin;

