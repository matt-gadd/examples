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

store.afterAction('ADD_TODO', [ 'CLEAR_TODO_INPUT', 'CALCULATE_COUNTS' ]);
store.afterAction('REPLACE_TODO', [ 'CALCULATE_COUNTS' ]);
store.afterAction('FETCH_TODOS', [ 'CALCULATE_COUNTS' ]);
store.afterAction('DELETE_TODO', [ 'CALCULATE_COUNTS' ]);
store.afterAction('CLEAR_COMPLETED', [ 'CALCULATE_COUNTS' ]);
store.afterAction('SAVE_TODO', [ 'CALCULATE_COUNTS' ]);
store.afterAction('UPDATE_TODO', [ 'CALCULATE_COUNTS' ]);
store.afterAction('REPLACE_TODO', [ 'CALCULATE_COUNTS' ]);
store.afterAction('PROCESS_TODO', [ 'CALCULATE_COUNTS' ]);

store.add(getTodos);
store.add(postTodo);
store.add(deleteTodo);
store.add(putTodo);

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
