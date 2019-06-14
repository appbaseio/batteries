import get from 'lodash/get';

import { createAction } from './utils';
import AppConstants from '../constants';
import { getPublicKey as fetchPublicKey, setPublicKey } from '../../utils/app';

/**
 * To fetch app public key
 * @param {string} name
 */
export function getPublicKey(name) {
	return (dispatch, getState) => {
		const appName = name || get(getState(), '$getCurrentApp.name', 'default');
		dispatch(createAction(AppConstants.APP.PUBLIC_KEY.GET));
		return fetchPublicKey(appName)
			.then(res => dispatch(
					createAction(AppConstants.APP.PUBLIC_KEY.GET_SUCCESS, res, null, {
						appName,
					}),
				))
			.catch(error => dispatch(createAction(AppConstants.APP.PUBLIC_KEY.GET_ERROR, null, error)));
	};
}

/**
 * To update app public key
 * @param {string} name
 */
export function updatePublicKey(name, key, role) {
	return (dispatch, getState) => {
		const appName = name || get(getState(), '$getCurrentApp.name', 'default');
		dispatch(createAction(AppConstants.APP.PUBLIC_KEY.UPDATE));
		return setPublicKey(appName, key, role)
			.then(res => dispatch(
					createAction(AppConstants.APP.PUBLIC_KEY.UPDATE_SUCCESS, res, null, {
						appName,
					}),
				))
			.catch(error => dispatch(createAction(AppConstants.APP.PUBLIC_KEY.UPDATE_ERROR, null, error)));
	};
}
