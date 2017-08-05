import Strategy from './../store/Strategy';
import { del, post, put, RestTransportConfig } from './../store/transports/rest';

export interface Resource {
	uuid: string;
	label: string;
	completed: boolean;
	timeCreated: number;
}

export interface State {
	id: string;
	label: string;
	completed: boolean;
	editing?: boolean;
	timeCreated: number;
}

export function toTodo(state: State): Resource {
	return {
		uuid: state.id,
		label: state.label,
		completed: state.completed,
		timeCreated: state.timeCreated
	};
}

export function fromTodo(resource: Resource): State {
	return {
		id: resource.uuid,
		label: resource.label,
		completed: resource.completed,
		timeCreated: resource.timeCreated
	};
}

export const todoRestConfig: RestTransportConfig = {
	api: (state: State, method: string) => {
		switch (method) {
			case 'put':
			case 'delete':
				return `/todo/${state.id}`;
			default:
				return '/todo';
		}
	}
};

export const postTodo = new Strategy<Resource, State>({
	to: toTodo,
	from: fromTodo,
	transport: post(todoRestConfig),
	actions: {
		triggers: [ 'TODO_ADD' ],
		onSuccess: [ 'PROCESS_TODO' ],
		onFailure: [ 'TODO_UPDATE_FAILED' ]
	}
});

export const deleteTodo = new Strategy<Resource, State>({
	to: toTodo,
	from: fromTodo,
	transport: del(todoRestConfig),
	optimistic: true,
	actions: {
		triggers: [ 'TODO_DELETE' ]
	}
});

export const putTodo = new Strategy<Resource, State>({
	to: toTodo,
	from: fromTodo,
	transport: put(todoRestConfig),
	actions: {
		triggers: [ 'TODO_UPDATE' ],
		onSuccess: [ 'PROCESS_TODO' ],
		onFailure: [ 'TODO_UPDATE_FAILED' ]
	}
});
