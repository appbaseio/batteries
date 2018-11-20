import { ACC_API } from './index';
import {
 doDelete, doPatch, doGet, doPost,
} from './requestService';

export const transferOwnership = (appId, info) => doPost(`${ACC_API}/app/${appId}/changeowner`, info);

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

export const getPermission = () => new Promise((resolve, reject) => {
		const authToken = getAuthToken();

		fetch(`${ACC_API}/_permissions`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Basic ${authToken}`,
			},
		})
			.then(res => res.json())
			.then(data => resolve(data))
			.catch(error => reject(error));
	});

export const updatePermission = (appId, username, info) => doPatch(`${ACC_API}/app/${appId}/permission/${username}`, info);

export const newPermission = (appId, info) => new Promise((resolve, reject) => {
		const authToken = getAuthToken();
		fetch(`${ACC_API}/_permission`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Basic ${authToken}`,
			},
			body: JSON.stringify(info),
		})
			.then(res => res.json())
			.then(data => resolve(data))
			.catch(error => reject(error));
	});

export const deletePermission = (appId, username) => new Promise((resolve, reject) => {
		const authToken = getAuthToken();
		fetch(`${ACC_API}/app/${appId}/permission/${username}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Basic ${authToken}`,
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
