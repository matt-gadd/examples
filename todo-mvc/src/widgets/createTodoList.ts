import createRenderMixin, { RenderMixin, RenderMixinState, RenderMixinOptions } from '../createRenderMixin';
import { w } from '../d';

type TodoListState = RenderMixinState & {
	children: any[];
	childStates: any[];
};

type TodoListOptions = RenderMixinOptions<TodoListState>;

export type TodoList = RenderMixin<TodoListState>;

const createTodoList = createRenderMixin
	.mixin({
		initialize(instance: TodoList, options: any) {
			instance.on('statechange', ({ state }) => {
				const { children } = state;
				if (children.length && options.stateFrom) {
					const promises = children.map((childId) => options.stateFrom.get(childId));
					Promise.all(promises).then((childStates) => {
						state.childStates = childStates;
					});
				}
			});
		}
	})
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
