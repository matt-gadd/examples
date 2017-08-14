import { find, findIndex } from '@dojo/shim/array';
import uuid from '@dojo/core/uuid';
import { add, replace, remove } from './../store/operation';

function byId(id: string) {
	return (todo: any) => id === todo.id;
}

function byCompleted(completed: boolean) {
	return (todo: any) => completed === todo.completed;
}

function addTodoOperationFactory(get: any, label: string) {
	return add(`/todos/-`, { id: uuid(), label, completed: false });
}

function calculateCountsOperationFactory(get: any) {
	const todos = get('/todos');
	const completedTodos = todos.filter((todo: any) => todo.completed);

	return [
		replace('/activeCount', todos.length - completedTodos.length),
		replace('/completedCount', completedTodos.length)
	];
}

function toggleAllTodosOperationFactory(get: any) {
	const todos = get('/todos');
	const shouldComplete = !!find(todos, byCompleted(false));
	const updatedTodos = todos.map((todo: any) => {
		return { ...todo, completed: shouldComplete };
	});

	return replace('/todos', updatedTodos);
}

function clearCompletedOperationFactory(get: any) {
	const todos = get('/todos');
	const activeTodos = todos.filter(byCompleted(false));
	return replace('/todos', activeTodos);
}

function todoInputOperationFactory(get: any, payload: any) {
	return replace('/currentTodo', payload);
}

function toggleTodoOperationFactory(get: any, id: string, completed: boolean) {
	return updateTodoOperationFactory(get, { id, completed: !completed });
}

function editTodoOperationFactory(get: any, id: string) {
	return updateTodoOperationFactory(get, { id, editing: true });
}

function saveTodoOperationFactory(get: any, id: string, label?: string) {
	const todo: any = { id, editing: false };
	if (label) {
		todo.label = label;
	}
	return updateTodoOperationFactory(get, todo);
}

function updateTodoOperationFactory(get: any, payload: any) {
	const todos = get('/todos');
	const todo = find(todos, byId(payload.id));
	const index = todos.indexOf(todo);

	return replace(`/todos/${index}`, { ...todo, ...payload });
}

function removeTodoOperationFactory(get: any, id: any) {
	const index = findIndex(get('/todos'), byId(id));
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
