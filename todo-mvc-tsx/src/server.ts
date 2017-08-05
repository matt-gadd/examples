import { createServer } from 'service-mocker/server';

const { router } = createServer();

let id = 0;

let todos = [
	{
		uuid: `${id++}`,
		label: 'hello world',
		completed: false
	}
];

router.get('/todos', (req, res) => {
	res.json(todos);
});

router.delete('/todo/:id', (req, res) => {
	const id = req.params.id;
	todos = todos.filter((todo) => todo.uuid !== id);
	res.sendStatus(200);
});

router.put('/todo/:id', (req, res) => {
	req.json().then((json) => {
		todos = todos.map((todo) => {
			if (todo.uuid === json.uuid) {
				return json;
			}
			return todo;
		});
		res.json(json);
	});
});

router.post('/todo', (req, res) => {
	req.json().then((json) => {
		const todo = { ...json, uuid: `${id++}` };
		todos.push(todo);
		res.json(todo);
	});
});
