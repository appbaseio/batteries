import { createAction } from './utils';
import AppConstants from '../constants';
import { getSearchSettings, getDefaultSearchSettings, putSearchSettings } from '../../utils/app';

// eslint-disable-next-line import/prefer-default-export
export function getSettings(name) {
	return dispatch => {
		dispatch(createAction(AppConstants.APP.SEARCH_SETTINGS.GET));
		return getSearchSettings(name)
			.then(res =>
				dispatch(
					createAction(AppConstants.APP.SEARCH_SETTINGS.GET_SUCCESS, res, null, {
						appName: name,
					}),
				),
			)
			.catch(error =>
				dispatch(createAction(AppConstants.APP.SEARCH_SETTINGS.GET_ERROR, null, error)),
			);
	};
}

export function getDefaultSettings() {
	return dispatch => {
		dispatch(createAction(AppConstants.APP.SEARCH_SETTINGS.GET_DEFAULT));
		return getDefaultSearchSettings()
			.then(res =>
				dispatch(
					createAction(AppConstants.APP.SEARCH_SETTINGS.GET_DEFAULT_SUCCESS, res, null),
				),
			)
			.catch(error =>
				dispatch(
					createAction(AppConstants.APP.SEARCH_SETTINGS.GET_DEFAULT_ERROR, null, error),
				),
			);
	};
}

export function putSettings(name, payload) {
	return dispatch => {
		dispatch(createAction(AppConstants.APP.SEARCH_SETTINGS.UPDATE));
		return putSearchSettings(name, payload)
			.then(res =>
				dispatch(
					createAction(AppConstants.APP.SEARCH_SETTINGS.UPDATE_SUCCESS, res, null, {
						name,
					}),
				),
			)
			.catch(error =>
				dispatch(createAction(AppConstants.APP.SEARCH_SETTINGS.UPDATE_ERROR, null, error)),
			);
	};
}
