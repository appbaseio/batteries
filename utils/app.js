import {
 doDelete, doPatch, doGet, doPost,
} from './requestService';
import { getURL } from '../../constants/config';

export const transferOwnership = (appId, info) => {
	const ACC_API = getURL();
	return doPost(`${ACC_API}/app/${appId}/changeowner`, info);
};

const getAuthToken = () => {
	let token = null;
	try {
		token = sessionStorage.getItem('authToken');
	} catch (e) {
		console.error(e);
	}
	return token;
};

export const getPermission = () => {
	const authToken = getAuthToken();
	const ACC_API = getURL();

	return doGet(`${ACC_API}/_permissions`, {
		'Content-Type': 'application/json',
		Authorization: `Basic ${authToken}`,
	});
};

export const updatePermission = (appId, username, info) => {
	const ACC_API = getURL();
	return doPatch(`${ACC_API}/_permission/${username}`, info);
};

export const newPermission = (appId, info) => {
	const authToken = getAuthToken();
	const ACC_API = getURL();
	return doPost(`${ACC_API}/_permission`, info, {
		'Content-Type': 'application/json',
		Authorization: `Basic ${authToken}`,
	});
};

export const deletePermission = (appId, username) => new Promise((resolve, reject) => {
		const authToken = getAuthToken();
		const ACC_API = getURL();
		fetch(`${ACC_API}/_permission/${username}`, {
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

export const deleteApp = (appId) => {
	const ACC_API = getURL();
	return doDelete(`${ACC_API}/${appId}`);
};

export const getShare = (appId) => {
	const ACC_API = getURL();
	return doGet(`${ACC_API}/app/${appId}/share`);
};

export const createShare = (appId, payload) => {
	const ACC_API = getURL();
	return doPost(`${ACC_API}/app/${appId}/share`, payload);
};

export const getAppPlan = () => {
	const ACC_API = getURL();
	return doGet(`${ACC_API}/arc/plan`);
};

export const createSubscription = (token, plan, test) => {
	const ACC_API = getURL();
	const URL = test ? `${ACC_API}/arc/subscription?test=true` : `${ACC_API}/arc/subscription`;
	return doPost(URL, { token, plan });
};

export const deleteSubscription = (payload) => {
	const ACC_API = getURL();
	return doDelete(`${ACC_API}/arc/subscription`, undefined, undefined, payload);
};

export const getPublicKey = () => new Promise((resolve, reject) => {
		const ACC_API = getURL();
		const authToken = getAuthToken();
		fetch(`${ACC_API}/_public_key`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Basic ${authToken}`,
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

export const setPublicKey = (name, key, role) => new Promise((resolve, reject) => {
		const ACC_API = getURL();
		const authToken = getAuthToken();
		fetch(`${ACC_API}/_public_key`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Basic ${authToken}`,
			},
			body: JSON.stringify({ public_key: key, role_key: role }),
		})
			.then(async (res) => {
				const data = await res.json();

				if (data.error && data.status >= 400) {
					reject(data);
				}
				resolve({
					public_key: key,
					role_key: role,
					...data.body,
					message: data.message,
				});
			})
			.catch(error => reject(error));
	});

export const updatePaymentMethod = (token, product) => {
	const ACC_API = getURL();
	return doPost(`${ACC_API}/user/payment`, {
		token,
		product,
	});
};

export const getFunctions = (name) => {
	const ACC_API = getURL();
	const a = new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve([
				{
					_id: 'nodeinfo',
					trigger: {},
					extraRequestPayload: {},
					enabled: true,
					function: {
						image: 'username/image:version',
						invocation_count: 12,
						envVars: {
							additionalProp1: 'string',
							additionalProp2: 'string',
							additionalProp3: 'string',
						},
						service: 'nodeinfo',
					},
				},
				{
					_id: 'nodeinfo_1',
					trigger: {},
					extraRequestPayload: {},
					enabled: false,
					function: {
						image: 'username/image:version',
						invocation_count: 1212,
						envVars: {},
						service: 'nodeinfo_1',
					},
				},
			]);
		}, 500);
	});
	return a;
};


export const updateFunctions = (name, payload) => {
	const ACC_API = getURL();
	const a = new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve(
				{
					...payload,
				},
			);
		}, 1000);
	});
	return a;
};
