import Bundle from '../../i18n/createBundle';
import fr from './fr/createTodoFooter';

const bundle = new Bundle('en', {
	clear: 'Clear Completed'
});

bundle.add('fr', fr);

export default bundle;
