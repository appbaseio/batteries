import get from 'lodash/get';
import { createAction } from './utils';
import AppConstants from '../constants';
import {
	deleteApp as DeleteApp,
	getShare,
	getAppPlan as fetchAppPlan,
	createShare,
	createSubscription,
	deleteSubscription,
	// getAppMetrics as GetAppMetrics,
	transferOwnership,
	updatePaymentMethod,
} from '../../utils/app';
import { getMappings, getAuthHeaders } from '../../utils/mappings';
import { doDelete, doGet, doPost, doPatch } from '../../utils/requestService';
import { getURL } from '../../../constants/config';
import apisMapper from '../../../pages/IntegrationsPage/utils/apisMapper';
import { BACKENDS } from '../../utils';

/**
 * @param {string} appId
 */
export function transferAppOwnership(id, info) {
	return (dispatch, getState) => {
		const appId = id || get(getState(), '$getCurrentApp.id');
		dispatch(createAction(AppConstants.APP.TRANSFER_OWNERSHIP));
		return transferOwnership(appId, info)
			.then((res) => dispatch(createAction(AppConstants.APP.TRANSFER_OWNERSHIP_SUCCESS, res)))
			.catch((error) =>
				dispatch(createAction(AppConstants.APP.TRANSFER_OWNERSHIP_ERROR, null, error)),
			);
	};
}

export function clearMappings(appName) {
	return {
		type: AppConstants.APP.CLEAR_MAPPINGS,
		meta: { appName },
	};
}

export function getAppMappings(appName, credentials, url) {
	return (dispatch, getState) => {
		dispatch(createAction(AppConstants.APP.GET_MAPPINGS));
		const backend =
			get(getState(), '$getAppPlan.results.backend') ?? BACKENDS.ELASTICSEARCH.name;
		const schemaEndpointUrl =
			get(getState(), 'endpoints.data.schema.url') ?? apisMapper[backend].schema.url;
		// eslint-disable-next-line no-template-curly-in-string
		const endpointSuffix = schemaEndpointUrl.replace('${index}', appName || '*');
		const forwardSlashEscapedSuffix = endpointSuffix && endpointSuffix.substr(1);
		return getMappings(appName, credentials, url, forwardSlashEscapedSuffix)
			.then((res) =>
				dispatch(
					createAction(AppConstants.APP.GET_MAPPINGS_SUCCESS, res, null, {
						appName: appName || 'default',
						credentials,
					}),
				),
			)
			.catch((error) =>
				dispatch(createAction(AppConstants.APP.GET_MAPPINGS_ERROR, null, error)),
			);
	};
}

export function deleteApp(appName) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.DELETE_APP));
		return DeleteApp(appName)
			.then((res) => dispatch(createAction(AppConstants.APP.DELETE_APP_SUCCESS, res)))
			.catch((error) =>
				dispatch(createAction(AppConstants.APP.DELETE_APP_ERROR, null, error)),
			);
	};
}

export function getSharedApp(appId) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.GET_SHARE));
		return getShare(appId)
			.then((res) => dispatch(createAction(AppConstants.APP.GET_SHARE_SUCCESS, res)))
			.catch((error) =>
				dispatch(createAction(AppConstants.APP.GET_SHARE_ERROR, null, error)),
			);
	};
}

export function createAppShare(appId, payload) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.CREATE_SHARE));
		return createShare(appId, payload)
			.then((res) => dispatch(createAction(AppConstants.APP.CREATE_SHARE_SUCCESS, res)))
			.catch((error) =>
				dispatch(createAction(AppConstants.APP.CREATE_SHARE_ERROR, null, error)),
			);
	};
}

export function deleteAppShare(username, payload, appId) {
	return (dispatch, getState) => {
		const appIdCalc = appId || get(getState(), '$getCurrentApp.id');
		dispatch(createAction(AppConstants.APP.DELETE_SHARE));
		const ACC_API = getURL();
		return doDelete(`${ACC_API}/app/${appIdCalc}/share/${username}`, payload)
			.then((res) => dispatch(createAction(AppConstants.APP.DELETE_SHARE_SUCCESS, res)))
			.catch((error) =>
				dispatch(createAction(AppConstants.APP.DELETE_SHARE_ERROR, null, error)),
			);
	};
}

export function getAppPlan() {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.GET_PLAN));
		return fetchAppPlan()
			.then((res) => {
				dispatch(createAction(AppConstants.APP.GET_PLAN_SUCCESS, res, null));
			})
			.catch((error) => dispatch(createAction(AppConstants.APP.GET_PLAN_ERROR, null, error)));
	};
}

export function getClusterUsers(credentials) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.USERS.GET));
		const ACC_API = getURL();
		return doGet(`${ACC_API}/_users`, getAuthHeaders(credentials))
			.then((res) => dispatch(createAction(AppConstants.APP.USERS.GET_SUCCESS, res)))
			.catch((error) =>
				dispatch(createAction(AppConstants.APP.USERS.GET_ERROR, null, error)),
			);
	};
}

export function createClusterUser(credentials, payload) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.USERS.CREATE_USER));
		const ACC_API = getURL();
		return doPost(`${ACC_API}/_user`, payload, getAuthHeaders(credentials))
			.then((res) => dispatch(createAction(AppConstants.APP.USERS.CREATE_USER_SUCCESS, res)))
			.catch((error) =>
				dispatch(createAction(AppConstants.APP.USERS.CREATE_USER_SUCCESS, null, error)),
			);
	};
}

export function updateClusterUser(credentials, username, payload) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.USERS.EDIT_USER));
		const ACC_API = getURL();
		return doPatch(`${ACC_API}/_user/${username}`, payload, getAuthHeaders(credentials))
			.then((res) => dispatch(createAction(AppConstants.APP.USERS.EDIT_USER_SUCCESS, res)))
			.catch((error) =>
				dispatch(createAction(AppConstants.APP.USERS.EDIT_USER_ERROR, null, error)),
			);
	};
}

export function deleteClusterUser(credentials, username) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.USERS.DELETE_USER));
		const ACC_API = getURL();
		return doDelete(`${ACC_API}/_user/${username}`, getAuthHeaders(credentials))
			.then((res) => dispatch(createAction(AppConstants.APP.USERS.DELETE_USER_SUCCESS, res)))
			.catch((error) =>
				dispatch(createAction(AppConstants.APP.USERS.DELETE_USER_ERROR, null, error)),
			);
	};
}
/**
 * To get the metrics of an app
 * @param {*} id // App id ( optional )
 * @param {*} name // App name ( optional )
 */
// export function getAppMetrics(id, name) {
// 	return (dispatch, getState) => {
// 		const appId = id || get(getState(), '$getCurrentApp.id', 'default');
// 		const appName = name || get(getState(), '$getCurrentApp.name', 'default');
// 		dispatch(createAction(AppConstants.APP.GET_METRICS));
// return GetAppMetrics(appId)
// 			.then(res => dispatch(
// 					createAction(AppConstants.APP.GET_METRICS_SUCCESS, res, null, { appName }),
// 				))
// 			.catch((error) => {
// 				dispatch(createAction(AppConstants.APP.GET_METRICS_ERROR, null, error));
// 			});
// 	};
// }

export function createAppSubscription(stripeToken, plan, test) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.CREATE_SUBSCRIPTION));
		return createSubscription(stripeToken, plan, test)
			.then((res) =>
				dispatch(createAction(AppConstants.APP.CREATE_SUBSCRIPTION_SUCCESS, res)),
			)
			.catch((error) => {
				dispatch(createAction(AppConstants.APP.CREATE_SUBSCRIPTION_ERROR, null, error));
			});
	};
}

export function deleteAppSubscription(payload) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.DELETE_SUBSCRIPTION));
		return deleteSubscription(payload)
			.then((res) =>
				dispatch(createAction(AppConstants.APP.DELETE_SUBSCRIPTION_SUCCESS, res)),
			)
			.catch((error) => {
				dispatch(createAction(AppConstants.APP.DELETE_SUBSCRIPTION_ERROR, null, error));
			});
	};
}

export function setCurrentApp(appName, appId) {
	return createAction(AppConstants.APP.SET_CURRENT_APP, {
		id: appId,
		name: appName,
	});
}

export function setSearchState(searchState) {
	try {
		return createAction(AppConstants.APP.SET_SEARCH_STATE, {
			searchState: JSON.parse(searchState),
		});
	} catch (e) {
		return createAction(AppConstants.APP.SET_SEARCH_STATE, {
			searchState,
		});
	}
}

export function clearSearchState() {
	return createAction(AppConstants.APP.CLEAR_SEARCH_STATE);
}

export function clearCurrentApp() {
	return createAction(AppConstants.APP.CLEAR_CURRENT_APP);
}

export function updateAppPaymentMethod(stripeToken, product) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.ACCOUNT.PAYMENT.UPDATE));
		return updatePaymentMethod(stripeToken, product)
			.then((res) => dispatch(createAction(AppConstants.ACCOUNT.PAYMENT.UPDATE_SUCCESS, res)))
			.catch((error) => {
				dispatch(createAction(AppConstants.ACCOUNT.PAYMENT.UPDATE_ERROR, null, error));
			});
	};
}

export function toggleInsightsSidebar() {
	return createAction(AppConstants.APP.INSIGHTS_SIDEBAR);
}

export function setLocalMappingState(appName, data) {
	return {
		type: AppConstants.APP.SEARCH_SETTINGS.SET_LOCAL_MAPPING_STATE,
		appName,
		data,
	};
}
