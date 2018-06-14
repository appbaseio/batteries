const ACC_API = 'https://accapi.appbase.io/';
const SCALR_API = 'https://scalr.api.appbase.io/';

export function getCredentials(appId) {
	return new Promise((resolve, reject) => {
		fetch(`${ACC_API}app/${appId}/permissions`, {
			method: 'GET',
			credentials: 'include',
			headers: {
				'content-type': 'application/json',
			},
		})
			.then(res => res.json())
			.then((data) => {
				const permissions = data.body
					.filter(permission => (permission.read && permission.write));
				resolve(permissions[0]);
			})
			.catch((e) => {
				reject(e);
			});
	});
}

export function getMappings(appName, credentials) {
	return new Promise((resolve, reject) => {
		fetch(`${SCALR_API}${appName}/_mapping`, {
			method: 'GET',
			credentials: 'include',
			headers: {
				'content-type': 'application/json',
				Authorization: `Basic ${btoa(credentials)}`,
			},
		})
			.then(res => res.json())
			.then((data) => {
				const systemTypes = ['~logs', '~percolator', '.logs', '.percolator', '_default_'];
				const types = Object
					.keys(data[appName].mappings)
					.filter(type => !systemTypes.includes(type));

				let mappings = {};
				types.forEach((type) => {
					mappings = {
						...mappings,
						[type]: data[appName].mappings[type],
					};
				});
				resolve(mappings);
			})
			.catch((e) => {
				reject(e);
			});
	});
}

export function updateMapping(mapping, field, type) {
	// eslint-disable-next-line
	let _mapping = { ...mapping };

	Object.keys(_mapping).forEach((key) => {
		if (key === field) {
			_mapping = {
				..._mapping,
				[key]: {
					..._mapping[key],
					type,
				},
			};
		} else if (!Array.isArray(_mapping[key]) && typeof (_mapping[key]) !== 'string') {
			_mapping = {
				..._mapping,
				[key]: {
					..._mapping[key],
					...updateMapping(_mapping[key], field, type),
				},
			};
		}
	});
	return _mapping;
}
