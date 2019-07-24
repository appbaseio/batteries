import { getURL } from '../../constants/config';
import { getAuthHeaders } from './mappings';

export function getPreferences(name, credentials) {
	const { username, password } = sessionStorage;
	return new Promise((resolve, reject) => {
		const ACC_API = getURL();
		fetch(`${ACC_API}/${name}/_preferences`, {
			method: 'GET',
			headers: {
				...getAuthHeaders(credentials),
				'Content-Type': 'application/json',
			},
		})
			.then(res => res.json())
			.then(res => resolve(res))
			.catch((e) => {
				console.error(e);
				reject(e);
			});
	});
}

export function setPreferences(name, credentials, preferences) {
	const ACC_API = getURL();

	const { username, password } = sessionStorage;
	return new Promise((resolve, reject) => {
		fetch(`${ACC_API}/${name}/_preferences`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				...getAuthHeaders(credentials),
			},
			body: JSON.stringify(preferences),
		})
			.then(() => resolve())
			.catch((e) => {
				console.error(e);
				reject(e);
			});
	});
}
