import { createAction } from './utils';
import AppConstants from '../constants';
import {
	getPrivateRegistry as getPrivateRegistries,
	updatePrivateRegistry as setPrivateRegistry,
} from '../../utils/app';

export function getPrivateRegistry(name = 'default') {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.PRIVATE_REGISTRY.GET));
		return getPrivateRegistries()
			.then((res) => {
				dispatch(
					createAction(AppConstants.APP.PRIVATE_REGISTRY.GET_SUCCESS, res, null, {
						name,
					}),
				);
			})
			.catch(error => dispatch(createAction(AppConstants.APP.PRIVATE_REGISTRY.GET_ERROR, null, error)));
	};
}

export function updatePrivateRegistry(payload = {}) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.PRIVATE_REGISTRY.UPDATE));
		return setPrivateRegistry(payload)
			.then(() => {
				dispatch(
					createAction(AppConstants.APP.PRIVATE_REGISTRY.UPDATE_SUCCESS, payload, null),
				);
			})
			.catch(error => dispatch(createAction(AppConstants.APP.PRIVATE_REGISTRY.UPDATE_ERROR, null, error)));
	};
}
