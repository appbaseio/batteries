import { getURL } from '../../constants/config';

export function getPreferences(name) {
	return new Promise((resolve, reject) => {
		const ACC_API = getURL();
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
	const ACC_API = getURL();
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
