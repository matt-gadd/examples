import { h } from 'maquette';

const registry = new Map<string, any>();

export function addFactory(tagName: string, factory: any) {
	registry.set(tagName, factory);
}

export function getFactory(tagName: string) {
	return registry.get(tagName);
}

export function w(tagNameOrFactory: any, options: any): any {
	if (typeof tagNameOrFactory === 'string') {
		return {
			factory: getFactory(tagNameOrFactory),
			options: options,
			create() {
				return this.factory(options);
			}
		};
	}
	else if (typeof tagNameOrFactory === 'function') {
		return {
			factory: tagNameOrFactory,
			options: options,
			create() {
				return tagNameOrFactory(options);
			}
		};
	}
}

export default function d(tagNameOrFactory: any, optionsOrChildren?: any, children?: any): any {
	const isOptionsArray = Array.isArray(optionsOrChildren);
	const options = isOptionsArray ? {} : optionsOrChildren;
	children = children || isOptionsArray ? optionsOrChildren : [];

	if (typeof tagNameOrFactory === 'string') {
		return {
			children: children.filter((child: any) => child),
			render() {
				return h(tagNameOrFactory, options, this.children);
			}
		};
	}
	else if (typeof tagNameOrFactory === 'function') {
		return {
			factory: tagNameOrFactory,
			options: options,
			create() {
				return tagNameOrFactory(options);
			}
		};
	}
}

