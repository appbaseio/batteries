import { createAction } from './utils';
import AppConstants from '../constants';
import { getDataUsage as fetchDataUsage } from '../../utils/app';

export function getDataUsage() {
	return (dispatch) => {
		dispatch(createAction(AppConstants.BILLING.GET_DATA_USAGE));
		return fetchDataUsage()
			.then((res) => {
				return dispatch(
					createAction(AppConstants.BILLING.GET_DATA_USAGE_SUCCESS, res, null),
				);
			})
			.catch((error) => {
				console.log(error);
				dispatch(createAction(AppConstants.BILLING.GET_DATA_USAGE_ERROR, null, error));
			});
	};
}
