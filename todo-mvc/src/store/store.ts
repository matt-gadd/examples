import { Evented } from '@dojo/core/Evented';
import { JsonPatch, PatchOperation } from './patch/JsonPatch';

export interface ProcessResult<S = any> {
	patchedDocument: S;
	undoOperations: PatchOperation[];
}

export interface Process<S = any> {
	(state: S): ProcessResult;
}

export interface ProcessInstruction<S = any> {
	do: (...args: any[]) => Process<S>;
}

export interface Operation {
	(state: any, ...args: any[]): undefined | PatchOperation | PatchOperation[];
}

/**
 * Interface for a Store that contains an object that is used to represent an application's
 * state tree
 *
 * @template S State object type, defaults to any.
 */
export interface Store<S = any> extends Evented {
	getState(): Readonly<S>;
	runProcess(process: Process): void;
}

/**
 * Create a process of operations
 */
export function process(...operations: Operation[]) {
	return {
		do: (...args: any[]): (state: any) => ProcessResult => {
			return (state: any): ProcessResult => {
				const undoOperations: any[] = [];
				const patchedDocument = operations.reduce((newState: any, operation: Operation) => {
					const patchOperations = operation(newState, ...args);
					if (!patchOperations) {
						return newState;
					}
					const patch = new JsonPatch(patchOperations);
					const patchedState = patch.apply(newState);
					undoOperations.push(...patchedState.undoOperations);
					return patchedState.patchedObject;
				}, state);
				return {
					undoOperations,
					patchedDocument
				};
			};
		}
	};
}

/**
 * A store is an object that is used to represent an application's state
 * tree
 *
 * @template S State object type, defaults to any.
 */
export class Store<S = any> extends Evented implements Store<S> {
	private _state: S;
	private _undoStack: PatchOperation[][] = [];

	public createProcessRunner = this._createProcessRunner.bind(this);

	constructor(initialState: S = <S> {}) {
		super({});
		this._state = initialState;
	}

	public get state(): Readonly<S> {
		return this._state;
	}

	public runProcess(process: Process) {
		const { undoOperations, patchedDocument } = process(this._state);
		this._state = patchedDocument;
		this._undoStack.unshift(undoOperations);
		this.emit({ type: 'invalidate' });
	}

	public undo(count = 1) {
		if (this._undoStack.length > 0) {
			const ops: PatchOperation[][] = this._undoStack.splice(0, count);

			this._state = ops.reduce((state, op) => {
				const patch = new JsonPatch(op);
				const patchedState = patch.apply(state);
				return patchedState.patchedObject;
			}, this._state);

			this.emit({ type: 'invalidate' });
		}
	}

	private _createProcessRunner(process: ProcessInstruction) {
		return (...args: any[]) => {
			this.runProcess(process.do(...args));
		};
	};
}

export function createStore<S extends object>(initialState?: S): Store<S> {
	return new Store<S>(initialState);
}

export default createStore;
