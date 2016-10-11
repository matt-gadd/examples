import { assert } from 'chai';
import * as registerSuite from 'intern/lib/interfaces/object';

registerSuite({
	name: 'main',
	'something': function () {
		assert.isTrue(true);
	}
});
