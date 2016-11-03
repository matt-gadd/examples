let locale = 'root';
const instances: any[] = [];

const i18n = {
	get locale() {
		return locale;
	},
	set locale(locale) {
		locale = locale;
	},
	add(instance: any) {
		instances.push(instance);
	}
};

export default i18n;
