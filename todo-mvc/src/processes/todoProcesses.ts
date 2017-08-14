import { find, findIndex } from '@dojo/shim/array';
import uuid from '@dojo/core/uuid';
import { add, replace, remove } from './../store/operation';

function byId(id: string) {
	return (todo: any) => id === todo.id;
}

function byCompleted(completed: boolean) {
	return (todo: any) => completed === todo.completed;
}

function addTodoCommand(state: any, label: string) {
	return add(`/todos/-`, { id: uuid(), label, completed: false });
}

function calculateCountsCommand(state: any) {
	const completedTodos = state.todos.filter((todo: any) => todo.completed);

	return [
		replace('/activeCount', state.todos.length - completedTodos.length),
		replace('/completedCount', completedTodos.length)
	];
}

function toggleAllTodosCommand(state: any) {
	const shouldComplete = !!find(state.todos, byCompleted(false));
	const todos = state.todos.map((todo: any) => {
		return { ...todo, completed: shouldComplete };
	});

	return replace('/todos', todos);
}

function clearCompletedCommand(state: any) {
	const activeTodos = state.todos.filter(byCompleted(false));
	return replace('/todos', activeTodos);
}

function todoInputCommand(state: any, payload: any) {
	return replace('/currentTodo', payload);
}

function toggleTodoCommand(state: any, id: string, completed: boolean) {
	return updateTodoCommand(state, { id, completed: !completed });
}

function editTodoCommand(state: any, id: string) {
	return updateTodoCommand(state, { id, editing: true });
}

function saveTodoCommand(state: any, id: string, label?: string) {
	const todo: any = { id, editing: false };
	if (label) {
		todo.label = label;
	}
	return updateTodoCommand(state, todo);
}

function updateTodoCommand(state: any, payload: any) {
	const todo = find(state.todos, byId(payload.id));
	const index = state.todos.indexOf(todo);

	return replace(`/todos/${index}`, { ...todo, ...payload });
}

function removeTodoCommand(next: any, state: any, id: any) {
	const index = findIndex(state.todos, byId(id));
	if (index !== -1) {
		next(remove(`/todos/${index}`));
	}
}

export const addTodoProcess = [ addTodoCommand, calculateCountsCommand ];

export const toggleTodoProcess = [ toggleTodoCommand, calculateCountsCommand ];
export const updateTodoProcess = [ updateTodoCommand ];
export const todoInputProcess = [ todoInputCommand ];
export const editTodoProcess = [ editTodoCommand ];
export const saveTodoProcess = [ saveTodoCommand ];
export const toggleAllTodoProcess = [ toggleAllTodosCommand, calculateCountsCommand ];
export const clearCompletedProcess = [ clearCompletedCommand, calculateCountsCommand ];
export const removeTodoProcess = [ removeTodoCommand, calculateCountsCommand ];
