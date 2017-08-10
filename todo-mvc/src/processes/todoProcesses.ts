import { find, findIndex } from '@dojo/shim/array';
import uuid from '@dojo/core/uuid';
import { process } from './../store/store';
import { add, replace, remove } from './../store/operation';

function byId(id: string) {
	return (todo: any) => id === todo.id;
}

function byCompleted(completed: boolean) {
	return (todo: any) => completed === todo.completed;
}

function addTodoOperation(state: any, label: string) {
	return add(`/todos/-`, { id: uuid(), label, completed: false });
}

function calculateCountsOperation(state: any) {
	const completedTodos = state.todos.filter((todo: any) => todo.completed);

	return [
		replace('/activeCount', state.todos.length - completedTodos.length),
		replace('/completedCount', completedTodos.length)
	];
}

function toggleAllTodosOperation(state: any) {
	const shouldComplete = !!find(state.todos, byCompleted(false));
	const todos = state.todos.map((todo: any) => {
		return { ...todo, completed: shouldComplete };
	});

	return replace('/todos', todos);
}

function clearCompletedOperation(state: any) {
	const activeTodos = state.todos.filter(byCompleted(false));
	return replace('/todos', activeTodos);
}

function todoInputOperation(state: any, payload: any) {
	return replace('/currentTodo', payload);
}

function toggleTodoOperation(state: any, id: string, completed: boolean) {
	return updateTodoOperation(state, { id, completed: !completed });
}

function editTodoOperation(state: any, id: string) {
	return updateTodoOperation(state, { id, editing: true });
}

function saveTodoOperation(state: any, id: string, label?: string) {
	const todo: any = { id, editing: false };
	if (label) {
		todo.label = label;
	}
	return updateTodoOperation(state, todo);
}

function updateTodoOperation(state: any, payload: any) {
	const todo = find(state.todos, byId(payload.id));
	const index = state.todos.indexOf(todo);

	return replace(`/todos/${index}`, { ...todo, ...payload });
}

function removeTodoOperation(state: any, id: any) {
	const index = findIndex(state.todos, byId(id));
	if (index !== -1) {
		return remove(`/todos/${index}`);
	}
}

export const addTodoProcess = process(addTodoOperation, calculateCountsOperation);
export const toggleTodoProcess = process(toggleTodoOperation, calculateCountsOperation);
export const updateTodoProcess = process(updateTodoOperation);
export const todoInputProcess = process(todoInputOperation);
export const editTodoProcess = process(editTodoOperation);
export const saveTodoProcess = process(saveTodoOperation);
export const toggleAllTodoProcess = process(toggleAllTodosOperation, calculateCountsOperation);
export const clearCompletedProcess = process(clearCompletedOperation, calculateCountsOperation);
export const removeTodoProcess = process(removeTodoOperation, calculateCountsOperation);
