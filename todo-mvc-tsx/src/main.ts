import { ProjectorMixin } from '@dojo/widget-core/mixins/Projector';
import { registry } from '@dojo/widget-core/d';
import { BaseInjector, Injector } from '@dojo/widget-core/Injector';
import { registerRouterInjector } from '@dojo/routing/RouterInjector';

import { TodoAppContainer } from './containers/TodoAppContainer';
import createStore from './store/store';
import { todoReducer } from './reducers';
import { getTodos } from './resources/Todos';
import { deleteTodo, postTodo, putTodo } from './resources/Todo';

const defaultState = {
	todos: [],
	currentTodo: '',
	activeCount: 0,
	completedCount: 0
};

const store = createStore();
store.add([ getTodos, postTodo, deleteTodo, putTodo ]);
store.registerReducers(todoReducer);

registry.define('application-state', Injector(BaseInjector, store));

const config = [
	{
		path: '{filter}',
		outlet: 'filter',
		defaultParams: {
			filter: 'all'
		},
		defaultRoute: true
	}
];

store.start(defaultState);
const router = registerRouterInjector(config);
const Projector = ProjectorMixin(TodoAppContainer);
const projector = new Projector();
projector.append();
router.start();
