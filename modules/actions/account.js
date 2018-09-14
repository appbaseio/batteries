import { createAction } from './utils';
import AppConstants from '../constants';
import { checkUserStatus, setUserInfo } from '../../utils/index';

/**
 * Get the user current plan
 */
export function getUserStatus() {
	return (dispatch) => {
		dispatch(createAction(AppConstants.ACCOUNT.CHECK_USER_PLAN.GET));
		return checkUserStatus()
			.then((res) => {
				dispatch(createAction(AppConstants.ACCOUNT.CHECK_USER_PLAN.GET_SUCCESS, res));
			})
			.catch((error) => {
				dispatch(createAction(AppConstants.ACCOUNT.CHECK_USER_PLAN.GET_ERROR, null, error));
			});
	};
}

export function updateUser(info) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.ACCOUNT.UPDATE_USER));
		return setUserInfo(info)
			.then((res) => {
				dispatch(createAction(AppConstants.ACCOUNT.UPDATE_USER_SUCCESS, res));
			})
			.catch((error) => {
				dispatch(createAction(AppConstants.ACCOUNT.UPDATE_USER_ERROR, null, error));
			});
	};
}
