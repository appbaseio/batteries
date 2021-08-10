import get from 'lodash/get';
import { createAction } from './utils';
import AppConstants from '../constants';
import { getURL } from '../../../constants/config';
import { doGet, doPut, doDelete } from '../../utils/requestService';
import { X_SEARCH_CLIENT } from '../../../constants';

export function getSearchPreferences(name) {
	return (dispatch, getState) => {
		dispatch(createAction(AppConstants.APP.UI_BUILDER.SEARCH_PREFERENCES.GET));
		const ACC_API = getURL();
		const appName = name || get(getState(), '$getCurrentApp.name', 'default');
		return doGet(`${ACC_API}/_uibuilder/${appName}/search`, {
			'x-search-client': X_SEARCH_CLIENT,
		})
			.then((res) =>
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.SEARCH_PREFERENCES.GET_SUCCESS,
						res,
						null,
						{
							appName,
						},
					),
				),
			)
			.catch((error) =>
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.SEARCH_PREFERENCES.GET_ERROR,
						null,
						error,
					),
				),
			);
	};
}

export function saveSearchPreferences(payload, name) {
	return (dispatch, getState) => {
		dispatch(createAction(AppConstants.APP.UI_BUILDER.SEARCH_PREFERENCES.SAVE));
		const ACC_API = getURL();
		const appName = name || get(getState(), '$getCurrentApp.name', 'default');
		return doPut(`${ACC_API}/_uibuilder/${appName}/search`, payload, {
			'x-search-client': X_SEARCH_CLIENT,
		})
			.then((res) => {
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.SEARCH_PREFERENCES.GET_SUCCESS,
						payload,
						null,
						{
							appName,
						},
					),
				);
				// Update preferences
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.SEARCH_PREFERENCES.SAVE_SUCCESS,
						res,
						payload,
						{
							appName,
						},
					),
				);
			})
			.catch((error) =>
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.SEARCH_PREFERENCES.SAVE_ERROR,
						null,
						error,
					),
				),
			);
	};
}

export function deleteSearchPreferences(defaultPreferences, name) {
	return (dispatch, getState) => {
		dispatch(createAction(AppConstants.APP.UI_BUILDER.SEARCH_PREFERENCES.DELETE));
		const ACC_API = getURL();
		const appName = name || get(getState(), '$getCurrentApp.name', 'default');
		return doDelete(`${ACC_API}/_uibuilder/${appName}/search`, {
			'x-search-client': X_SEARCH_CLIENT,
		})
			.then((res) => {
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.SEARCH_PREFERENCES.DELETE_SUCCESS,
						res,
						null,
						{
							appName,
						},
					),
				);
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.SEARCH_PREFERENCES.GET_SUCCESS,
						defaultPreferences,
						null,
						{
							appName,
						},
					),
				);
			})
			.catch((error) =>
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.SEARCH_PREFERENCES.DELETE_ERROR,
						null,
						error,
					),
				),
			);
	};
}

export function getRecommendationsPreferences(name) {
	return (dispatch, getState) => {
		dispatch(createAction(AppConstants.APP.UI_BUILDER.RECOMMENDATION_PREFERENCES.GET));
		const ACC_API = getURL();
		const appName = name || get(getState(), '$getCurrentApp.name', 'default');
		return doGet(`${ACC_API}/_uibuilder/${appName}/recommendations`, {
			'x-search-client': X_SEARCH_CLIENT,
		})
			.then((res) =>
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.RECOMMENDATION_PREFERENCES.GET_SUCCESS,
						res,
						null,
						{
							appName,
						},
					),
				),
			)
			.catch((error) =>
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.RECOMMENDATION_PREFERENCES.GET_ERROR,
						null,
						error,
					),
				),
			);
	};
}

export function saveRecommendationsPreferences(payload, name) {
	return (dispatch, getState) => {
		dispatch(createAction(AppConstants.APP.UI_BUILDER.RECOMMENDATION_PREFERENCES.SAVE));
		const ACC_API = getURL();
		const appName = name || get(getState(), '$getCurrentApp.name', 'default');
		return doPut(`${ACC_API}/_uibuilder/${appName}/recommendations`, payload, {
			'x-search-client': X_SEARCH_CLIENT,
		})
			.then((res) => {
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.RECOMMENDATION_PREFERENCES.SAVE_SUCCESS,
						res,
						null,
						{
							appName,
						},
					),
				);
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.RECOMMENDATION_PREFERENCES.GET_SUCCESS,
						payload,
						null,
						{
							appName,
						},
					),
				);
			})
			.catch((error) =>
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.RECOMMENDATION_PREFERENCES.SAVE_ERROR,
						null,
						error,
					),
				),
			);
	};
}

export function deleteRecommendationsPreferences(defaultPreferences, name) {
	return (dispatch, getState) => {
		dispatch(createAction(AppConstants.APP.UI_BUILDER.RECOMMENDATION_PREFERENCES.DELETE));
		const ACC_API = getURL();
		const appName = name || get(getState(), '$getCurrentApp.name', 'default');
		return doDelete(`${ACC_API}/_uibuilder/${appName}/recommendations`, {
			'x-search-client': X_SEARCH_CLIENT,
		})
			.then((res) => {
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.RECOMMENDATION_PREFERENCES.DELETE_SUCCESS,
						res,
						null,
						{
							appName,
						},
					),
				);
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.RECOMMENDATION_PREFERENCES.GET_SUCCESS,
						defaultPreferences,
						null,
						{
							appName,
						},
					),
				);
			})
			.catch((error) =>
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.RECOMMENDATION_PREFERENCES.DELETE_ERROR,
						null,
						error,
					),
				),
			);
	};
}
