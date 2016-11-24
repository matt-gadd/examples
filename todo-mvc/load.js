var shimPromise = require('dojo-shim/Promise');
var Promise = shimPromise.default;

module.exports = {
	default: function () {
		var req = __webpack_require__;
		var context = typeof arguments[0] === 'function' ? arguments[0] : function () { return '' };

		var base = context().split('/');
		base.pop();
		base = base.join('/');

		var moduleMetas = [].slice.call(arguments)
			.filter((mid) => typeof mid === 'string')
			.map((mid) => {
				var isRelative = mid.match(/\.\//);
				var result = base;
				if (isRelative) {
					if (mid.match(/^\.\//)) {
						mid = mid.replace(/\.\//, '/');
					}
					var up = mid.match(/^(\.\.\/)/);
					if (up) {
						var chunks = base.split('/');
						chunks.splice(chunks.length - (up.length - 1));
						result = chunks.join('/');
						mid = '/' + mid.replace(/\.\.\//g, '');
					}
					mid = result + mid;
				}
				return mid;
			})
			.map((mid) => __modules__[mid])
			.map((moduleMeta) => {
				if (moduleMeta.lazy) {
					return new Promise((resolve) =>req(moduleMeta.id)(resolve));
				} else {
					return Promise.resolve(req(moduleMeta.id));
				}
			});

		return Promise.all(moduleMetas);
	}
}
