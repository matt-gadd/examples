import createButton from 'dojo-widgets/createButton';
import createRenderMixin, { RenderMixin, RenderMixinState, RenderMixinOptions } from '../createRenderMixin';
import { VNode } from 'maquette';
import createCheckboxInput from './createCheckboxInput';
import createFocusableTextInput from './createFocusableTextInput';
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
(<any> window).a = this;
			const checkBoxValue = this.state.completed;

			const widgets = [
				d(createCheckboxInput, { state: { classes: [ 'toggle' ], checked: checkBoxValue } }),
				d('label', { innerHTML: 'Hello World' }),
				d(createButton, { state: { classes: [ 'destroy' ] } })
			];

			if (checkBoxValue) {
				widgets.pop();
			}

			return [
				d('div.view', widgets),
				d(createFocusableTextInput, { state: { classes: [ 'edit' ] } })
			];
		},

		tagName: 'li'
	});

export default createTodoItem;
