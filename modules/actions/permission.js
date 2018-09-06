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
 * @param {string} appId
 */
export function getPermission(appId) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.PERMISSION.GET));
		return fetchPermission(appId)
			.then(res => dispatch(createAction(AppConstants.APP.PERMISSION.GET_SUCCESS, res)))
			.catch(error => dispatch(createAction(AppConstants.APP.PERMISSION.GET_ERROR, null, error)));
	};
}
/**
 * Creates a new permission
 * @param {string} appId
 * @param {object} payload
 */
export function createPermission(appId, payload) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.PERMISSION.CREATE));
		return newPermission(appId, payload)
			.then(res => dispatch(createAction(AppConstants.APP.PERMISSION.CREATE_SUCCESS, res)))
			.catch(error => dispatch(createAction(AppConstants.APP.PERMISSION.CREATE_ERROR, null, error)));
	};
}

/**
 * Updates a permission
 * @param {string} appId
 * @param {string} username
 * @param {object} payload
 */
export function updatePermission(appId, username, payload) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.PERMISSION.UPDATE));
		return UpdatePermission(appId, username, payload)
			.then(res => dispatch(createAction(AppConstants.APP.PERMISSION.UPDATE_SUCCESS, res)))
			.catch(error => dispatch(createAction(AppConstants.APP.PERMISSION.UPDATE_ERROR, null, error)));
	};
}
/**
 * Deletes a permission
 * @param {string} appId
 * @param {string} username
 */
export function deletePermission(appId, username) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.PERMISSION.DELETE));
		return DeletePermission(appId, username)
			.then(res => dispatch(createAction(AppConstants.APP.PERMISSION.DELETE_SUCCESS, res)))
			.catch(error => dispatch(createAction(AppConstants.APP.PERMISSION.DELETE_ERROR, null, error)));
	};
}
