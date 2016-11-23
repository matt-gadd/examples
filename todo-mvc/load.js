var shimPromise = require('dojo-shim/Promise');
var Promise = shimPromise.default;

module.exports = {
	default: function () {
		var req = __webpack_require__;
		var moduleMetas = [].slice.call(arguments)
			.filter((mid) => typeof mid === 'string')
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
