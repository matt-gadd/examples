import createButton from 'dojo-widgets/createButton';
import createWidget from 'dojo-widgets/createWidget';
import createRenderMixin, { RenderMixin, RenderMixinState, RenderMixinOptions } from '../createRenderMixin';
import createCheckboxInput from './createCheckboxInput';
import createFocusableTextInput from './createFocusableTextInput';
import { todoRemove, todoToggleComplete, todoEditInput, todoSave, todoEdit } from '../actions/userActions';
import d from '../d';

export type TodoItemState = RenderMixinState & {
	editing?: boolean;
	completed?: boolean;
};

export type TodoItemOptions = RenderMixinOptions<TodoItemState>;

export type TodoItem = RenderMixin<TodoItemState>;

const createLabel = createWidget.extend({ tagName: 'label' });

const createTodoItem = createRenderMixin
	.extend({
		get classes(this: TodoItem): string[] {
			const classes: string[] = [];
			if (this.state.editing) {
				classes.push('editing');
			}
			return this.state.completed ? [ 'completed', ...classes ] : classes;
		},
		getChildrenNodes(this: TodoItem): any[] {
			const state = this.state;
			const checked = state.completed;
			const label = state.label;
			const focused = state.editing;
			/*const someRandomText = [ 'foo', 'bar', 'qux' ];*/
			return [
				d('div.view', [
					d(createCheckboxInput, {
						listeners: { change: () => todoToggleComplete.do(state) },
						state: { classes: [ 'toggle' ], checked }
					}),
					d(createLabel, {
						key: 'label-1',
						listeners: { dblclick: () => todoEdit.do(state) },
						state: { label }
					}),
/*
					checked ? d(createLabel, {
						key: 'label-2',
						state: { label: label + ', second' }
					}) : false,
*/
/*
					d('div', [
						...someRandomText.map((value, index) => {
							return d(createLabel, {
								key: 'label${index}',
								listeners: { dblclick: () => todoEdit.do(state) },
								state: { label: `${value}` }
							});
						})
					]),
*/
/*
					d('label', { innerHTML: 'plain old maquette' }),
*/
					d(createButton, {
						listeners: { click: () => todoRemove.do(state) },
						state: { classes: [ 'destroy' ] }
					})
				]),
				d(createFocusableTextInput, {
					listeners: {
						blur: (evt: Event) => todoSave.do({ state, evt }),
						keyup: (evt: Event) => todoEditInput.do({ state, evt })
					},
					state: { value: label, focused, classes: [ 'edit' ] }
				})
			];
		},
		tagName: 'li'
	});
export default createTodoItem;
