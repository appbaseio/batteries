import { createAction } from './utils';
import AppConstants from '../constants';
import { checkUserStatus } from '../../utils/index';

/**
 * Get the user current plan
 */
// eslint-disable-next-line
export function getUserStatus() {
	return (dispatch) => {
		dispatch(createAction(AppConstants.ACCOUNT.CHECK_USER_PLAN.GET));
		return checkUserStatus()
			.then(res => dispatch(createAction(AppConstants.ACCOUNT.CHECK_USER_PLAN.GET_SUCCESS, res)))
			.catch(error => dispatch(createAction(AppConstants.ACCOUNT.CHECK_USER_PLAN.GET_ERROR, null, error)));
	};
}
