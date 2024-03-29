import { createAction } from './utils';
import AppConstants from '../constants';
import {
	getSearchSettings,
	getDefaultSearchSettings,
	putSearchSettings,
	deleteSearchSettings,
} from '../../utils/app';

export function getSettings(name) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.SEARCH_SETTINGS.GET));
		return getSearchSettings(name)
			.then((res) =>
				dispatch(
					createAction(AppConstants.APP.SEARCH_SETTINGS.GET_SUCCESS, res, null, {
						appName: name,
					}),
				),
			)
			.catch((error) => {
				if (error && error.code === 404) {
					dispatch(getDefaultSettings());
				}
				dispatch(createAction(AppConstants.APP.SEARCH_SETTINGS.GET_ERROR, null, error));
			});
	};
}

export function getDefaultSettings() {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.SEARCH_SETTINGS.GET_DEFAULT));
		return getDefaultSearchSettings()
			.then((res) =>
				dispatch(
					createAction(AppConstants.APP.SEARCH_SETTINGS.GET_DEFAULT_SUCCESS, res, null),
				),
			)
			.catch((error) =>
				dispatch(
					createAction(AppConstants.APP.SEARCH_SETTINGS.GET_DEFAULT_ERROR, null, error),
				),
			);
	};
}

export function putSettings(name, payload) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.SEARCH_SETTINGS.UPDATE));
		return putSearchSettings(name, payload)
			.then((res) =>
				dispatch(
					createAction(AppConstants.APP.SEARCH_SETTINGS.UPDATE_SUCCESS, res, null, {
						name,
					}),
				),
			)
			.catch((error) =>
				dispatch(createAction(AppConstants.APP.SEARCH_SETTINGS.UPDATE_ERROR, null, error)),
			);
	};
}

export function deleteSettings(name) {
	return (dispatch) => {
		dispatch(
			createAction(AppConstants.APP.SEARCH_SETTINGS.DELETE, null, null, {
				name,
			}),
		);
		return deleteSearchSettings(name)
			.then((res) =>
				dispatch(
					createAction(AppConstants.APP.SEARCH_SETTINGS.DELETE_SUCCESS, res, null, {
						name,
					}),
				),
			)
			.catch((error) =>
				dispatch(
					createAction(AppConstants.APP.SEARCH_SETTINGS.DELETE_ERROR, null, error, {
						name,
					}),
				),
			);
	};
}

export function setLocalRelevancyState(appName, data) {
	return {
		type: AppConstants.APP.SEARCH_SETTINGS.SET_LOCAL_SEARCH_RELEVANCY_STATE,
		appName,
		data,
	};
}

export function setAdvanceSearchState(fieldName, state) {
	return {
		type: AppConstants.APP.SEARCH_SETTINGS.SET_ADVANCE_SEARCH_STATE,
		fieldName,
		state,
	};
}

export function setReIndexingTasks(data) {
	return {
		type: AppConstants.APP.SEARCH_SETTINGS.SET_RE_INDEXING_TASKS,
		data,
	};
}

export function addReIndexingTasks(data) {
	return {
		type: AppConstants.APP.SEARCH_SETTINGS.ADD_RE_INDEXING_TASKS,
		data,
	};
}
