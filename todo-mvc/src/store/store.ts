import { Evented } from '@dojo/core/Evented';
import { JsonPatch, PatchOperation } from './patch/JsonPatch';
import { JsonPointer } from './patch/JsonPointer';
import { isThenable } from '@dojo/shim/Promise';

export interface ProcessResult<S = any> {
	patchedDocument: S;
	undoOperations: PatchOperation[];
}

export interface Process<S = any> {
	(state: S): ProcessResult;
}

export interface Operation {
	(state: any, ...args: any[]): PatchOperation | PatchOperation[];
}

/**
 * Interface for a Store that contains an object that is used to represent an application's
 * state tree
 *
 * @template S State object type, defaults to any.
 */
export interface Store<S = any> extends Evented {
	runProcess(process: Process): void;
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
	public get = this._get.bind(this);

	constructor(initialState: S = <S> {}) {
		super({});
		this._state = initialState;
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

	public get hasUndoOperations(): boolean {
		return this._undoStack.length > 0;
	}

	private _get(pointer: string): any {
		const jsonPointer = new JsonPointer(pointer);
		return jsonPointer.get(this._state);
	}

	private _flush(undoOps?: any[]) {
		if (undoOps) {
			this._undoStack.unshift(undoOps);
		}
		this.emit({ type: 'invalidate' });
	}

	private _createProcessRunner(operations: Operation[], transformer: any) {
		operations = [ ...operations ];
		return (...args: any[]) => {
			const transformedArgs = transformer ? transformer(...args) : args;
			let undoOperations: any[] = [];

			const cancel = (patchOperations?: PatchOperation | PatchOperation[]) => {
				const patch = new JsonPatch(undoOperations);
				this._state = patch.apply(this._state);
				if (patchOperations) {
					const patch = new JsonPatch(patchOperations);
					this._state = patch.apply(this._state);
				}
				this._flush();
			};

			const next = (patchOperations?: PatchOperation | PatchOperation[]) => {
				if (patchOperations) {
					const patch = new JsonPatch(patchOperations);
					const patchedState = patch.apply(this._state);
					undoOperations.push(...patchedState.undoOperations);
					this._state = patchedState.patchedObject;
				}

				const operation = operations.shift();
				if (operation) {
					operation({ next, cancel }, this.get, transformedArgs);
					if (isThenable(Promise)) {
						this._flush();
					}
				}
				else {
					this._flush(undoOperations);
				}
			};
			next();
		};
	}
}

export function createStore<S extends object>(initialState?: S): Store<S> {
	return new Store<S>(initialState);
}

export default createStore;
