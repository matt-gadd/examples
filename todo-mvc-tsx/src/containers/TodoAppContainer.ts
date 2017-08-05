import { find } from '@dojo/shim/array';
import uuid from '@dojo/core/uuid';
import { Container } from '@dojo/widget-core/Container';
import { TodoApp } from './../widgets/TodoApp';
import { Store } from './../store/store';
import { State as Todo } from './../resources/Todo';

function byId(id: string) {
	return (todo: Todo) => {
		return id === todo.id;
	};
}

function getProperties(store: Store<any>, properties: any) {
	const state = store.getState();

	function addTodo(todo: string) {
		if (todo.trim()) {
			store.dispatch({
				type: 'ADD_TODO',
				payload: { id: uuid(), label: todo.trim(), completed: false }
			});
		}
	}

	function todoInput(currentTodo: string) {
		store.dispatch({ type: 'TODO_INPUT', payload: { currentTodo }});
	}

	function removeTodo(id: string) {
		store.dispatch({ type: 'DELETE_TODO', payload: { id }});
	}

	function toggleTodo(id: string) {
		const todo = find(state.todos, byId(id));
		if (todo) {
			store.dispatch({ type: 'SAVE_TODO', payload: { ...todo, completed: !todo.completed, editing: false }});
		}
	}

	function clearCompleted() {
		store.dispatch({ type: 'CLEAR_COMPLETED' });
	}

	function toggleTodos() {
		store.dispatch({ type: 'TOGGLE_TODOS' });
	}

	function editTodo(id: string) {
		store.dispatch({ type: 'EDIT_TODO', payload: { id }});
	}

	function saveTodo(id: string, label?: string) {
		const todo = find(state.todos, byId(id));
		if (todo && label) {
			store.dispatch({ type: 'SAVE_TODO', payload: { ...todo, label, editing: false }});
		}
		else if (todo) {
			store.dispatch({ type: 'UPDATE_TODO', payload: { ...todo, editing: false }});
		}
	}

	function retryTodo(id: string) {
		const todo = state.todos.filter((todo: any) => {
			return todo.id === id;
		});
		store.dispatch({ type: 'REPLACE_TODO', payload: { ...todo[0], failed: false } });
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
