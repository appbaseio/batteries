import { v4 as uuidv4 } from 'uuid';
import { createAction } from './utils';
import AppConstants from '../constants';
import { getURL } from '../../../constants/config';
import { doGet, doPut, doDelete, doPost, doPatch } from '../../utils/requestService';

// New methods
export function getSearchPreferences() {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.UI_BUILDER.SEARCH_PREFERENCES.GET));
		const ACC_API = getURL();
		return doGet(`${ACC_API}/_uibuilder/search`)
			.then((res) =>
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.SEARCH_PREFERENCES.GET_SUCCESS,
						res,
						null,
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

export function getRecommendationsPreferences() {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.UI_BUILDER.RECOMMENDATION_PREFERENCES.GET));
		const ACC_API = getURL();
		return doGet(`${ACC_API}/_uibuilder/recommendation`)
			.then((res) =>
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.RECOMMENDATION_PREFERENCES.GET_SUCCESS,
						res,
						null,
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

export function getSearchPreference(id) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.UI_BUILDER.SEARCH_PREFERENCES.GET));
		const ACC_API = getURL();
		return doGet(`${ACC_API}/_uibuilder/${id}/search`)
			.then((res) =>
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.SEARCH_PREFERENCES.GET_SUCCESS,
						res,
						null,
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

export function getRecommendationPreference(id) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.UI_BUILDER.RECOMMENDATION_PREFERENCES.GET));
		const ACC_API = getURL();
		return doGet(`${ACC_API}/_uibuilder/${id}/recommendation`)
			.then((res) =>
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.RECOMMENDATION_PREFERENCES.GET_SUCCESS,
						res,
						null,
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

export function saveSearchPreference(id, payload) {
	return (dispatch) => {
		let preferenceId = id;
		if (!preferenceId) {
			preferenceId = uuidv4();
		}
		dispatch(createAction(AppConstants.APP.UI_BUILDER.SEARCH_PREFERENCES.SAVE));
		const ACC_API = getURL();
		return doPut(`${ACC_API}/_uibuilder/${preferenceId}/search`, payload)
			.then((res) => {
				// Update preferences
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.SEARCH_PREFERENCES.SAVE_SUCCESS,
						res,
						payload,
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

export function saveRecommendationPreference(id, payload) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.UI_BUILDER.RECOMMENDATION_PREFERENCES.SAVE));
		const ACC_API = getURL();
		let preferenceId = id;
		if (!preferenceId) {
			preferenceId = uuidv4();
		}
		return doPut(`${ACC_API}/_uibuilder/${preferenceId}/recommendation`, payload)
			.then((res) => {
				// Update preferences
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.RECOMMENDATION_PREFERENCES.SAVE_SUCCESS,
						res,
						payload,
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

export function deleteSearchPreference(id) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.UI_BUILDER.SEARCH_PREFERENCES.DELETE));
		const ACC_API = getURL();
		return doDelete(`${ACC_API}/_uibuilder/${id}/search`)
			.then((res) => {
				// Update preferences
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.SEARCH_PREFERENCES.DELETE_SUCCESS,
						res,
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

export function deleteRecommendationPreference(id) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.UI_BUILDER.RECOMMENDATION_PREFERENCES.DELETE));
		const ACC_API = getURL();
		return doDelete(`${ACC_API}/_uibuilder/${id}/recommendation`)
			.then((res) => {
				// Update preferences
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.RECOMMENDATION_PREFERENCES.DELETE_SUCCESS,
						res,
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

export function getSearchPreferenceVersions(preferenceId) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.UI_BUILDER.SEARCH_PREFERENCE_VERSIONS.GET));
		const ACC_API = getURL();
		return doGet(`${ACC_API}/_uibuilder/${preferenceId}/code/versions`)
			.then((res) =>
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.SEARCH_PREFERENCE_VERSIONS.GET_SUCCESS,
						{ results: res.versions, preferenceId },
						null,
					),
				),
			)
			.catch((error) =>
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.SEARCH_PREFERENCE_VERSIONS.GET_ERROR,
						null,
						error,
					),
				),
			);
	};
}

// actions to handle fetching, updating, etc for versions of code for search ui
export function getSearchPreferenceLatestVersion(preferenceId) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.UI_BUILDER.SEARCH_PREFERENCE_VERSIONS.GET_LATEST));
		const ACC_API = getURL();
		return doGet(`${ACC_API}/_uibuilder/${preferenceId}/code`)
			.then((res) =>
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.SEARCH_PREFERENCE_VERSIONS.GET_LATEST_SUCCESS,
						{ res, preferenceId },
						null,
					),
				),
			)
			.catch((error) =>
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.SEARCH_PREFERENCE_VERSIONS.GET_LATEST_ERROR,
						null,
						error,
					),
				),
			);
	};
}

export function getSearchPreferenceVersionCodeByVersion(preferenceId, versionId) {
	return (dispatch) => {
		dispatch(
			createAction(AppConstants.APP.UI_BUILDER.SEARCH_PREFERENCE_VERSIONS.GET_VERSION_CODE),
		);
		const ACC_API = getURL();
		return doGet(`${ACC_API}/_uibuilder/${preferenceId}/code/version/${versionId}`)
			.then((res) =>
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.SEARCH_PREFERENCE_VERSIONS
							.GET_VERSION_CODE_SUCCESS,
						{ res, preferenceId },
						null,
					),
				),
			)
			.catch((error) =>
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.SEARCH_PREFERENCE_VERSIONS
							.GET_VERSION_CODE_ERROR,
						null,
						error,
					),
				),
			);
	};
}

export function getSearchPreferenceDeploymentStatus(preferenceId) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.UI_BUILDER.SEARCH_PREFERENCE_DEPLOYEMENTS.GET));
		const ACC_API = getURL();
		return doGet(`${ACC_API}/_uibuilder/${preferenceId}/deploy`)
			.then((res) =>
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.SEARCH_PREFERENCE_DEPLOYEMENTS.GET_SUCCESS,
						{ results: res, preferenceId },
						null,
					),
				),
			)
			.catch((error) =>
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.SEARCH_PREFERENCE_DEPLOYEMENTS.GET_ERROR,
						null,
						{ error, preferenceId },
					),
				),
			);
	};
}

export function fetchAuth0Preferences() {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.UI_BUILDER.AUTH0.GET_AUTH0_PREFERENCES));
		const ACC_API = getURL();

		return doGet(`${ACC_API}/_uibuilder/auth_preferences`)
			.then((res) => {
				if (res._client_id) dispatch(fetchAuth0Client(res._client_id));
				return dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.AUTH0.GET_AUTH0_PREFERENCES_SUCCESS,
						res,
					),
				);
			})
			.catch((error) =>
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.AUTH0.GET_AUTH0_PREFERENCES_ERROR,
						null,
						error,
					),
				),
			);
	};
}

export function putAuth0Preferences(payload) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.UI_BUILDER.AUTH0.SET_AUTH0_PREFERENCES));
		const ACC_API = getURL();

		return doPut(`${ACC_API}/_uibuilder/auth_preferences`, payload)
			.then((res) => {
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.AUTH0.SET_AUTH0_PREFERENCES_SUCCESS,
						res,
					),
				);
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.AUTH0.GET_AUTH0_PREFERENCES_SUCCESS,
						payload,
					),
				);
			})
			.catch((error) =>
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.AUTH0.SET_AUTH0_PREFERENCES_ERROR,
						null,
						error,
					),
				),
			);
	};
}

export function postAuth0Client(payload) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.UI_BUILDER.AUTH0.CREATE_AUTH0_CLIENT));
		const ACC_API = getURL();
		return doPost(`${ACC_API}/_uibuilder/authentication`, payload)
			.then((res) => {
				dispatch(
					createAction(AppConstants.APP.UI_BUILDER.AUTH0.GET_AUTH0_CLIENT_SUCCESS, res),
				);
				return dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.AUTH0.CREATE_AUTH0_CLIENT_SUCCESS,
						res,
					),
				);
			})
			.catch((error) =>
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.AUTH0.CREATE_AUTH0_CLIENT_ERROR,
						null,
						error,
					),
				),
			);
	};
}

export function fetchAuth0Client(clientId) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.UI_BUILDER.AUTH0.GET_AUTH0_CLIENT));
		const ACC_API = getURL();

		return doGet(`${ACC_API}/_uibuilder/authentication/${clientId}`)
			.then((res) => {
				dispatch(
					createAction(AppConstants.APP.UI_BUILDER.AUTH0.GET_AUTH0_CLIENT_SUCCESS, res),
				);
			})
			.catch((error) =>
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.AUTH0.GET_AUTH0_CLIENT_ERROR,
						null,
						error,
					),
				),
			);
	};
}

export function patchAuth0Client(clientId, payload) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.UI_BUILDER.AUTH0.UPDATE_AUTH0_CLIENT));
		const ACC_API = getURL();
		return doPatch(`${ACC_API}/_uibuilder/authentication/${clientId}`, payload)
			.then((res) => {
				dispatch(
					createAction(AppConstants.APP.UI_BUILDER.AUTH0.GET_AUTH0_CLIENT_SUCCESS, res),
				);
				return dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.AUTH0.UPDATE_AUTH0_CLIENT_SUCCESS,
						res,
					),
				);
			})
			.catch((error) =>
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.AUTH0.UPDATE_AUTH0_CLIENT_ERROR,
						null,
						error,
					),
				),
			);
	};
}

export function getAuth0ClientConnections(clientId) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.UI_BUILDER.AUTH0.GET_AUTH0_CLIENT_CONNECTIONS));
		const ACC_API = getURL();
		return doGet(`${ACC_API}/_uibuilder/auth_connection_state/${clientId}`)
			.then((res) => {
				return dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.AUTH0.GET_AUTH0_CLIENT_CONNECTIONS_SUCCESS,
						res,
					),
				);
			})
			.catch((error) =>
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.AUTH0.GET_AUTH0_CLIENT_CONNECTIONS_ERROR,
						null,
						error,
					),
				),
			);
	};
}

export function putAuth0ClientConnections(clientId, payload) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.UI_BUILDER.AUTH0.SAVE_AUTH0_CLIENT_CONNECTIONS));
		const ACC_API = getURL();
		return doPut(`${ACC_API}/_uibuilder/auth_connection_state/${clientId}`, payload)
			.then((res) => {
				return dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.AUTH0.SAVE_AUTH0_CLIENT_CONNECTIONS_SUCCESS,
						res,
					),
				);
			})
			.catch((error) =>
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.AUTH0.SAVE_AUTH0_CLIENT_CONNECTIONS_ERROR,
						null,
						error,
					),
				),
			);
	};
}

export function postAuth0ClientConnection(payload) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.UI_BUILDER.AUTH0.CREATE_AUTH0_CLIENT_CONNECTION));
		const ACC_API = getURL();
		return doPost(`${ACC_API}/_uibuilder/auth_connection`, payload)
			.then((res) => {
				getAuth0ClientConnections(payload.name); // payload.name contains the _client_id
				return dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.AUTH0.CREATE_AUTH0_CLIENT_CONNECTION_SUCCESS,
						res,
					),
				);
			})
			.catch((error) =>
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.AUTH0.CREATE_AUTH0_CLIENT_CONNECTION_ERROR,
						null,
						error,
					),
				),
			);
	};
}

export function getAuth0ClientConnection(connectionId) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.UI_BUILDER.AUTH0.GET_AUTH0_CLIENT_CONNECTION));
		const ACC_API = getURL();
		return doGet(`${ACC_API}/_uibuilder/auth_connection/${connectionId}`)
			.then((res) => {
				return dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.AUTH0.GET_AUTH0_CLIENT_CONNECTION_SUCCESS,
						res,
					),
				);
			})
			.catch((error) =>
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.AUTH0.GET_AUTH0_CLIENT_CONNECTION_ERROR,
						null,
						error,
					),
				),
			);
	};
}

export function patchAuth0ClientConnection(connectionId, payload, clientId) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.UI_BUILDER.AUTH0.UPDATE_AUTH0_CLIENT_CONNECTION));
		const ACC_API = getURL();
		return doPatch(`${ACC_API}/_uibuilder/auth_connection/${connectionId}`, payload)
			.then((res) => {
				getAuth0ClientConnections(clientId); // payload.name contains the _client_id
				return dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.AUTH0.UPDATE_AUTH0_CLIENT_CONNECTION_SUCCESS,
						res,
					),
				);
			})
			.catch((error) =>
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.AUTH0.UPDATE_AUTH0_CLIENT_CONNECTION_ERROR,
						null,
						error,
					),
				),
			);
	};
}

export function getAuth0Users() {
	return (dispatch, getState) => {
		const clientId = getState().$getAuth0Preferences.results._client_id;
		dispatch(createAction(AppConstants.APP.UI_BUILDER.AUTH0.GET_AUTH0_USERS));
		const ACC_API = getURL();
		return doGet(`${ACC_API}/_uibuilder/auth_users?q=app_metadata.${clientId}=true`)
			.then((res) => {
				return dispatch(
					createAction(AppConstants.APP.UI_BUILDER.AUTH0.GET_AUTH0_USERS_SUCCESS, res),
				);
			})
			.catch((error) =>
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.AUTH0.GET_AUTH0_USERS_ERROR,
						null,
						error,
					),
				),
			);
	};
}

export function createAuth0User(payload) {
	return (dispatch, getState) => {
		dispatch(createAction(AppConstants.APP.UI_BUILDER.AUTH0.CREATE_AUTH0_USER));

		const ACC_API = getURL();
		const clientId = getState().$getAuth0Preferences.results._client_id;
		return doPost(`${ACC_API}/_uibuilder/auth_user`, {
			...payload,
			app_metadata: {
				[clientId]: true,
			},
		})
			.then((res) => {
				dispatch(getAuth0Users());
				return dispatch(
					createAction(AppConstants.APP.UI_BUILDER.AUTH0.CREATE_AUTH0_USER_SUCCESS, res),
				);
			})
			.catch((error) =>
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.AUTH0.CREATE_AUTH0_USER_ERROR,
						null,
						error,
					),
				),
			);
	};
}

export function patchAuth0UserSettings(userId, payload) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.UI_BUILDER.AUTH0.UPDATE_AUTH0_USER_SETTINGS));
		const ACC_API = getURL();
		return doPatch(`${ACC_API}/_uibuilder/auth_user/${userId}`, payload)
			.then((res) => {
				dispatch(getAuth0Users());
				return dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.AUTH0.UPDATE_AUTH0_USER_SETTINGS_SUCCESS,
						res,
					),
				);
			})
			.catch((error) =>
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.AUTH0.UPDATE_AUTH0_USER_SETTINGS_ERROR,
						null,
						error,
					),
				),
			);
	};
}

export function deleteAuthUser(userId) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.UI_BUILDER.AUTH0.DELETE_AUTH0_USER));
		const ACC_API = getURL();

		return doDelete(`${ACC_API}/_uibuilder/auth_user/${userId}`)
			.then((res) => {
				return dispatch(
					createAction(AppConstants.APP.UI_BUILDER.AUTH0.DELETE_AUTH0_USER_SUCCESS, res),
				);
			})
			.catch((error) => {
				return dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.AUTH0.DELETE_AUTH0_USER_ERROR,
						null,
						error,
					),
				);
			})
			.finally(() => {
				dispatch(getAuth0Users());
			});
	};
}
