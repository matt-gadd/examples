import { ProjectorMixin } from '@dojo/widget-core/mixins/Projector';
import { registerRouterInjector } from '@dojo/routing/RouterInjector';
import { registry } from '@dojo/widget-core/d';
import { BaseInjector, Injector } from '@dojo/widget-core/Injector';
import { TodoAppContainer } from './containers/TodoAppContainer';
import { Store } from './store/store';
import { getTodosProcess } from './processes/todoProcesses';

const root = document.querySelector('my-app') || undefined;

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

const defaultState = {
	todos: [],
	currentTodo: '',
	activeCount: 0,
	completedCount: 0
};

const store = new Store(defaultState);
store.createProcessRunner(getTodosProcess)();

registry.define('application-state', Injector(BaseInjector, store));

const router = registerRouterInjector(config);
const Projector = ProjectorMixin(TodoAppContainer);
const projector = new Projector();
projector.append(root);
router.start();
