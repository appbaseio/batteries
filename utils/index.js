// export const ACC_API = 'https://accapi.appbase.io';
// export const SCALR_API = 'https://scalr.api.appbase.io';
export const ACC_API = 'https://accapi-staging.bottleneck.io';
export const SCALR_API = 'https://api-staging.bottleneck.io';

export function getCredentials(appId) {
	return new Promise((resolve, reject) => {
		fetch(`${ACC_API}/app/${appId}/permissions`, {
			method: 'GET',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
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
