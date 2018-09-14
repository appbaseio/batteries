export const ACC_API = 'https://accapi.appbase.io';
export const SCALR_API = 'https://scalr.api.appbase.io';
export const BILLING_API = 'https://transactions.appbase.io';
// export const ACC_API = 'https://accapi-staging.bottleneck.io';
// export const SCALR_API = 'https://api-staging.bottleneck.io';

// Get credentials if permissions are already present
export function getCredentialsFromPermissions(permissions = []) {
	let result = permissions.find(
		permission => permission.read
			&& permission.write
			&& permission.referers.includes('*')
			&& permission.include_fields.includes('*'),
	);
	if (!result) {
		result = permissions.find(
			permission => permission.read && permission.write && permission.referers.includes('*'),
		);
	}
	if (!result) {
		result = permissions.find(permission => permission.read && permission.write);
	}
	if (!result) {
		result = permissions.find(permission => permission.read);
	}
	return result;
}

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
				resolve(getCredentialsFromPermissions(data.body));
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
				if (!res.plan || res.plan === 'free') {
					resolve({
						isPaidUser: !!res.plan,
						plan: res.plan,
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

export function isEqual(x, y) {
	/* eslint-disable */
	if (x === y) return true;
	if (!(x instanceof Object) || !(y instanceof Object)) return false;
	if (x.constructor !== y.constructor) return false;

	for (const p in x) {
		if (!x.hasOwnProperty(p)) continue;
		if (!y.hasOwnProperty(p)) return false;
		if (x[p] === y[p]) continue;
		if (typeof x[p] !== 'object') return false;
		if (!isEqual(x[p], y[p])) return false;
	}

	for (const p in y) {
		if (y.hasOwnProperty(p) && !x.hasOwnProperty(p)) return false;
	}
	return true;
}

export const setUserInfo = userInfo =>
	new Promise((resolve, reject) => {
		fetch(`${ACC_API}/user/profile`, {
			method: 'PUT',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(userInfo),
		})
			.then(res => res.json())
			.then(data => resolve(data))
			.catch(error => reject(error));
	});
