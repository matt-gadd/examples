import { find } from '@dojo/shim/array';
import { Container } from '@dojo/widget-core/Container';
import uuid from '@dojo/core/uuid';
import { TodoApp } from './../widgets/TodoApp';
import { Store } from './../store/store';
import { State as Todo } from './../resources/Todo';

function byId(id: string) {
	return (todo: Todo) => id === todo.id;
}

function getProperties(store: Store<any>, properties: any) {
	const state = store.getState();

	function addTodo(label: string) {
		label = label.trim();
		if (label) {
			const todo = { id: uuid(), label, editing: false, completed: false, timeCreated: Date.now() };
			store.dispatch({ type: 'TODO_ADD', payload: todo });
		}
	}

	function todoInput(currentTodo: string) {
		store.dispatch({ type: 'TODO_INPUT', payload: { currentTodo }});
	}

	function removeTodo(id: string) {
		store.dispatch({ type: 'TODO_DELETE', payload: { id }});
	}

	function clearCompleted() {
		store.dispatch({ type: 'TODOS_CLEAR_COMPLETED' });
	}

	function toggleTodos() {
		store.dispatch({ type: 'TODOS_TOGGLE_COMPLETED' });
	}

	function toggleTodo(id: string) {
		const todo = find(state.todos, byId(id));
		const completed = todo ? !todo.completed : false;
		store.dispatch({ type: 'TODO_UPDATE', payload: { ...todo, completed }});
	}

	function editTodo(id: string) {
		const todo = find(state.todos, byId(id));
		store.dispatch({ type: 'TODO_UPDATE', payload: { ...todo, editing: true }});
	}

	function saveTodo(id: string, label?: string) {
		const todo = find(state.todos, byId(id));
		if (todo) {
			label = label || todo.label;
			store.dispatch({ type: 'TODO_UPDATE', payload: { ...todo, label, editing: false }});
		}
	}

	function retryTodo(id: string) {
		const todo = find(state.todos, byId(id));
		store.dispatch({ type: 'TODO_RETRY', payload: { ...todo, failed: false } });
	}

	return {
		addTodo,
		todoInput,
		removeTodo,
		toggleTodo,
		toggleTodos,
		clearCompleted,
		editTodo,
		saveTodo,
		retryTodo,
		currentTodo: state.currentTodo,
		completedCount: state.completedCount,
		activeCount: state.activeCount,
		todos: state.todos
	};
}

export const TodoAppContainer = Container(TodoApp, 'application-state', { getProperties });
