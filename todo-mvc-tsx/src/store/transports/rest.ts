import { To, From, Transport } from './../Strategy';
const scriptURL = require('sw-loader!../../server');
import { createClient } from 'service-mocker/client';

const client = createClient(scriptURL);

const ready = client.ready;

export type RestTransportConfig = {
	api: (state: any, method: string) => string;
};

export type RestTransportFactory = (config: RestTransportConfig) => Transport;

export function get(config: RestTransportConfig) {
	return (to: To, from: From, state: any) => {
		return ready.then(() => {
			return fetch(config.api(state, 'get'))
				.then((response) => response.json())
				.then(from);
		});
	};
}

export function del(config: RestTransportConfig) {
	return (to: To, from: From, state: any) => {
		return ready.then(() => {
			return fetch(config.api(state, 'delete'), {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' }
			});
		});
	};
}

export function put(config: RestTransportConfig) {
	return (to: To, from: From, state: any) => {
		return ready.then(() => {
			return fetch(config.api(state, 'put'), {
				body: JSON.stringify(to(state)),
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' }
			}).then((response: Response) => response.json().then(from));
		});
	};
}

export function post(config: RestTransportConfig) {
	return (to: To, from: From, state: any) => {
		return ready.then(() => {
			return fetch(config.api(state, 'post'), {
				body: JSON.stringify(to(state)),
				method: 'POST',
				headers: { 'Content-Type': 'application/json' }
			}).then((response: Response) => response.json().then(from));
		});
	};
}
