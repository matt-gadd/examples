import { JsonPointer, walk, PointerTarget } from './JsonPointer';

export enum OperationType {
	ADD = 'add',
	REMOVE = 'remove',
	REPLACE = 'replace',
	TEST = 'test'
}

export interface BaseOperation {
	op: OperationType;
	path: JsonPointer;
}

export interface AddPatchOperation<T = any> extends BaseOperation {
	op: OperationType.ADD;
	value: T;
}

export interface RemovePatchOperation extends BaseOperation {
	op: OperationType.REMOVE;
}

export interface ReplacePatchOperation<T = any> extends BaseOperation {
	op: OperationType.REPLACE;
	value: T;
}

export interface TestPatchOperation<T = any> extends BaseOperation {
	op: OperationType.TEST;
	value: T;
}

export type PatchOperation = AddPatchOperation | RemovePatchOperation | ReplacePatchOperation | TestPatchOperation;

export interface PatchResult {
	updatedObject: any;
	undo: PatchOperation[];
}

function add(pointerTarget: PointerTarget, value: any): any {
	if (Array.isArray(pointerTarget.target)) {
		pointerTarget.target.splice(parseInt(pointerTarget.segment, 10), 0, value);
	}
	else {
		pointerTarget.target[pointerTarget.segment] = value;
	}
	return pointerTarget.object;
}

function replace(pointerTarget: PointerTarget, value: any): any {
	if (Array.isArray(pointerTarget.target)) {
		pointerTarget.target.splice(parseInt(pointerTarget.segment, 10), 1, value);
	}
	else {
		pointerTarget.target[pointerTarget.segment] = value;
	}
	return pointerTarget.object;
}

function remove(pointerTarget: PointerTarget): any {
	if (Array.isArray(pointerTarget.target)) {
		pointerTarget.target.splice(parseInt(pointerTarget.segment, 10), 1);
	}
	else {
		if (pointerTarget.segment) {
			delete pointerTarget.target[pointerTarget.segment];
		}
	}
	return pointerTarget.object;
}

function test(pointerTarget: PointerTarget, value?: any) {
	const target = pointerTarget.segment ? pointerTarget.target[pointerTarget.segment] : pointerTarget.target;
	if (value) {
		return isEqual(target, value);
	}
	else {
		return Boolean(target);
	}
}

export function isObject(value: any): value is Object {
	return Object.prototype.toString.call(value) === '[object Object]';
}

export function isObjectOrArray(from: any, to: any) {
	return (Array.isArray(from) && Array.isArray(to)) || (isObject(from) && isObject(to));
}

export function isEqual(a: any, b: any): boolean {
	if (Array.isArray(a) && Array.isArray(b)) {
		return a.length === b.length && a.every((element: any, i: number) => isEqual(element, b[i]));
	}
	else if (isObject(a) && isObject(b)) {
		const keysForA = Object.keys(a).sort();
		const keysForB = Object.keys(b).sort();
		return isEqual(keysForA, keysForB) && keysForA.every(key => isEqual(a[key], b[key]));
	}
	else {
		return a === b;
	}
}

function diff(from: any, to: any, start: string[] = []): PatchOperation[] {
	const operations: PatchOperation[] = [];
	if (!isObjectOrArray(from, to)) {
		return operations;
	}

	let path: JsonPointer = new JsonPointer(start);
	const fromKeys = Object.keys(from);
	const toKeys = Object.keys(to);

	fromKeys.forEach((key) => {
		const nextPath = new JsonPointer([ ...path.segments, key ]);
		if (!isEqual(from[key], to[key])) {
			if ((key in from) && !(key in to)) {
				const testValue = (new JsonPointer(`/${key}`)).get(from);
				operations.push({ op: OperationType.REMOVE, path: nextPath });
				operations.push({ op: OperationType.TEST, path: nextPath, value: testValue });
			}
			else if (isObjectOrArray(from[key], to[key])) {
				operations.push(...diff(from[key], to[key], nextPath.segments));
			}
			else {
				operations.push({ op: OperationType.REPLACE, path: nextPath, value: to[key] });
				operations.push({ op: OperationType.TEST, path: new JsonPointer(path.segments), value: from });
			}
		}
	});

	toKeys.forEach((key) => {
		const nextPath = new JsonPointer([ ...path.segments, key ]);
		if (!(key in from) && (key in to)) {
			operations.push({ op: OperationType.ADD, path: nextPath, value: to[key] });
		}
	});

	return operations;
}

function inverse(operation: PatchOperation, state: any): any[] {
	if (operation.op === OperationType.ADD) {

		const op = {
			op: OperationType.REMOVE,
			path: operation.path
		};
		const test = {
			op: OperationType.TEST,
			path: operation.path,
			value: operation.value
		};
		return [ op, test ];
	}
	else if (operation.op === OperationType.REPLACE) {
		const op = {
			op: OperationType.REPLACE,
			path: operation.path,
			value: operation.path.get(state)
		};
		const test = {
			op: OperationType.REPLACE,
			path: operation.path,
			value: operation.value
		};
		return [ op, test ];
	}
	else if (operation.op === OperationType.REMOVE) {
		return [{
			op: OperationType.ADD,
			path: operation.path,
			value: operation.path.get(state)
		}];
	}
	throw new Error('Unsupported Op');
}

export class JsonPatch {
	private _operations: PatchOperation[];

	constructor(operations: PatchOperation | PatchOperation[]) {
		this._operations = Array.isArray(operations) ? operations : [ operations ];
	}

	public apply(object: any): any {
		let undoOperations: any[] = [];
		const patchedObject = this._operations.reduce((patchedObject, next) => {
			let object;
			switch (next.op) {
				case OperationType.ADD:
					object = add(walk(next.path.segments, patchedObject), next.value);
					break;
				case OperationType.REPLACE:
					object = replace(walk(next.path.segments, patchedObject), next.value);
					break;
				case OperationType.REMOVE:
					object = remove(walk(next.path.segments, patchedObject));
					break;
				case OperationType.TEST:
					const result = test(walk(next.path.segments, patchedObject), next.value);
					if (!result) {
						throw new Error('test failed');
					}
					return patchedObject;
				default:
					throw new Error('Unknown operation');
			}
			undoOperations = [ ...undoOperations, ...inverse(next, patchedObject) ];
			return object;
		}, object);
		return { patchedObject, undoOperations };
	}
}
