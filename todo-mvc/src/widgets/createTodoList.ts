import createRenderMixin, { RenderMixin, RenderMixinState, RenderMixinOptions } from '../createRenderMixin';
import createTodoItem, { TodoItem, TodoItemState } from './createTodoItem';
import d from '../d';

type TodoListState = RenderMixinState & {
	activeFilter?: string;
	todos: TodoItem[];
};

type TodoListOptions = RenderMixinOptions<TodoListState>;

export type TodoList = RenderMixin<TodoListState>;

function filter(filterName: string, todo: TodoItemState): boolean {
	switch (filterName) {
		case 'completed':
			return todo.completed;
		case 'active':
			return !todo.completed;
		default:
			return true;
	}
}

const createTodoList = createRenderMixin
	.extend({
		getChildrenNodes(this: TodoList): any[] {
			const todos = this.state.todos || [];
			return todos
				.filter((todo: TodoItemState) => filter(this.state.activeFilter, todo))
				.map((todo: TodoItemState) => {
					return d(createTodoItem, { key: todo.id, state: todo });
				});
		},
		tagName: 'ul'
	});

export default createTodoList;
