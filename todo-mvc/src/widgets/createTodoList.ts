import createRenderMixin, { RenderMixin, RenderMixinState, RenderMixinOptions } from '../createRenderMixin';
import { w } from '../d';

type TodoListState = RenderMixinState & {
	children: any[];
	childStates: any[];
};

type TodoListOptions = RenderMixinOptions<TodoListState>;

export type TodoList = RenderMixin<TodoListState>;

const createTodoList = createRenderMixin
	.extend({
		getChildrenNodes(this: TodoList): any[] {
			const children = this.state.childStates || [];
			return children
				.sort((a, b) => a.priority - b.priority)
				.map((state) => w(state.type, { key: state.id, state }));
		},
		tagName: 'ul'
	});

export default createTodoList;
