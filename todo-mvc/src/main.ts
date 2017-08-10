import { ProjectorMixin } from '@dojo/widget-core/mixins/Projector';
import { registerRouterInjector } from '@dojo/routing/RouterInjector';
import TodoApp from './widgets/TodoApp';

const root = document.querySelector('my-app') || undefined;

const Projector = ProjectorMixin(TodoApp);
const projector = new Projector();

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

const router = registerRouterInjector(config);

projector.append(root);
router.start();
