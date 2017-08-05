import { Action } from './../store/store';

export function todoReducer(state: any = {}, { type, payload }: Action): any {
	switch (type) {
		case 'TODO_INPUT':
			state.currentTodo = payload.currentTodo;
			return state;
		case 'TODO_ADD':
			state.todos = [
				...state.todos,
				payload
			];
			return state;
		case 'TODO_UPDATE':
			state.todos = state.todos.map((todo: any) => {
				if (todo.id === payload.id) {
					return payload;
				}
				return todo;
			});
			return state;
		case 'TODO_DELETE':
			state.todos = state.todos.filter((todo: any) => todo.id !== payload.id);
			return state;
		case 'TODO_UPDATE_FAILED':
			state.todos = state.todos.map((todo: any) => {
				if (todo.id === payload.original.id) {
					return { ...todo, failed: true };
				}
				return todo;
			});
			return state;
		case 'PROCESS_TODO':
			state.todos = state.todos.map((todo: any) => {
				if (todo.id === payload.original.id) {
					return { ...todo, ...payload.data };
				}
				return todo;
			});
			return state;
		case 'TODOS_ADD':
			return {
				...state,
				todos: payload.data
			};
		case 'TODOS_TOGGLE_COMPLETED':
			state.todos = state.todos.map((todo: any) => {
				return { ...todo, completed: state.activeCount !== 0 };
			});
			return state;
		case 'TODOS_CLEAR_COMPLETED':
			state.todos = state.todos.filter((todo: any) => {
				return !todo.completed;
			});
			return state;
		default:
			return state;
	}
}
