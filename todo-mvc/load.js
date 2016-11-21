const shimPromise = require('dojo-shim/Promise');
const Promise = shimPromise.default;

module.exports = {
	default: function (id) {
		const moduleMeta = __modules__[id];
		if (moduleMeta.lazy) {
			return new Promise((resolve) => {
				__webpack_require__(moduleMeta.id)((result) => {
					resolve([result]);
				});
			})
		}
		else {
			return Promise.resolve([__webpack_require__(moduleMeta.id)]);
		}
	}
}
