import { WidgetBase } from '@dojo/widget-core/WidgetBase';
import { ThemeableMixin, theme } from '@dojo/widget-core/mixins/Themeable';
import { w, v } from '@dojo/widget-core/d';
import { DNode, WidgetProperties } from '@dojo/widget-core/interfaces';
import { registry } from '@dojo/widget-core/d';

import { TodoHeader } from './TodoHeader';
import { TodoListOutlet } from './../outlets/TodoListOutlet';
import { TodoItem } from './TodoItem';
import { TodoFooterOutlet } from './../outlets/TodoFooterOutlet';
import { TodoFilter } from './TodoFilter';

import * as css from './styles/todoApp.css';

registry.define('todo-header', TodoHeader);
registry.define('todo-list', TodoListOutlet);
registry.define('todo-item', TodoItem);
registry.define('todo-footer', TodoFooterOutlet);
registry.define('todo-filter', TodoFilter);

export interface Todo {
	id: string;
	label: string;
	completed: boolean;
	editing?: boolean;
}

export interface TodoAppProperties extends WidgetProperties {
	todos: Todo[];
	currentTodo: string;
	activeCount: number;
	completedCount: number;
	failed: boolean;
	addTodo: (label: string) => void;
	editTodo: (id: string) => void;
	saveTodo: (id: string, label?: string) => void;
	todoInput: (id: string) => void;
	removeTodo: (id: string) => void;
	toggleTodo: (id: string, completed: boolean) => void;
	toggleTodos: () => void;
	clearCompleted: () => void;
	undo: () => void;
	hasUndoOperations: boolean;
}

export const TodoAppBase = ThemeableMixin(WidgetBase);

@theme(css)
export class TodoApp extends TodoAppBase<TodoAppProperties> {

	protected render(): DNode {
		const {
			activeCount,
			todos,
			failed,
			currentTodo,
			completedCount,
			addTodo,
			editTodo,
			todoInput,
			removeTodo,
			toggleTodo,
			toggleTodos,
			clearCompleted,
			saveTodo,
			undo,
			hasUndoOperations
		} = this.properties;

		const todoCount = todos.length;
		const allCompleted = todoCount > 0 && completedCount === todoCount;

		return v('section', { classes: this.classes(css.todoapp) }, [
			failed ? 'FAILED' : null,
			w<TodoHeader>('todo-header', { todo: currentTodo, todoInput, allCompleted, addTodo, toggleTodos, todoCount, undo, hasUndoOperations }),
			v('section', {}, [
				w(TodoListOutlet, { todos, editTodo, removeTodo, toggleTodo, saveTodo })
			]),
			todoCount ? w(TodoFooterOutlet, { clearCompleted, activeCount, todoCount }) : null
		]);
	}
}

export default TodoApp;
