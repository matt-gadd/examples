import { h } from 'maquette';

export default function d(tagNameOrFactory: any, optionsOrChildren: any, children?: any): any {
	const isOptionsArray = Array.isArray(optionsOrChildren);
	const options = isOptionsArray ? {} : optionsOrChildren;
	children = children || (isOptionsArray ? optionsOrChildren : []);

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
				console.log('factoried widget');
				return tagNameOrFactory(options);
			}
		};
	}
}

