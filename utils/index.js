import get from 'lodash/get';
import { doGet } from './requestService';

export const ACC_API = 'http://localhost:8000';
export const SCALR_API = 'http://localhost:8000';
// export const ACC_API = 'https://accapi.appbase.io';
// export const SCALR_API = 'https://scalr.api.appbase.io';
// export const ACC_API = 'https://accapi-staging.bottleneck.io';
// export const SCALR_API = 'https://api-staging.bottleneck.io';

// Get credentials if permissions are already present
export function getCredentialsFromPermissions(permissions = []) {
	let result = permissions.find(
		permission => permission.read
			&& permission.write
			&& get(permission, 'referers', []).includes('*')
			&& get(permission, 'include_fields', []).includes('*'),
	);
	if (!result) {
		result = permissions.find(
			permission => permission.read
				&& permission.write
				&& get(permission, 'referers', []).includes('*'),
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

export function getReadCredentialsFromPermissions(permissions = []) {
	let result = permissions.find(
		permission => permission.read
			&& !permission.write
			&& get(permission, 'referers', []).includes('*')
			&& get(permission, 'include_fields', []).includes('*'),
	);
	if (!result) {
		result = permissions.find(
			permission => permission.read
				&& !permission.write
				&& get(permission, 'referers', []).includes('*'),
		);
	}
	if (!result) {
		result = permissions.find(permission => permission.read && !permission.write);
	}
	return result || false;
}

const getAuthToken = () => {
	let token = null;
	try {
		// eslint-disable-next-line
		token = JSON.parse(JSON.parse(localStorage.getItem('persist:root')).user).data.authToken;
	} catch (e) {
		console.error(e);
	}
	return token;
};

export function getCredentials(appId) {
	return new Promise((resolve, reject) => {
		const authToken = getAuthToken();
		fetch(`${ACC_API}/app/${appId}/permissions`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Basic ${authToken}`,
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
export const getUserAppsPermissions = () => doGet(`${ACC_API}/_permissions`);
export const setUserInfo = userInfo =>
	new Promise((resolve, reject) => {
		const authToken = getAuthToken();
		fetch(`${ACC_API}/user/profile`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Basic ${authToken}`,
			},
			body: JSON.stringify(userInfo),
		})
			.then(res => res.json())
			.then(data => resolve(data))
			.catch(error => reject(error));
	});
