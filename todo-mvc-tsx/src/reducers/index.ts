import { Action } from './../store/store';

export function todoReducer(state: any = {}, { type, payload }: Action): any {
	switch (type) {
		case 'TODO_INPUT':
			state.currentTodo = payload.currentTodo;
			return state;
		case 'ADD_TODO':
			state.todos = [
				...state.todos,
				{ id: payload.id, label: payload.label, completed: payload.completed }
			];
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
		case 'FETCH_TODOS':
			return {
				...state,
				todos: payload.data
			};
		case 'CALCULATE_COUNTS':
			const completedTodos = state.todos.filter((todo: any) => todo.completed);
			return {
				...state,
				completedCount: completedTodos.length,
				activeCount: state.todos.length - completedTodos.length
			};
		case 'CLEAR_TODO_INPUT':
			state.currentTodo = '';
			return state;
		case 'DELETE_TODO':
			state.todos = state.todos.filter((todo: any) => todo.id !== payload.id);
			return state;
		case 'TOGGLE_TODOS':
			state.todos = state.todos.map((todo: any) => {
				return { ...todo, completed: state.activeCount !== 0 };
			});
			return state;
		case 'CLEAR_COMPLETED':
			state.todos = state.todos.filter((todo: any) => {
				return !todo.completed;
			});
			return state;
		case 'EDIT_TODO':
			state.todos = state.todos.map((todo: any) => {
				if (todo.id === payload.id) {
					return { ...todo, editing: true};
				}
				return todo;
			});
			return state;
		case 'REPLACE_TODO':
			state.todos = state.todos.map((todo: any) => {
				if (todo.id === payload.id) {
					return payload;
				}
				return todo;
			});
			return state;
		case 'UPDATE_TODO':
		case 'SAVE_TODO':
			state.todos = state.todos.map((todo: any) => {
				if (todo.id === payload.id) {
					return payload;
				}
				return todo;
			});
			return state;
		default:
			return state;
	}
}
