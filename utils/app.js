import { doDelete, doPatch, doGet, doPost, doPut } from './requestService';
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

export const deletePermission = (appId, username) =>
	new Promise((resolve, reject) => {
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

export const deleteApp = appId => {
	const ACC_API = getURL();
	return doDelete(`${ACC_API}/${appId}`);
};

export const getShare = appId => {
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

export const deleteSubscription = payload => {
	const ACC_API = getURL();
	return doDelete(`${ACC_API}/arc/subscription`, undefined, undefined, payload);
};

export const getPublicKey = () =>
	new Promise((resolve, reject) => {
		const ACC_API = getURL();
		const authToken = getAuthToken();
		fetch(`${ACC_API}/_public_key`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Basic ${authToken}`,
			},
		})
			.then(async res => {
				const data = await res.json();
				if (res.status >= 400) {
					reject(data);
				}
				resolve(data);
			})
			.catch(error => reject(error));
	});

export const setPublicKey = (name, key, role) =>
	new Promise((resolve, reject) => {
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
			.then(async res => {
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

export const getFunctions = () => {
	const ACC_API = getURL();
	const authToken = getAuthToken();
	return doGet(`${ACC_API}/_functions`, {
		'Content-Type': 'application/json',
		Authorization: `Basic ${authToken}`,
	});
};

export const getSingleFunction = name => {
	const ACC_API = getURL();
	const authToken = getAuthToken();
	return doGet(`${ACC_API}/_function/${name}`, {
		'Content-Type': 'application/json',
		Authorization: `Basic ${authToken}`,
	});
};

export const updateFunctions = (name, payload) => {
	const ACC_API = getURL();
	const authToken = getAuthToken();
	return doPut(`${ACC_API}/_function/${name}`, payload, {
		'Content-Type': 'application/json',
		Authorization: `Basic ${authToken}`,
	});
};

export const createFunction = (name, payload) => {
	const ACC_API = getURL();
	const authToken = getAuthToken();
	return doPost(
		`${ACC_API}/_function`,
		{ service: name, ...payload },
		{
			'Content-Type': 'application/json',
			Authorization: `Basic ${authToken}`,
		},
		false,
		null,
		true,
	);
};

export const invokeFunction = (name, payload) => {
	const ACC_API = getURL();
	return doPost(
		`${ACC_API}/_function/${name}`,
		payload,
		{
			'Content-Type': 'application/json',
		},
		false,
		null,
		true,
	);
};

export const deleteFunction = name => {
	const ACC_API = getURL();
	const authToken = getAuthToken();
	return doDelete(`${ACC_API}/_function/${name}`, { Authorization: `Basic ${authToken}` });
};

export const reorderFunction = async (source, destination) => {
	const ACC_API = getURL();
	const authToken = getAuthToken();
	await doPut(`${ACC_API}/_function/${source.function.service}`, source, {
		'Content-Type': 'application/json',
		Authorization: `Basic ${authToken}`,
	});
	return doPut(`${ACC_API}/_function/${destination.function.service}`, destination, {
		'Content-Type': 'application/json',
		Authorization: `Basic ${authToken}`,
	});
};

export const getPrivateRegistry = () => {
	const ACC_API = getURL();
	const authToken = getAuthToken();
	return doGet(`${ACC_API}/_functions/registry_config`, { Authorization: `Basic ${authToken}` });
};

export const updatePrivateRegistry = payload => {
	const ACC_API = getURL();
	const authToken = getAuthToken();
	return doPut(`${ACC_API}/_functions/registry_config`, payload, {
		'Content-Type': 'application/json',
		Authorization: `Basic ${authToken}`,
	});
};

export const getRules = () => {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve([
				{
					id: 'random_id',
					name: 'Rule Name',
					description: 'This is the description for Rule Name',
					enabled: true,
					order: 1,
					createdAt: 1234566,
					updatedAt: 1234566,
					trigger: {
						type: 'filter',
						expression: 'category matches "cool"',
						timeframe: ['start_time', 'end_time'],
					},
					actions: [
						{ type: 'replace_search_term', data: 'string' },
						{
							type: 'promote_result',
							data: [
								{
									doc: {
										id: '1',
									},
									position: 1,
								},

								{
									doc: {
										id: '2',
									},
									position: 2,
								},
							],
						},
						{ type: 'hide_result', data: ['123', '456'] },
						{
							type: 'custom_data',
							data: {
								banner: {
									promote: 'Cool',
								},
							},
						},

						{ type: 'function', data: 'fid' },
					],
				},
			]);
		}, 100);
	});
};

export const updateRule = rule => {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve(rule);
		}, 200);
	});
};

export const deleteRule = rule => {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve(rule);
		}, 100);
	});
};

export const createRule = rule => {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve({ ...rule, id: Date.now().toString(), order: 3 });
		}, 500);
	});
};
