import Map from 'dojo-shim/Map';
import i18n from './i18n';

export default class I18nBundle<T>{
	private bundles: Map<string, T>;

	constructor(lang: string, messages: T) {
		this.bundles = new Map<string, T>();
		this.bundles.set('root', messages);
		this.bundles.set(lang, messages);
	}

	get(locale?: string): T {
		if (!locale) {
			locale = i18n.locale;
		}
		return this.bundles.get(locale || 'root');
	}

	add(lang: string, messages: T) {
		this.bundles.set(lang, messages);
	}
}
