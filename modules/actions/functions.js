import { createAction } from './utils';
import AppConstants from '../constants';
import { getFunctions as fetchFunctions, updateFunctions as putFunctions } from '../../utils/app';

export function getFunctions(name = 'default') {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.FUNCTIONS.GET));
		return fetchFunctions()
			.then((res) => {
				dispatch(
					createAction(AppConstants.APP.FUNCTIONS.GET_SUCCESS, res, null, {
						name,
					}),
				);
			})
			.catch(error => dispatch(createAction(AppConstants.APP.FUNCTIONS.GET_ERROR, null, error)));
	};
}


export function updateFunctions(name = 'default', payload, isTrigger) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.FUNCTIONS.UPDATE, { name, isTrigger }));
		return putFunctions(name, payload)
			.then((res) => {
				dispatch(
					createAction(AppConstants.APP.FUNCTIONS.UPDATE_SUCCESS, {
						[name]: {
							...res,
						},
					}, null, {
						name,
					}),
				);
			})
			.catch(error => dispatch(createAction(AppConstants.APP.FUNCTIONS.UPDATE_ERROR, null, error)));
	};
}
