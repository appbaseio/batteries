import get from 'lodash/get';
import { createAction } from './utils';
import AppConstants from '../constants';
import {
	getAppInfo as fetchAppInfo,
	deleteApp as DeleteApp,
	getShare,
	getAppPlan as fetchAppPlan,
	createShare,
	createSubscription,
	deleteSubscription,
	getAppMetrics as GetAppMetrics,
	transferOwnership,
} from '../../utils/app';
import { getMappings } from '../../utils/mappings';
import { doDelete } from '../../utils/requestService';
import { ACC_API } from '../../utils/index';

/**
 * @param {string} appId
 */
export function transferAppOwnership(id, info) {
	return (dispatch, getState) => {
		const appId = id || get(getState(), '$getCurrentApp.id');
		dispatch(createAction(AppConstants.APP.TRANSFER_OWNERSHIP));
		return transferOwnership(appId, info)
			.then(res => dispatch(createAction(AppConstants.APP.TRANSFER_OWNERSHIP_SUCCESS, res)))
			.catch(error => dispatch(createAction(AppConstants.APP.TRANSFER_OWNERSHIP_ERROR, null, error)));
	};
}
/**
 * To fetch app details
 * @param {string} appId
 */
export function getAppInfo(appId, name) {
	return (dispatch, getState) => {
		const appName = name || get(getState(), '$getCurrentApp.name', 'default');
		dispatch(createAction(AppConstants.APP.GET_INFO));
		return fetchAppInfo(appId)
			.then(res => dispatch(
					createAction(AppConstants.APP.GET_INFO_SUCCESS, res, null, {
						appName,
					}),
				))
			.catch(error => dispatch(createAction(AppConstants.APP.GET_INFO_ERROR, null, error)));
	};
}

export function clearMappings(appName) {
	return {
		type: AppConstants.APP.CLEAR_MAPPINGS,
		meta: { appName },
	};
}

export function getAppMappings(appName, credentials, url) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.GET_MAPPINGS));
		return getMappings(appName, credentials, url)
			.then(res => dispatch(
					createAction(AppConstants.APP.GET_MAPPINGS_SUCCESS, res, null, { appName }),
				))
			.catch(error => dispatch(createAction(AppConstants.APP.GET_MAPPINGS_ERROR, null, error)));
	};
}

export function deleteApp(appName) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.DELETE_APP));
		return DeleteApp(appName)
			.then(res => dispatch(createAction(AppConstants.APP.DELETE_APP_SUCCESS, res)))
			.catch(error => dispatch(createAction(AppConstants.APP.DELETE_APP_ERROR, null, error)));
	};
}

export function getSharedApp(appId) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.GET_SHARE));
		return getShare(appId)
			.then(res => dispatch(createAction(AppConstants.APP.GET_SHARE_SUCCESS, res)))
			.catch(error => dispatch(createAction(AppConstants.APP.GET_SHARE_ERROR, null, error)));
	};
}

export function createAppShare(appId, payload) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.CREATE_SHARE));
		return createShare(appId, payload)
			.then(res => dispatch(createAction(AppConstants.APP.CREATE_SHARE_SUCCESS, res)))
			.catch(error => dispatch(createAction(AppConstants.APP.CREATE_SHARE_ERROR, null, error)));
	};
}

export function deleteAppShare(username, payload, appId) {
	return (dispatch, getState) => {
		const appIdCalc = appId || get(getState(), '$getCurrentApp.id');
		dispatch(createAction(AppConstants.APP.DELETE_SHARE));
		return doDelete(`${ACC_API}/app/${appIdCalc}/share/${username}`, payload)
			.then(res => dispatch(createAction(AppConstants.APP.DELETE_SHARE_SUCCESS, res)))
			.catch(error => dispatch(createAction(AppConstants.APP.DELETE_SHARE_ERROR, null, error)));
	};
}

export function getAppPlan(name) {
	return (dispatch, getState) => {
		const appName = name || get(getState(), '$getCurrentApp.name', 'default');
		dispatch(createAction(AppConstants.APP.GET_PLAN));
		return fetchAppPlan(appName)
			.then(res => dispatch(createAction(AppConstants.APP.GET_PLAN_SUCCESS, res, null, { appName })))
			.catch(error => dispatch(createAction(AppConstants.APP.GET_PLAN_ERROR, null, error)));
	};
}
/**
 * To get the metrics of an app
 * @param {*} id // App id ( optional )
 * @param {*} name // App name ( optional )
 */
export function getAppMetrics(id, name) {
	return (dispatch, getState) => {
		const appId = id || get(getState(), '$getCurrentApp.id', 'default');
		const appName = name || get(getState(), '$getCurrentApp.name', 'default');
		dispatch(createAction(AppConstants.APP.GET_METRICS));
		return GetAppMetrics(appId)
			.then(res => dispatch(
					createAction(AppConstants.APP.GET_METRICS_SUCCESS, res, null, { appName }),
				))
			.catch((error) => {
				dispatch(createAction(AppConstants.APP.GET_METRICS_ERROR, null, error));
			});
	};
}

export function createAppSubscription(stripeToken, plan, name) {
	return (dispatch, getState) => {
		const appName = name || get(getState(), '$getCurrentApp.name');
		dispatch(createAction(AppConstants.APP.CREATE_SUBSCRIPTION));
		return createSubscription(stripeToken, plan, appName)
			.then(res => dispatch(createAction(AppConstants.APP.CREATE_SUBSCRIPTION_SUCCESS, res)))
			.catch((error) => {
				dispatch(createAction(AppConstants.APP.CREATE_SUBSCRIPTION_ERROR, null, error));
			});
	};
}

export function deleteAppSubscription(name) {
	return (dispatch, getState) => {
		const appName = name || get(getState(), '$getCurrentApp.name');
		dispatch(createAction(AppConstants.APP.DELETE_SUBSCRIPTION));
		return deleteSubscription(appName)
			.then(res => dispatch(createAction(AppConstants.APP.DELETE_SUBSCRIPTION_SUCCESS, res)))
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
