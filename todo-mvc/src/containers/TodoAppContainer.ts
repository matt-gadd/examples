import { Container } from '@dojo/widget-core/Container';
import { TodoApp } from './../widgets/TodoApp';
import uuid from '@dojo/core/uuid';
import { Store } from './../store/store';
import {
	addTodoProcessWithPost,
	editTodoProcess,
	toggleTodoProcess,
	deleteTodoProcess,
	toggleAllTodoProcess,
	clearCompletedProcess,
	saveTodoProcess,
	todoInputProcess
} from './../processes/todoProcesses';

function getProperties(store: Store<any>, properties: any) {
	const { get, createProcessRunner } = store;

	return {
		addTodo: createProcessRunner(addTodoProcessWithPost, (label: string) => {
			return { id: uuid(), label, completed: false, loading: true };
		}),
		todoInput: createProcessRunner(todoInputProcess),
		removeTodo: createProcessRunner(deleteTodoProcess),
		toggleTodo: createProcessRunner(toggleTodoProcess),
		toggleTodos: createProcessRunner(toggleAllTodoProcess),
		clearCompleted: createProcessRunner(clearCompletedProcess),
		editTodo: createProcessRunner(editTodoProcess),
		saveTodo: createProcessRunner(saveTodoProcess),
		currentTodo: get('/currentTodo'),
		completedCount: get('/completedCount'),
		activeCount: get('/activeCount'),
		todos: get('/todos'),
		failed: get('/failed'),
		undo: (): void => {
			store.undo(addTodoProcessWithPost, toggleTodoProcess);
		},
		hasUndoOperations: store.hasUndoOperations
	};
}

export const TodoAppContainer = Container(TodoApp, 'application-state', { getProperties });
