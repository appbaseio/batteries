import { createAction } from './utils';
import AppConstants from '../constants';
import { getURL } from '../../../constants/config';
import { doGet, doPost } from '../../utils/requestService';

export function getCachePreferences() {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.CACHE.GET_PREFERENCES));
		const ACC_API = getURL();
		return doGet(`${ACC_API}/_cache/preferences`)
			.then((res) =>
				dispatch(createAction(AppConstants.APP.CACHE.GET_PREFERENCES_SUCCESS, res, null)),
			)
			.catch((error) =>
				dispatch(createAction(AppConstants.APP.CACHE.GET_PREFERENCES_ERROR, null, error)),
			);
	};
}

export function saveCachePreferences(payload) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.CACHE.SAVE_PREFERENCES));
		const ACC_API = getURL();
		return doPost(`${ACC_API}/_cache/preferences`, payload)
			.then((res) =>
				dispatch(createAction(AppConstants.APP.CACHE.SAVE_PREFERENCES_SUCCESS, res)),
			)
			.catch((error) =>
				dispatch(createAction(AppConstants.APP.CACHE.SAVE_PREFERENCES_ERROR, null, error)),
			);
	};
}

export function evictCache() {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.CACHE.EVICT));
		const ACC_API = getURL();
		return doPost(`${ACC_API}/_cache/evict`)
			.then((res) => dispatch(createAction(AppConstants.APP.CACHE.EVICT_SUCCESS, res)))
			.catch((error) =>
				dispatch(createAction(AppConstants.APP.CACHE.EVICT_ERROR, null, error)),
			);
	};
}
