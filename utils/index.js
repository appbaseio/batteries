import get from 'lodash/get';
import { doGet, doPost } from './requestService';
import { getURL } from '../../constants/config';

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
		token = sessionStorage.getItem('authToken');
	} catch (e) {
		console.error(e);
	}
	return token;
};

export function getCredentials(appId) {
	return new Promise((resolve, reject) => {
		const authToken = getAuthToken();
		const ACC_API = getURL();
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
export const getUserAppsPermissions = () => {
	const ACC_API = getURL();
	return doGet(`${ACC_API}/_permissions`);
};

export const setUserInfo = userInfo => {
	const ACC_API = getURL();
	return doPost(`${ACC_API}/arc/metadata`, userInfo, {
		'Content-Type': 'application/json',
	});
};
