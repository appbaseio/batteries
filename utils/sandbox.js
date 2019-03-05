import { getURL } from '../../constants/config';
import { getAuthHeaders } from './mappings';

export function getPreferences(name) {
	const { username, password } = sessionStorage;
	return new Promise((resolve, reject) => {
		const ACC_API = getURL();
		fetch(`${ACC_API}/app/${name}/preferences`, {
			method: 'GET',
			headers: {
				...getAuthHeaders(`${username}:${password}`),
			},
		})
			.then(res => res.json())
			.then(res => resolve(res.message))
			.catch((e) => {
				console.error(e);
				reject(e);
			});
	});
}

export function setPreferences(name, preferences) {
	const ACC_API = getURL();

	const { username, password } = sessionStorage;
	return new Promise((resolve, reject) => {
		fetch(`${ACC_API}/app/${name}/preferences`, {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
				...getAuthHeaders(`${username}:${password}`),
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
