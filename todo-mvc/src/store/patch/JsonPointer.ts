export function decode(segment: string) {
	return segment.replace(/~1/g, '/').replace(/~0/g, '~');
}

function encode(segment: string) {
	return segment.replace(/~/g, '~0').replace(/\//g, '~1');
}

export interface PointerTarget {
	object: any;
	target: any;
	segment: string;
}

export function walk(segments: string[], object: any, clone = true): PointerTarget {
	if (clone) {
		object = { ...object };
	}
	const pointerTarget: PointerTarget = {
		object,
		target: object,
		segment: ''
	};

	return segments.reduce((pointerTarget, segment, index) => {
		if (Array.isArray(pointerTarget.target) && segment === '-') {
			segment = String(pointerTarget.target.length);
		}
		if (index + 1 < segments.length) {
			if (clone) {
				let target = pointerTarget.target[segment];
				if (Array.isArray(target)) {
					target = [ ...target ];
				}
				else if (typeof target === 'object') {
					target = { ...target };
				}
				else {
					target = target;
				}
				pointerTarget.target[segment] = target;
				pointerTarget.target = target;
			}
			else {
				pointerTarget.target = pointerTarget.target[segment];
			}
		}
		else {
			pointerTarget.segment = segment;
		}
		return pointerTarget;
	}, pointerTarget);
}

export class JsonPointer {
	private readonly _segments: string[];

	constructor(segments: string | string[]) {
		if (Array.isArray(segments)) {
			this._segments = segments;
		}
		else {
			this._segments = segments.split('/');
			this._segments.shift();
		}
		this._segments = this._segments.map(decode);
	}

	public get segments(): string[] {
		return this._segments;
	}

	public get path(): string {
		return `/${this._segments.map(encode).join('/')}`;
	}

	get(object: any): any {
		if (this.segments.length === 0) {
			return object;
		}
		const pointerTarget: PointerTarget = walk(this.segments, object, false);
		return pointerTarget.target[pointerTarget.segment];
	}
}
