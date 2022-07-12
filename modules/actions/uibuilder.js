import get from 'lodash/get';
import { createAction } from './utils';
import AppConstants from '../constants';
import { getURL } from '../../../constants/config';
import { doGet, doPut, doDelete, doPost, doPatch } from '../../utils/requestService';

export function getSearchPreferences(name) {
	return (dispatch, getState) => {
		dispatch(createAction(AppConstants.APP.UI_BUILDER.SEARCH_PREFERENCES.GET));
		const ACC_API = getURL();
		const appName = name || get(getState(), '$getCurrentApp.name', 'default');
		return doGet(`${ACC_API}/_uibuilder/${appName}/search`)
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
		return doPut(`${ACC_API}/_uibuilder/${appName}/search`, payload)
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
		return doDelete(`${ACC_API}/_uibuilder/${appName}/search`)
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
		return doGet(`${ACC_API}/_uibuilder/${appName}/recommendations`)
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
		return doPut(`${ACC_API}/_uibuilder/${appName}/recommendations`, payload)
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
		return doDelete(`${ACC_API}/_uibuilder/${appName}/recommendations`)
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

export function fetchAuth0Preferences() {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.UI_BUILDERN.AUTH0.GET_AUTH0_PREFERENCES));
		const ACC_API = getURL();

		return doGet(`${ACC_API}/_uibuilder/auth_preferences`)
			.then((res) => {
				if (res._client_id) dispatch(fetchAuth0Client(res._client_id));
				return dispatch(
					createAction(
						AppConstants.APP.UI_BUILDERN.AUTH0.GET_AUTH0_PREFERENCES_SUCCESS,
						res,
					),
				);
			})
			.catch((error) =>
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDERN.AUTH0.GET_AUTH0_PREFERENCES_ERROR,
						null,
						error,
					),
				),
			);
	};
}

export function putAuth0Preferences(payload) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.UI_BUILDERN.AUTH0.SET_AUTH0_PREFERENCES));
		const ACC_API = getURL();

		return doPut(`${ACC_API}/_uibuilder/auth_preferences`, payload)
			.then((res) => {
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDERN.AUTH0.SET_AUTH0_PREFERENCES_SUCCESS,
						res,
					),
				);
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDERN.AUTH0.GET_AUTH0_PREFERENCES_SUCCESS,
						payload,
					),
				);
			})
			.catch((error) =>
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDERN.AUTH0.SET_AUTH0_PREFERENCES_ERROR,
						null,
						error,
					),
				),
			);
	};
}

export function postAuth0Client(payload) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.UI_BUILDERN.AUTH0.CREATE_AUTH0_CLIENT));
		const ACC_API = getURL();
		return doPost(`${ACC_API}/_uibuilder/authentication`, payload)
			.then((res) => {
				dispatch(
					createAction(AppConstants.APP.UI_BUILDERN.AUTH0.GET_AUTH0_CLIENT_SUCCESS, res),
				);
				return dispatch(
					createAction(
						AppConstants.APP.UI_BUILDERN.AUTH0.CREATE_AUTH0_CLIENT_SUCCESS,
						res,
					),
				);
			})
			.catch((error) =>
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDERN.AUTH0.CREATE_AUTH0_CLIENT_ERROR,
						null,
						error,
					),
				),
			);
	};
}

export function fetchAuth0Client(clientId) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.UI_BUILDERN.AUTH0.GET_AUTH0_CLIENT));
		const ACC_API = getURL();

		return doGet(`${ACC_API}/_uibuilder/authentication/${clientId}`)
			.then((res) => {
				dispatch(
					createAction(AppConstants.APP.UI_BUILDERN.AUTH0.GET_AUTH0_CLIENT_SUCCESS, res),
				);
			})
			.catch((error) =>
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDERN.AUTH0.GET_AUTH0_CLIENT_ERROR,
						null,
						error,
					),
				),
			);
	};
}

export function patchAuth0Client(clientId, payload) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.UI_BUILDERN.AUTH0.UPDATE_AUTH0_CLIENT));
		const ACC_API = getURL();
		return doPatch(`${ACC_API}/_uibuilder/authentication/${clientId}`, payload)
			.then((res) => {
				dispatch(
					createAction(AppConstants.APP.UI_BUILDERN.AUTH0.GET_AUTH0_CLIENT_SUCCESS, res),
				);
				return dispatch(
					createAction(
						AppConstants.APP.UI_BUILDERN.AUTH0.UPDATE_AUTH0_CLIENT_SUCCESS,
						res,
					),
				);
			})
			.catch((error) =>
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDERN.AUTH0.UPDATE_AUTH0_CLIENT_ERROR,
						null,
						error,
					),
				),
			);
	};
}

export function getAuth0ClientConnections(clientId) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.UI_BUILDERN.AUTH0.GET_AUTH0_CLIENT_CONNECTIONS));
		const ACC_API = getURL();
		return doGet(`${ACC_API}/_uibuilder/auth_connection_state/${clientId}`)
			.then((res) => {
				return dispatch(
					createAction(
						AppConstants.APP.UI_BUILDERN.AUTH0.GET_AUTH0_CLIENT_CONNECTIONS_SUCCESS,
						res,
					),
				);
			})
			.catch((error) =>
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDERN.AUTH0.GET_AUTH0_CLIENT_CONNECTIONS_ERROR,
						null,
						error,
					),
				),
			);
	};
}

export function putAuth0ClientConnections(clientId, payload) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.UI_BUILDERN.AUTH0.SAVE_AUTH0_CLIENT_CONNECTIONS));
		const ACC_API = getURL();
		return doPut(`${ACC_API}/_uibuilder/auth_connection_state/${clientId}`, payload)
			.then((res) => {
				return dispatch(
					createAction(
						AppConstants.APP.UI_BUILDERN.AUTH0.SAVE_AUTH0_CLIENT_CONNECTIONS_SUCCESS,
						res,
					),
				);
			})
			.catch((error) =>
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDERN.AUTH0.SAVE_AUTH0_CLIENT_CONNECTIONS_ERROR,
						null,
						error,
					),
				),
			);
	};
}
