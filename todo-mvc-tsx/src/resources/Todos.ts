import Strategy from './../store/Strategy';
import { get, RestTransportConfig } from './../store/transports/rest';

import { State as TodoState, Resource as TodoResource } from './Todo';

export type Resource = TodoResource[];

export type State = TodoState[];

function toTodos(state: State): Resource {
	return [];
}

function fromTodos(resource: Resource): State {
	return resource.map(({ uuid: id, label, completed, timeCreated }) => {
		return { id, label, completed, timeCreated };
	});
}

export const todosRestConfig: RestTransportConfig = {
	api: (state: State, method: string) => {
		return `/todos`;
	}
};

export const getTodos = new Strategy<TodoResource[], TodoState[]>({
	to: toTodos,
	from: fromTodos,
	transport: get(todosRestConfig),
	actions: {
		triggers: [ 'INITIAL' ],
		onSuccess: [ 'FETCH_TODOS' ]
	}
});
