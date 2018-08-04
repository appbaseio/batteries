export const ACC_API = 'https://accapi.appbase.io';
export const SCALR_API = 'https://scalr.api.appbase.io';
export const BILLING_API = 'https://transactions.appbase.io';
// export const ACC_API = 'https://accapi-staging.bottleneck.io';
// export const SCALR_API = 'https://api-staging.bottleneck.io';

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
				let result = data.body.find(permission =>
						permission.read &&
						permission.write &&
						permission.referers.includes('*') &&
						permission.include_fields.includes('*'));
				if (!result) {
					result = data.body.find(permission =>
							permission.read &&
							permission.write &&
							permission.referers.includes('*'));
				}
				if (!result) {
					result = data.body.find(permission => permission.read && permission.write);
				}
				if (!result) {
					result = data.body.find(permission => permission.read);
				}
				resolve(result);
			})
			.catch((e) => {
				reject(e);
			});
	});
}

function getBillingStatus(id) {
	return fetch(`${BILLING_API}/api/me`, {
		method: 'POST',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ c_id: id }),
	});
}

export function checkUserStatus() {
	return new Promise((resolve, reject) => {
		fetch(`${ACC_API}/user`, {
			method: 'GET',
			credentials: 'include',
			headers: {
				'content-type': 'application/json',
			},
		})
			.then(res => res.json())
			.then((res) => {
				if (res.body.c_id) return res.body.c_id;
				reject();
				return null;
			})
			.then(getBillingStatus)
			.then(res => res.json())
			.then((res) => {
				if (!res.message || res.plan === 'free') {
					resolve({
						isPaidUser: false,
						plan: 'free',
					});
				}
				resolve({
					isPaidUser: true,
					plan: res.plan,
				});
			})
			.catch(() => {
				reject();
			});
	});
}
