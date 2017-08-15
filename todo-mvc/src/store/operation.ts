import { RemovePatchOperation, ReplacePatchOperation, AddPatchOperation, TestPatchOperation, OperationType } from './patch/JsonPatch';
import { JsonPointer } from './patch/JsonPointer';

export function add(path: string, value: any): AddPatchOperation {
	return {
		op: OperationType.ADD,
		path: new JsonPointer(path),
		value
	};
}

export function replace(path: string, value: any): ReplacePatchOperation {
	return {
		op: OperationType.REPLACE,
		path: new JsonPointer(path),
		value
	};
}

export function remove(path: string): RemovePatchOperation {
	return {
		op: OperationType.REMOVE,
		path: new JsonPointer(path)
	};
}

export function test(path: string, value: any): TestPatchOperation {
	return {
		op: OperationType.TEST,
		path: new JsonPointer(path),
		value
	};
}
