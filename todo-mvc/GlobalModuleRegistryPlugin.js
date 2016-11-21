const ConcatSource = require("webpack-core/lib/ConcatSource");
const GlobalModuleRegistryPlugin = function (options) {
	this.options = options || {};
};

GlobalModuleRegistryPlugin.prototype.apply = function(compiler) {

	const idMap = {};
	const basePath = this.options.basePath;

	compiler.plugin('compilation', function(compilation, params) {
		compilation.plugin("optimize-chunk-assets", function(chunks, callback) {
			chunks.forEach((chunk) => {
				if (!chunk.initial) return;
				chunk.files.forEach(function(file) {
					const source = `__modules__ = ${ JSON.stringify(idMap) };`;
					compilation.assets[file] = new ConcatSource(source, '\n', compilation.assets[file]);
				});
			});
			callback();
		});
		compilation.plugin('optimize-module-ids', function(modules) {
			modules.forEach((module) => {
				if (module.rawRequest) {
					if(!module.rawRequest.match(/^\W/)) {
						let modulePath = module.rawRequest;
						let lazy = false;
						if (module.rawRequest.match(/^bundle\!/)) {
							const afterLoader = module.userRequest.split('!')[1];
							modulePath = afterLoader.replace(basePath + '/', '').replace(/\..*$/, '');
							lazy = true;
						}
						idMap[modulePath] = { id: module.id, lazy };
					}
					else if (module.rawRequest.match(/^\.(\.*)\//) && !module.context.match(/\/node_modules\//)) {
						const modulePath = module.userRequest.replace(basePath + '/', '').replace(/\..*$/, '');
						idMap[modulePath] = { id: module.id, lazy: false };
					}
				}
			});
		});
	});
};

module.exports = GlobalModuleRegistryPlugin;

