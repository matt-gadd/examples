import { JsonPointer, walk, PointerTarget } from './JsonPointer';

export enum OperationType {
	ADD = 'add',
	REMOVE = 'remove',
	REPLACE = 'replace',
	GET = 'get'
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

export interface GetPatchOperation extends BaseOperation {
	op: OperationType.GET;
}

export interface ReplacePatchOperation<T = any> extends BaseOperation {
	op: OperationType.REPLACE;
	value: T;
}

export type PatchOperation = AddPatchOperation | RemovePatchOperation | GetPatchOperation | ReplacePatchOperation;

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
		delete pointerTarget.target[pointerTarget.segment];
	}
	return pointerTarget.object;
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
				operations.push({ op: OperationType.REMOVE, path: nextPath });
			}
			else if (isObjectOrArray(from[key], to[key])) {
				operations.push(...diff(from[key], to[key], nextPath.segments));
			}
			else {
				operations.push({ op: OperationType.REPLACE, path: nextPath, value: to[key] });
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

export class JsonPatch {
	private _operations: PatchOperation[];

	constructor(operations: PatchOperation | PatchOperation[]) {
		this._operations = Array.isArray(operations) ? operations : [ operations ];
	}

	public apply(object: any): any {
		const patchedObject = this._operations.reduce((object, next) => {
			switch (next.op) {
				case OperationType.ADD:
					return add(walk(next.path.segments, object), next.value);
				case OperationType.REPLACE:
					return replace(walk(next.path.segments, object), next.value);
				case OperationType.REMOVE:
					return remove(walk(next.path.segments, object));
				case OperationType.GET:
					break;
				default:
					throw new Error('Unknown operation');
			}
			return object;
		}, object);
		const undoOperations = diff(patchedObject, object);
		return { patchedObject, undoOperations };
	}
}
