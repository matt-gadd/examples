function fixMaquetteRoot() {
	const fs = require('fs');
	const fileName = 'node_modules/maquette/dist/maquette.js.map';
	const file = fs.readFileSync(fileName, 'utf8');
	const map = JSON.parse(file);
	return {
		sourcemaps: {
			'/source/maquette.js': map
		}
	}
}

module.exports = function (grunt) {
	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-processhtml');

	grunt.registerTask('remap', function () {
		const sorcery = require('sorcery');
		const target = this.options().dest;
		const done = this.async();

		sorcery.load(target, fixMaquetteRoot())
			.then((chain) => chain.write())
			.then(done);
	});

	require('grunt-dojo2').initConfig(grunt, {
		distFile: '<%= distDirectory %>index.js',
		copy: {
			staticFilesDev: {
				expand: true,
				cwd: '.',
				src: [ 'src/**/*.html' ],
				dest: '<%= devDirectory %>'
			},
			staticFilesDist: {
				files: [
					{
						src: 'node_modules/todomvc-common/base.css',
						dest: '<%= distDirectory %>base.css'
					},
					{
						src: 'node_modules/todomvc-app-css/index.css',
						dest: '<%= distDirectory %>index.css'
					}
				]
			}
		},
		processhtml: {
			dist: {
				files: [
					{
						src: 'src/index.html',
						dest: '<%= distDirectory %>index.html'
					}
				]
			}
		},
		remap: {
			options: {
				dest: '<%= distFile %>'
			}
		},
		requirejs: {
			dist: {
				options: {
					mainConfigFile: '<%= distDirectory %>index.js',
					include: [ 'main' ],
					insertRequire: [ 'main' ],
					out: '<%= distFile %>',
					optimize: 'uglify2',
					skipSemiColonInsertion: true,
					generateSourceMaps: true,
					preserveLicenseComments: false,
					wrap: {
						startFile: [
							'node_modules/dojo-loader/dist/umd/loader.min.js'
						]
					}
				}
			}
		}
	});

	grunt.registerTask('dev', [
		'typings',
		'tslint',
		'clean:dev',
		'ts:dev',
		'copy:staticFilesDev',
		'updateTsconfig'
	]);

	grunt.registerTask('dist', [
		'typings',
		'tslint',
		'clean:dist',
		'ts:dist',
		'rename:sourceMaps',
		'copy:staticFilesDist',
		'processhtml:dist',
		'requirejs:dist',
		'remap'
	]);
};
