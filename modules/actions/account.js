import { createAction } from './utils';
import AppConstants from '../constants';
import { doGet } from '../../utils/requestService';
import {
	setUserInfo,
	getUserAppsPermissions,
	ACC_API,
	getSecretHeaders,
} from '../../utils/index';

export function updateUser(info) {
	return dispatch => {
		dispatch(createAction(AppConstants.ACCOUNT.UPDATE_USER));
		return setUserInfo(info)
			.then(res => {
				dispatch(
					createAction(AppConstants.ACCOUNT.UPDATE_USER_SUCCESS, res),
				);
			})
			.catch(error => {
				dispatch(
					createAction(
						AppConstants.ACCOUNT.UPDATE_USER_ERROR,
						null,
						error,
					),
				);
			});
	};
}
/**
 * Get user's all apps permissions
 */
export function getUserPermissions(appName, username) {
	return dispatch => {
		dispatch(createAction(AppConstants.APP.PERMISSION.GET));
		return getUserAppsPermissions(appName, username)
			.then(res =>
				dispatch(
					createAction(
						AppConstants.APP.PERMISSION.GET_SUCCESS,
						res,
						null,
						{
							source: 'user_apps',
						},
					),
				),
			)
			.catch(error =>
				dispatch(
					createAction(
						AppConstants.APP.PERMISSION.GET_ERROR,
						null,
						error,
					),
				),
			);
	};
}

export function getUserPlan() {
	return dispatch => {
		dispatch(createAction(AppConstants.ACCOUNT.CHECK_USER_PLAN.GET));
		return doGet(`${ACC_API}/user/plan`, { ...getSecretHeaders() })
			.then(res =>
				dispatch(
					createAction(
						AppConstants.ACCOUNT.CHECK_USER_PLAN.GET_SUCCESS,
						res,
						null,
						{
							source: 'user_apps',
						},
					),
				),
			)
			.catch(error =>
				dispatch(
					createAction(
						AppConstants.ACCOUNT.CHECK_USER_PLAN.GET_ERROR,
						null,
						error,
					),
				),
			);
	};
}
