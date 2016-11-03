import createButton from 'dojo-widgets/createButton';
import createRenderMixin, { RenderMixin, RenderMixinState, RenderMixinOptions } from '../createRenderMixin';
import d from '../d';
import bundle from './nls/createTodoFooter';

import { clearCompleted } from '../actions/userActions';
import createTodoFilter from './createTodoFilter';

export type TodoFooterState = RenderMixinState & {
	activeFilter?: string;
	activeCount?: number;
	completedCount?: number;
};

export type TodoFooterOptions = RenderMixinOptions<TodoFooterState>;

export type TodoFooter = RenderMixin<TodoFooterState>;

const createTodoFooter = createRenderMixin
	.mixin({
		initialize(todoFooter: TodoFooter) {
			/*i18n.instances.push(todoFooter);*/
		}
	})
	.extend({
		getChildrenNodes(this: TodoFooter): any[] {
(<any> window).footer = this;
			const activeCount = this.state.activeCount;
			const activeFilter = this.state.activeFilter;
			const countLabel = activeCount === 1 ? 'item' : 'items';
			const clearButtonClasses = [ 'clear-completed' ];
			const messages = bundle.get();

			if (this.state.completedCount === 0) {
				clearButtonClasses.push('hidden');
			}

			return [
				d('span', { class: 'todo-count'}, [
					d('strong', { innerHTML: [ activeCount + ' ' ] }),
					d('span', { innerHTML: [ countLabel + ' left' ] })
				]),
				d(createTodoFilter, {
					state: { id: 'filter', classes: [ 'filters' ], activeFilter }
				}),
				d(createButton, {
					state: {
						id: 'button',
						label: messages.clear,
						classes: [ 'clear-completed' ]
					},
					listeners: {
						click: clearCompleted
					}
				})
			];
		},
		tagName: 'footer'
	});

export default createTodoFooter;
