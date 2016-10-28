import createButton from 'dojo-widgets/createButton';
import createRenderMixin, { RenderMixin, RenderMixinState, RenderMixinOptions } from '../createRenderMixin';
import { VNode } from 'maquette';
import createCheckboxInput from './createCheckboxInput';
import createFocusableTextInput from './createFocusableTextInput';
import { todoRemove, todoToggleComplete } from '../actions/userActions';
import d from '../d';

type TodoItemState = RenderMixinState & {
	editing?: boolean;
	completed?: boolean;
};

export type TodoItemOptions = RenderMixinOptions<TodoItemState>;

export type TodoItem = RenderMixin<TodoItemState>;

const createTodoItem = createRenderMixin
	.extend({
		get classes(this: TodoItem): string[] {
			const classes: string[] = [];
			if (this.state.editing) {
				classes.push('editing');
			}
			return this.state.completed ? [ 'completed', ...classes ] : classes;
		},

		getChildrenNodes(this: TodoItem): VNode[] {
			const checkBoxValue = this.state.completed;
			const label = this.state.label;
			const focused = this.state.editing;

			return [
				d('div.view', [
					d(createCheckboxInput, {
						listeners: { change: () => todoToggleComplete.do(this.state) },
						state: { classes: [ 'toggle' ], checked: checkBoxValue }
					}),
					d('label', { innerHTML: label }),
					d(createButton, {
						listeners: { click: () => todoRemove.do(this.state) },
						state: { classes: [ 'destroy' ] }
					})
				]),
				d(createFocusableTextInput, {
					state: { value: label, focused, classes: [ 'edit' ] }
				})
			];
		},

		tagName: 'li'
	});

export default createTodoItem;
