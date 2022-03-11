import get from 'lodash/get';
import { doDelete, doPatch, doGet, doPost, doPut } from './requestService';
import { getApp } from '../components/analytics/utils';
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
		// eslint-disable-next-line
		console.error(e);
	}
	return token;
};

export const getPermission = (appName = '') => {
	const authToken = getAuthToken();
	const ACC_API = getURL();
	let status;
	return doGet(
		`${ACC_API}/${getApp(appName)}_permissions`,
		{
			'Content-Type': 'application/json',
			Authorization: `Basic ${authToken}`,
		},
		undefined,
		undefined,
		undefined,
		true,
	)
		.then((res) => {
			status = get(res, 'res.status');
			if (status === 405) {
				// Re-fetch permission without index for backward compatibility
				return doGet(`${ACC_API}/_permissions`, {
					'Content-Type': 'application/json',
					Authorization: `Basic ${authToken}`,
				});
			}
			if (status >= 500) {
				// eslint-disable-next-line
				return Promise.reject({
					message: 'Something went wrong!',
				});
			}
			if (res && res.res) {
				return res.res
					.json()
					.then((data) => {
						if (status >= 400) {
							if (data.error) {
								return Promise.reject(data.error);
							}
							return Promise.reject(data);
						}
						if (data.body) {
							return Promise.resolve(data.body);
						}
						return Promise.resolve(data);
					})
					.catch((err) => Promise.reject(err));
			}
			// eslint-disable-next-line
			return Promise.reject({
				message: 'Something went wrong!',
			});
		})
		.catch((err) => Promise.reject(err));
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
			.then((res) => res.json())
			.then((data) => resolve(data))
			.catch((error) => reject(error));
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
			.then(async (res) => {
				const data = await res.json();
				if (res.status >= 400) {
					reject(data);
				}
				resolve(data);
			})
			.catch((error) => reject(error));
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
			.then(async (res) => {
				const data = await res.json();

				if (data.error || data.status >= 400) {
					reject(data);
				}
				resolve({
					public_key: key,
					role_key: role,
					...data.body,
					message: data.message,
				});
			})
			.catch((error) => reject(error));
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

export const getSingleFunction = (name) => {
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

export const deleteFunction = (name) => {
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

export const updatePrivateRegistry = (payload) => {
	const ACC_API = getURL();
	const authToken = getAuthToken();
	return doPut(`${ACC_API}/_functions/registry_config`, payload, {
		'Content-Type': 'application/json',
		Authorization: `Basic ${authToken}`,
	});
};

export const getRules = () => {
	const authToken = getAuthToken();
	const ACC_API = getURL();

	return doGet(`${ACC_API}/_rules`, {
		'Content-Type': 'application/json',
		Authorization: `Basic ${authToken}`,
	});
};

export const updateRule = (rule) => {
	const authToken = getAuthToken();
	const ACC_API = getURL();
	const { id, ...payload } = rule;
	return doPut(`${ACC_API}/_rule/${id}`, payload, {
		'Content-Type': 'application/json',
		Authorization: `Basic ${authToken}`,
	});
};

export const deleteRule = (ruleId) => {
	const authToken = getAuthToken();
	const ACC_API = getURL();

	return doDelete(`${ACC_API}/_rule/${ruleId}`, {
		'Content-Type': 'application/json',
		Authorization: `Basic ${authToken}`,
	});
};

export const createRule = (rule) => {
	const authToken = getAuthToken();
	const ACC_API = getURL();

	return doPost(`${ACC_API}/_rule`, rule, {
		'Content-Type': 'application/json',
		Authorization: `Basic ${authToken}`,
	});
};

export const getScriptRule = (srciptId) => {
	const authToken = getAuthToken();
	const ACC_API = getURL();

	return doGet(`${ACC_API}/_rule/${srciptId}/script`, {
		'Content-Type': 'application/json',
		Authorization: `Basic ${authToken}`,
	});
};

export const validateScriptRule = (requestBody) => {
	const authToken = getAuthToken();
	const ACC_API = getURL();

	return doPost(
		`${ACC_API}/_script/validate`,
		requestBody,
		{
			'Content-Type': 'application/json',
			Authorization: `Basic ${authToken}`,
		},
		undefined,
		undefined,
		true,
	);
};

export const getSearchSettings = (name) => {
	const ACC_API = getURL();
	const authToken = getAuthToken();
	return doGet(`${ACC_API}/_searchrelevancy/${name}`, {
		'Content-Type': 'application/json',
		Authorization: `Basic ${authToken}`,
	});
};

export const getDefaultSearchSettings = () => {
	const ACC_API = getURL();
	const authToken = getAuthToken();
	return doGet(`${ACC_API}/_searchrelevancy/_default`, {
		'Content-Type': 'application/json',
		Authorization: `Basic ${authToken}`,
	});
};

export const putSearchSettings = (name, payload) => {
	const ACC_API = getURL();
	const authToken = getAuthToken();
	return doPut(`${ACC_API}/_searchrelevancy/${name}`, payload, {
		'Content-Type': 'application/json',
		Authorization: `Basic ${authToken}`,
	});
};

export const deleteSearchSettings = (name) => {
	const ACC_API = getURL();
	const authToken = getAuthToken();
	return doDelete(`${ACC_API}/_searchrelevancy/${name}`, { Authorization: `Basic ${authToken}` });
};

export const getGradeMetrics = (indices, page) => {
	const ACC_API = getURL();
	return doPost(`${ACC_API}/_grade/metrics`, {
		indices,
		page,
	});
};

export const getPipelines = () => {
	const authToken = getAuthToken();
	const ACC_API = getURL();

	return doGet(`${ACC_API}/_pipelines`, {
		'Content-Type': 'application/json',
		Authorization: `Basic ${authToken}`,
	});
};

export const getPipelinesUsageStats = () => {
	const authToken = getAuthToken();
	const ACC_API = getURL();

	return doGet(`${ACC_API}/_analytics/pipelines/usage`, {
		'Content-Type': 'application/json',
		Authorization: `Basic ${authToken}`,
	});
};

export const updatePipeline = (pipeline) => {
	const authToken = getAuthToken();
	const ACC_API = getURL();
	const { id, ...payload } = pipeline;
	return doPut(`${ACC_API}/_pipeline/${id}`, payload.pipelinePayload, {
		Authorization: `Basic ${authToken}`,
	});
};

export const deletePipeline = (pipelineId) => {
	const authToken = getAuthToken();
	const ACC_API = getURL();

	return doDelete(`${ACC_API}/_pipeline/${pipelineId}`, {
		'Content-Type': 'application/json',
		Authorization: `Basic ${authToken}`,
	});
};

export const createPipeline = (pipeline) => {
	const authToken = getAuthToken();
	const ACC_API = getURL();
	return doPost(`${ACC_API}/_pipeline`, pipeline, {
		Authorization: `Basic ${authToken}`,
	});
};

export const getPipelineScript = (pipelineId, scriptRefKey) => {
	const authToken = getAuthToken();
	const ACC_API = getURL();

	return doGet(
		`${ACC_API}/_pipeline/${pipelineId}/scriptRef/${encodeURIComponent(scriptRefKey)}`,
		{
			'Content-Type': 'application/json',
			Authorization: `Basic ${authToken}`,
		},
	);
};

export const validatePipeline = (formdata) => {
	const authToken = getAuthToken();
	const ACC_API = getURL();
	return doPost(`${ACC_API}/_pipeline/validate`, formdata, {
		Authorization: `Basic ${authToken}`,
	});
};

export const getPipelineSchema = () => {
	const authToken = getAuthToken();
	const ACC_API = getURL();

	return doGet(`${ACC_API}/_pipeline/schema`, {
		'Content-Type': 'application/json',
		Authorization: `Basic ${authToken}`,
	});
};
