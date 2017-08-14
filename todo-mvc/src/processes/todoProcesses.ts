import { find, findIndex } from '@dojo/shim/array';
import uuid from '@dojo/core/uuid';
import { add, replace, remove } from './../store/operation';

function byId(id: string) {
	return (todo: any) => id === todo.id;
}

function byCompleted(completed: boolean) {
	return (todo: any) => completed === todo.completed;
}

function addTodoOperationFactory(state: any, label: string) {
	return add(`/todos/-`, { id: uuid(), label, completed: false });
}

function calculateCountsOperationFactory(state: any) {
	const completedTodos = state.todos.filter((todo: any) => todo.completed);

	return [
		replace('/activeCount', state.todos.length - completedTodos.length),
		replace('/completedCount', completedTodos.length)
	];
}

function toggleAllTodosOperationFactory(state: any) {
	const shouldComplete = !!find(state.todos, byCompleted(false));
	const todos = state.todos.map((todo: any) => {
		return { ...todo, completed: shouldComplete };
	});

	return replace('/todos', todos);
}

function clearCompletedOperationFactory(state: any) {
	const activeTodos = state.todos.filter(byCompleted(false));
	return replace('/todos', activeTodos);
}

function todoInputOperationFactory(state: any, payload: any) {
	return replace('/currentTodo', payload);
}

function toggleTodoOperationFactory(state: any, id: string, completed: boolean) {
	return updateTodoOperationFactory(state, { id, completed: !completed });
}

function editTodoOperationFactory(state: any, id: string) {
	return updateTodoOperationFactory(state, { id, editing: true });
}

function saveTodoOperationFactory(state: any, id: string, label?: string) {
	const todo: any = { id, editing: false };
	if (label) {
		todo.label = label;
	}
	return updateTodoOperationFactory(state, todo);
}

function updateTodoOperationFactory(state: any, payload: any) {
	const todo = find(state.todos, byId(payload.id));
	const index = state.todos.indexOf(todo);

	return replace(`/todos/${index}`, { ...todo, ...payload });
}

function removeTodoOperationFactory(state: any, id: any) {
	const index = findIndex(state.todos, byId(id));
	if (index !== -1) {
		return remove(`/todos/${index}`);
	}
}

export const addTodoProcess = [ addTodoOperationFactory, calculateCountsOperationFactory ];

export const toggleTodoProcess = [ toggleTodoOperationFactory, calculateCountsOperationFactory ];
export const updateTodoProcess = [ updateTodoOperationFactory ];
export const todoInputProcess = [ todoInputOperationFactory ];
export const editTodoProcess = [ editTodoOperationFactory ];
export const saveTodoProcess = [ saveTodoOperationFactory ];
export const toggleAllTodoProcess = [ toggleAllTodosOperationFactory, calculateCountsOperationFactory ];
export const clearCompletedProcess = [ clearCompletedOperationFactory, calculateCountsOperationFactory ];
export const removeTodoProcess = [ removeTodoOperationFactory, calculateCountsOperationFactory ];
