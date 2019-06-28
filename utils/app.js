import { ACC_API } from './index';
import {
 doDelete, doPatch, doGet, doPost,
} from './requestService';

export const transferOwnership = (appId, info) => doPost(`${ACC_API}/app/${appId}/changeowner`, info);

export const getPermission = appId => new Promise((resolve, reject) => {
		fetch(`${ACC_API}/app/${appId}/permissions`, {
			method: 'GET',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
		})
			.then(res => res.json())
			.then(data => resolve(data.body))
			.catch(error => reject(error));
	});

export const getAppInfo = appId => doGet(`${ACC_API}/app/${appId}`);

export const updatePermission = (appId, username, info) => doPatch(`${ACC_API}/app/${appId}/permission/${username}`, info);

export const newPermission = (appId, info) => new Promise((resolve, reject) => {
		fetch(`${ACC_API}/app/${appId}/permissions`, {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(info),
		})
			.then(res => res.json())
			.then(data => resolve(data))
			.catch(error => reject(error));
	});

export const deletePermission = (appId, username) => new Promise((resolve, reject) => {
		fetch(`${ACC_API}/app/${appId}/permission/${username}`, {
			method: 'DELETE',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
		})
			.then(res => res.json())
			.then(data => resolve(data))
			.catch(error => reject(error));
	});

export const deleteApp = appId => doDelete(`${ACC_API}/app/${appId}`);

export const getShare = appId => doGet(`${ACC_API}/app/${appId}/share`);

export const createShare = (appId, payload) => doPost(`${ACC_API}/app/${appId}/share`, payload);

export const getAppPlan = appName => doGet(`${ACC_API}/app/${appName}/plan`);

export const createSubscription = (token, plan, appName) => doPost(`${ACC_API}/app/${appName}/subscription`, { token, plan });

export const deleteSubscription = appName => doDelete(`${ACC_API}/app/${appName}/subscription`);

export const getAppMetrics = appId => new Promise((resolve, reject) => {
		fetch(`${ACC_API}/app/${appId}/metrics`, {
			method: 'GET',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
		})
			.then(res => res.json())
			.then(data => resolve(data.body))
			.catch(error => reject(error));
	});

export const getPublicKey = appId => new Promise((resolve, reject) => {
		fetch(`${ACC_API}/app/${appId}/public_key`, {
			credentials: 'include',
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		})
			.then(async (res) => {
				const data = await res.json();
				if (res.status >= 400) {
					reject(data);
				}
				resolve(data);
			})
			.catch(error => reject(error));
	});

export const setPublicKey = (appId, key, role) => new Promise((resolve, reject) => {
		fetch(`${ACC_API}/app/${appId}/public_key`, {
			method: 'PUT',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ public_key: key, role_key: role }),
		})
			.then(async (res) => {
				const data = await res.json();
				if (res.status >= 400) {
					reject(data);
				}
				resolve({ ...data.body, message: data.message });
			})
			.catch(error => reject(error));
	});
