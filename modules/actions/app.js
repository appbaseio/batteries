import get from 'lodash/get';
import { createAction } from './utils';
import AppConstants from '../constants';
import { getAppInfo as fetchAppInfo, deleteApp as DeleteApp } from '../../utils/app';
import { getMappings } from '../../utils/mappings';
import { getCredentials } from '../../utils';

/**
 * To fetch app details
 * @param {string} appId
 */
export function getAppInfo(appId, appName) {
	return (dispatch, getState) => {
		const appname = appName || get(getState(), '$getCurrentApp.name', 'default');
		dispatch(createAction(AppConstants.APP.GET_INFO));
		return fetchAppInfo(appId)
			.then(res => dispatch(createAction(AppConstants.APP.GET_INFO_SUCCESS, res, null, { appName: appname })))
			.catch(error => dispatch(createAction(AppConstants.APP.GET_INFO_ERROR, null, error)));
	};
}

export function getAppMappings(appName, credentials, url) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.GET_MAPPINGS));
		return getMappings(appName, credentials, url)
			.then(res => dispatch(createAction(AppConstants.APP.GET_MAPPINGS_SUCCESS, res, null, { appName })))
			.catch(error => dispatch(createAction(AppConstants.APP.GET_MAPPINGS_ERROR, null, error)));
	};
}

export function getAppCredentials(appId) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.GET_CREDENTIALS));
		return getCredentials(appId)
			.then(res => dispatch(createAction(AppConstants.APP.GET_CREDENTIALS_SUCCESS, res)))
			.catch(error => dispatch(createAction(AppConstants.APP.GET_CREDENTIALS_ERROR, null, error)));
	};
}

export function deleteApp(appId) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.DELETE_APP));
		return DeleteApp(appId)
			.then(res => dispatch(createAction(AppConstants.APP.DELETE_APP_SUCCESS, res)))
			.catch(error => dispatch(createAction(AppConstants.APP.DELETE_APP_ERROR, null, error)));
	};
}

export function setCurrentApp(appName, appId) {
	return createAction(AppConstants.APP.SET_CURRENT_APP, {
		id: appId,
		name: appName,
	});
}

export function clearCurrentApp() {
	return createAction(AppConstants.APP.CLEAR_CURRENT_APP);
}
