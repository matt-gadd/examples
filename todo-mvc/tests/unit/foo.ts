import { addTodo } from '../../src/actions/storeTodoActions';
import { assert } from 'chai';

declare const test: any;

test.describe('foo foo', function () {
	test.it('should do foo', function () {
		assert.equal(typeof addTodo, 'function');
	});
});
