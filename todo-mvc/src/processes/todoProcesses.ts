import { find, findIndex } from '@dojo/shim/array';
import uuid from '@dojo/core/uuid';
import { add, replace, remove } from './../store/operation';

function byId(id: string) {
	return (todo: any) => id === todo.id;
}

function byCompleted(completed: boolean) {
	return (todo: any) => completed === todo.completed;
}

function updateTodoOperationFactory(get: any, payload: any) {
	const todos = get('/todos');
	const todo = find(todos, byId(payload.id));
	const index = todos.indexOf(todo);

	return replace(`/todos/${index}`, { ...todo, ...payload });
}

function addTodoCommand(next: any, get: any, payload: any) {
	next(add(`/todos/-`, payload));
}

function calculateCountsCommand(next: any, get: any) {
	const todos = get('/todos');
	const completedTodos = todos.filter((todo: any) => todo.completed);

	next([
		replace('/activeCount', todos.length - completedTodos.length),
		replace('/completedCount', completedTodos.length)
	]);
}

function toggleAllTodosCommand(next: any, get: any) {
	const todos = get('/todos');
	const shouldComplete = !!find(todos, byCompleted(false));
	const updatedTodos = todos.map((todo: any) => {
		return { ...todo, completed: shouldComplete };
	});

	next(replace('/todos', updatedTodos));
}

function clearCompletedCommand(next: any, get: any) {
	const todos = get('/todos');
	const activeTodos = todos.filter(byCompleted(false));
	next(replace('/todos', activeTodos));
}

function todoInputCommand(next: any, get: any, payload: any) {
	next(replace('/currentTodo', payload));
}

function toggleTodoCommand(next: any, get: any, [ id, completed ]: [ string, boolean ]) {
	next(updateTodoOperationFactory(get, { id, completed: !completed }));
}

function editTodoCommand(next: any, get: any, [ id ]: [ string ]) {
	next(updateTodoOperationFactory(get, { id, editing: true }));
}

function saveTodoCommand(next: any, get: any, id: string, label?: string) {
	const todo: any = { id, editing: false };
	if (label) {
		todo.label = label;
	}
	next(updateTodoOperationFactory(get, todo));
}

function removeTodoCommand(next: any, get: any, id: any) {
	const index = findIndex(get('/todos'), byId(id));
	next(remove(`/todos/${index}`));
}

function postTodoCommand(next: any, get: any, payload: any) {
	// transform for server?
	const promise = new Promise((resolve) => {
		setTimeout(() => {
			resolve({ ...payload, id: uuid(), label: 'frick', completed: true });
		}, 500);
	});
	return promise.then((data) => {
		const todos =  get('/todos');
		const index = findIndex(todos, byId(payload.id));
		next(replace(`/todos/${index}`, { ...data }));
	});
}

export const addTodoProcess = [ addTodoCommand, calculateCountsCommand ];
export const addTodoProcessWithPost = [ ...addTodoProcess, postTodoCommand, calculateCountsCommand ];
export const toggleTodoProcess = [ toggleTodoCommand, calculateCountsCommand ];
export const updateTodoProcess = [ saveTodoCommand ];
export const todoInputProcess = [ todoInputCommand ];
export const editTodoProcess = [ editTodoCommand ];
export const saveTodoProcess = [ saveTodoCommand ];
export const toggleAllTodoProcess = [ toggleAllTodosCommand, calculateCountsCommand ];
export const clearCompletedProcess = [ clearCompletedCommand, calculateCountsCommand ];
export const removeTodoProcess = [ removeTodoCommand, calculateCountsCommand ];