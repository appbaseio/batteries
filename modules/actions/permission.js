import get from 'lodash/get';

import { createAction } from './utils';
import AppConstants from '../constants';
import {
	getPermission as fetchPermission,
	updatePermission as UpdatePermission,
	newPermission,
	deletePermission as DeletePermission,
} from '../../utils/app';

/**
 * To fetch app permissions
 * @param {string} name
 */
export function getPermission(name) {
	return (dispatch, getState) => {
		const appName = name || get(getState(), '$getCurrentApp.name', 'default');
		// const username = get(getState(), 'user.data.username', '');
		dispatch(createAction(AppConstants.APP.PERMISSION.GET));
		return fetchPermission(appName)
			.then((res) =>
				dispatch(
					createAction(AppConstants.APP.PERMISSION.GET_SUCCESS, res, null, {
						appName,
					}),
				),
			)
			.catch((error) =>
				dispatch(createAction(AppConstants.APP.PERMISSION.GET_ERROR, null, error)),
			);
	};
}
/**
 * Creates a new permission
 * @param {string} appName
 * @param {object} payload
 */
export function createPermission(appName, payload) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.PERMISSION.CREATE));
		return newPermission(appName, payload)
			.then((res) => dispatch(createAction(AppConstants.APP.PERMISSION.CREATE_SUCCESS, res)))
			.catch((error) =>
				dispatch(createAction(AppConstants.APP.PERMISSION.CREATE_ERROR, null, error)),
			);
	};
}

/**
 * Updates a permission
 * @param {string} appName
 * @param {string} username
 * @param {object} payload
 */
export function updatePermission(appName, username, payload) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.PERMISSION.UPDATE));
		return UpdatePermission(appName, username, payload)
			.then((res) => dispatch(createAction(AppConstants.APP.PERMISSION.UPDATE_SUCCESS, res)))
			.catch((error) =>
				dispatch(createAction(AppConstants.APP.PERMISSION.UPDATE_ERROR, null, error)),
			);
	};
}
/**
 * Deletes a permission
 * @param {string} appName
 * @param {string} username
 */
export function deletePermission(appName, username) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.PERMISSION.DELETE));
		return DeletePermission(appName, username)
			.then((res) => dispatch(createAction(AppConstants.APP.PERMISSION.DELETE_SUCCESS, res)))
			.catch((error) =>
				dispatch(createAction(AppConstants.APP.PERMISSION.DELETE_ERROR, null, error)),
			);
	};
}
