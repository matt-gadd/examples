import createWidgetBase from 'dojo-widgets/bases/createWidgetBase';
import { Widget, WidgetOptions, WidgetState, DNode } from 'dojo-interfaces/widgetBases';
import d from 'dojo-widgets/util/d';
import { TodoItemState } from './createTodoItem';
import load from 'dojo-core/load';

// would be automatically inject from wherever in a build, just like other webpack plugins/loaders
require('bundle?lazy!./createTodoItem');

type TodoListState = WidgetState & {
	activeFilter?: string;
	todos: TodoItemState[];
};

type TodoListOptions = WidgetOptions<TodoListState>;

export type TodoList = Widget<TodoListState>;

function filter(filterName: string, todo: TodoItemState): boolean {
	switch (filterName) {
		case 'completed':
			return !!todo.completed;
		case 'active':
			return !todo.completed;
		default:
			return true;
	}
}

function loadingIndicator() {
	return d('div', { classes: { spinner: true } }, [
		d('div', { classes: { rect1: true }} ),
		d('div', { classes: { rect2: true } }),
		d('div', { classes: { rect3: true } }),
		d('div', { classes: { rect4: true } }),
		d('div', { classes: { rect5: true } })
	]);
}

const fromRegistry = function(path: string) {
	return createWidgetBase
	.mixin({
		initialize(instance: any, options: any) {
			load(path).then(([ a ]) => {
				const widget = a.default || a;
				instance.setState({ loaded: true, widget, options });
			});
		}
	})
	.extend({
		childNodeRenderers: [
			function(): DNode[] {
				const { widget, options, loaded } = this.state;
				if (loaded) {
					return [ d(widget, options) ];
				}
				return [ loadingIndicator() ];
			}
		],
		tagName: 'div'
	});
};

const createTodoList = createWidgetBase
	.extend({
		childNodeRenderers: [
			function(this: TodoList): DNode[] {
				const activeFilter = this.state.activeFilter || '';
				const todos = this.state.todos || [];
				return todos
					.filter((todo) => filter(activeFilter, todo))
					.map((todo) => d(fromRegistry('src/widgets/createTodoItem'), {
						id: todo.id,
						state: todo
					}));
				}
		],
		tagName: 'ul'
	});

export default createTodoList;
