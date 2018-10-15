import { ACC_API } from './index';

export function getPreferences(name) {
	return new Promise((resolve, reject) => {
		fetch(`${ACC_API}/app/${name}/preferences`, {
			method: 'GET',
			credentials: 'include',
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
	return new Promise((resolve, reject) => {
		fetch(`${ACC_API}/app/${name}/preferences`, {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
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
