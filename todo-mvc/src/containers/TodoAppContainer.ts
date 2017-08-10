import { Container } from '@dojo/widget-core/Container';
import { TodoApp } from './../widgets/TodoApp';
import { Store } from './../store/store';
import {
	addTodoProcess,
	editTodoProcess,
	toggleTodoProcess,
	removeTodoProcess,
	toggleAllTodoProcess,
	clearCompletedProcess,
	saveTodoProcess,
	todoInputProcess
} from './../processes/todoProcesses';

function getProperties(store: Store<any>, properties: any) {
	const { state, createProcessRunner } = store;

	return {
		addTodo: createProcessRunner(addTodoProcess),
		todoInput: createProcessRunner(todoInputProcess),
		removeTodo: createProcessRunner(removeTodoProcess),
		toggleTodo: createProcessRunner(toggleTodoProcess),
		toggleTodos: createProcessRunner(toggleAllTodoProcess),
		clearCompleted: createProcessRunner(clearCompletedProcess),
		editTodo: createProcessRunner(editTodoProcess),
		saveTodo: createProcessRunner(saveTodoProcess),
		currentTodo: state.currentTodo,
		completedCount: state.completedCount,
		activeCount: state.activeCount,
		todos: state.todos,
		undo: store.undo.bind(store),
		hasUndoOperations: store.hasUndoOperations
	};
}

export const TodoAppContainer = Container(TodoApp, 'application-state', { getProperties });
