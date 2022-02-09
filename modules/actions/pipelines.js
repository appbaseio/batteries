import { createAction } from './utils';
import AppConstants from '../constants';
import { getPipelines as fetchPipelines } from '../../utils/app';

export function getPipelines() {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.PIPELINES.GET));
		return fetchPipelines()
			.then((res) => {
				dispatch(createAction(AppConstants.APP.PIPELINES.GET_SUCCESS, res, null));
			})
			.catch((error) => {
				dispatch(createAction(AppConstants.APP.PIPELINES.GET_ERROR, null, error));
			});
	};
}
