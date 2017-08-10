import { RemovePatchOperation, ReplacePatchOperation, AddPatchOperation, OperationType } from './patch/JsonPatch';
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
