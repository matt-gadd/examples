import { find, findIndex } from '@dojo/shim/array';
import uuid from '@dojo/core/uuid';
import { PatchOperation, OperationType } from './../store/patch/JsonPatch';
import { JsonPointer } from './../store/patch/JsonPointer';
import { process } from './../store/store';

function byId(id: string) {
	return (todo: any) => id === todo.id;
}

function byCompleted(completed: boolean) {
	return (todo: any) => completed === todo.completed;
}

function addTodoOperation(state: any, label: string): PatchOperation {
	const index = state.todos.length;
	return {
		op: OperationType.ADD,
		path: new JsonPointer(`/todos/${index}`),
		value: { id: uuid(), label, completed: false }
	};
}

function calculateCountsOperation(state: any): PatchOperation[] {
	const completedTodos = state.todos.filter((todo: any) => todo.completed);

	return [
		{
			op: OperationType.REPLACE,
			path: new JsonPointer('/activeCount'),
			value: state.todos.length - completedTodos.length
		},
		{
			op: OperationType.REPLACE,
			path: new JsonPointer('/completedCount'),
			value: completedTodos.length
		}
	];
}

function toggleAllTodosOperation(state: any): PatchOperation {
	const shouldComplete = !!find(state.todos, byCompleted(false));
	const todos = state.todos.map((todo: any) => {
		return { ...todo, completed: shouldComplete };
	});

	return {
		op: OperationType.REPLACE,
		path: new JsonPointer('/todos'),
		value: todos
	};
}

function clearCompletedOperation(state: any): PatchOperation {
	const activeTodos = state.todos.filter(byCompleted(false));
	return {
		op: OperationType.REPLACE,
		path: new JsonPointer('/todos'),
		value: activeTodos
	};
}

function todoInputOperation(state: any, payload: any): PatchOperation {
	return {
		op: OperationType.REPLACE,
		path: new JsonPointer('/currentTodo'),
		value: payload
	};
}

function toggleTodoOperation(state: any, id: string, completed: boolean) {
	return updateTodoOperation(state, { id, completed: !completed });
}

function editTodoOperation(state: any, id: string) {
	return updateTodoOperation(state, { id, editing: true });
}

function saveTodoOperation(state: any, id: string, label?: string): PatchOperation {
	const todo: any = { id, editing: false };
	if (label) {
		todo.label = label;
	}
	return updateTodoOperation(state, todo);
}

function updateTodoOperation(state: any, payload: any): PatchOperation {
	const todo = find(state.todos, byId(payload.id));
	const index = state.todos.indexOf(todo);

	return {
		op: OperationType.REPLACE,
		path: new JsonPointer(`/todos/${index}`),
		value: { ...todo, ...payload }
	};
}

function removeTodoOperation(state: any, id: any): PatchOperation {
	const index = findIndex(state.todos, byId(id));

	return {
		op: OperationType.REMOVE,
		path: new JsonPointer(`/todos/${index}`)
	};
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
