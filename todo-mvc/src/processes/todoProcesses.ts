import { find, findIndex } from '@dojo/shim/array';
import uuid from '@dojo/core/uuid';
import { add, replace, remove } from './../store/operation';

function byId(id: string) {
	return (todo: any) => id === todo.id;
}

function byCompleted(completed: boolean) {
	return (todo: any) => completed === todo.completed;
}

function addTodoOperationFactory(next: any, get: any, label: string) {
	next(add(`/todos/-`, { id: uuid(), label, completed: false }));
}

function calculateCountsOperationFactory(next: any, get: any) {
	const todos = get('/todos');
	const completedTodos = todos.filter((todo: any) => todo.completed);

	next([
		replace('/activeCount', todos.length - completedTodos.length),
		replace('/completedCount', completedTodos.length)
	]);
}

function toggleAllTodosOperationFactory(next: any, get: any) {
	const todos = get('/todos');
	const shouldComplete = !!find(todos, byCompleted(false));
	const updatedTodos = todos.map((todo: any) => {
		return { ...todo, completed: shouldComplete };
	});

	next(replace('/todos', updatedTodos));
}

function clearCompletedOperationFactory(next: any, get: any) {
	const todos = get('/todos');
	const activeTodos = todos.filter(byCompleted(false));
	next(replace('/todos', activeTodos));
}

function todoInputOperationFactory(next: any, get: any, payload: any) {
	next(replace('/currentTodo', payload));
}

function toggleTodoOperationFactory(next: any, get: any, id: string, completed: boolean) {
	updateTodoOperationFactory(next, get, { id, completed: !completed });
}

function editTodoOperationFactory(next: any, get: any, id: string) {
	updateTodoOperationFactory(next, get, { id, editing: true });
}

function saveTodoOperationFactory(next: any, get: any, id: string, label?: string) {
	const todo: any = { id, editing: false };
	if (label) {
		todo.label = label;
	}
	updateTodoOperationFactory(next, get, todo);
}

function updateTodoOperationFactory(next: any, get: any, payload: any) {
	const todos = get('/todos');
	const todo = find(todos, byId(payload.id));
	const index = todos.indexOf(todo);

	next(replace(`/todos/${index}`, { ...todo, ...payload }));
}

function removeTodoOperationFactory(next: any, get: any, id: any) {
	const index = findIndex(get('/todos'), byId(id));
	next(remove(`/todos/${index}`));
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
