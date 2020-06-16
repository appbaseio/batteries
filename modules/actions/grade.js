import { getGradeMetrics } from '../../utils/app';
import { createAction } from './utils';
import AppConstants from '../constants';

// eslint-disable-next-line import/prefer-default-export
export function getAppGradeMetrics() {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.GRADE.GET));
		return getGradeMetrics()
			.then((res) => {
				dispatch(createAction(AppConstants.APP.GRADE.GET_SUCCESS, res));
			})
			.catch((error) =>
				dispatch(createAction(AppConstants.APP.GRADE.GET_ERROR, null, error)),
			);
	};
}
