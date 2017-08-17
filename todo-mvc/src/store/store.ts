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
	private _undoStack: { process: any, undoOperations: PatchOperation[] }[] = [];

	public createProcessRunner = this._createProcessRunner.bind(this);
	public get = this._get.bind(this);

	constructor(initialState: S = <S> {}) {
		super({});
		this._state = initialState;
	}

	public undo(...process: any[]) {
		if (this._undoStack.length > 0) {
			let foundIndex = -1;
			this._undoStack.some((undo, index) => {
				if (process.indexOf(undo.process) > -1) {
					foundIndex = index;
					return true;
				}
				return false;
			});

			if (foundIndex > -1) {
				const ops: { process: any, undoOperations: PatchOperation[] }[] = this._undoStack.splice(0, foundIndex + 1);
				this._state = ops.reduce((state, op) => {
					const patch = new JsonPatch(op.undoOperations.reverse());
					const patchedState = patch.apply(state);
					return patchedState.patchedObject;
				}, this._state);

				this.emit({ type: 'invalidate' });
			}
		}
	}

	public get hasUndoOperations(): boolean {
		return this._undoStack.length > 0;
	}

	private _get(pointer: string): any {
		const jsonPointer = new JsonPointer(pointer);
		return jsonPointer.get(this._state);
	}

	private _flush(undoOps?: { process: any, undoOperations: PatchOperation[] }) {
		if (undoOps) {
			this._undoStack.unshift(undoOps);
		}
		this.emit({ type: 'invalidate' });
	}

	private _createProcessRunner(operations: Operation[], transformer: any) {
		return (...args: any[]) => {
			const operationsCopy = [ ...operations ];
			const transformedArgs = transformer ? transformer(...args) : args;
			let undoOperations: any[] = [];

			const cancel = (patchOperations?: PatchOperation | PatchOperation[]) => {
				const patch = new JsonPatch([ ...undoOperations].reverse());
				const patchedState = patch.apply(this._state);
				this._state = patchedState.patchedObject;
				if (patchOperations) {
					const patch = new JsonPatch(patchOperations);
					const patchedState = patch.apply(this._state);
					this._state = patchedState.patchedObject;
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

				const operation = operationsCopy.shift();
				if (operation) {
					const promise = operation({ next, cancel }, this.get, transformedArgs);
					if (isThenable(promise)) {
						/*this._flush({ process: operations, undoOperations });*/
						/*undoOperations = [];*/
					}
				}
				else {
					this._flush({ process: operations, undoOperations });
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
