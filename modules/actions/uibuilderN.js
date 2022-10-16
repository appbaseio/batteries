import { v4 as uuidv4 } from 'uuid';
import { createAction } from './utils';
import AppConstants from '../constants';
import { getURL } from '../../../constants/config';
import { doGet, doPut, doDelete } from '../../utils/requestService';

// New methods
export function getSearchPreferencesN() {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.UI_BUILDERN.SEARCH_PREFERENCES.GET));
		const ACC_API = getURL();
		return doGet(`${ACC_API}/_uibuilder/search`)
			.then((res) =>
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDERN.SEARCH_PREFERENCES.GET_SUCCESS,
						res,
						null,
					),
				),
			)
			.catch((error) =>
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDERN.SEARCH_PREFERENCES.GET_ERROR,
						null,
						error,
					),
				),
			);
	};
}

export function getRecommendationsPreferencesN() {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.UI_BUILDERN.RECOMMENDATION_PREFERENCES.GET));
		const ACC_API = getURL();
		return doGet(`${ACC_API}/_uibuilder/recommendation`)
			.then((res) =>
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDERN.RECOMMENDATION_PREFERENCES.GET_SUCCESS,
						res,
						null,
					),
				),
			)
			.catch((error) =>
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDERN.RECOMMENDATION_PREFERENCES.GET_ERROR,
						null,
						error,
					),
				),
			);
	};
}

export function getSearchPreferenceN(id) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.UI_BUILDERN.SEARCH_PREFERENCES.GET));
		const ACC_API = getURL();
		return doGet(`${ACC_API}/_uibuilder/${id}/search`)
			.then((res) =>
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDERN.SEARCH_PREFERENCES.GET_SUCCESS,
						res,
						null,
					),
				),
			)
			.catch((error) =>
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDERN.SEARCH_PREFERENCES.GET_ERROR,
						null,
						error,
					),
				),
			);
	};
}

export function getRecommendationPreferenceN(id) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.UI_BUILDERN.RECOMMENDATION_PREFERENCES.GET));
		const ACC_API = getURL();
		return doGet(`${ACC_API}/_uibuilder/${id}/recommendation`)
			.then((res) =>
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDERN.RECOMMENDATION_PREFERENCES.GET_SUCCESS,
						res,
						null,
					),
				),
			)
			.catch((error) =>
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDERN.RECOMMENDATION_PREFERENCES.GET_ERROR,
						null,
						error,
					),
				),
			);
	};
}

export function saveSearchPreferenceN(id, payload) {
	return (dispatch) => {
		let preferenceId = id;
		if (!preferenceId) {
			preferenceId = uuidv4();
		}
		dispatch(createAction(AppConstants.APP.UI_BUILDERN.SEARCH_PREFERENCES.SAVE));
		const ACC_API = getURL();
		return doPut(`${ACC_API}/_uibuilder/${preferenceId}/search`, payload)
			.then((res) => {
				// Update preferences
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDERN.SEARCH_PREFERENCES.SAVE_SUCCESS,
						res,
						payload,
					),
				);
			})
			.catch((error) =>
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDERN.SEARCH_PREFERENCES.SAVE_ERROR,
						null,
						error,
					),
				),
			);
	};
}

export function saveRecommendationPreferenceN(id, payload) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.UI_BUILDERN.RECOMMENDATION_PREFERENCES.SAVE));
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
						AppConstants.APP.UI_BUILDERN.RECOMMENDATION_PREFERENCES.SAVE_SUCCESS,
						res,
						payload,
					),
				);
			})
			.catch((error) =>
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDERN.RECOMMENDATION_PREFERENCES.SAVE_ERROR,
						null,
						error,
					),
				),
			);
	};
}

export function deleteSearchPreferenceN(id) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.UI_BUILDERN.SEARCH_PREFERENCES.DELETE));
		const ACC_API = getURL();
		return doDelete(`${ACC_API}/_uibuilder/${id}/search`)
			.then((res) => {
				// Update preferences
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDERN.SEARCH_PREFERENCES.DELETE_SUCCESS,
						res,
					),
				);
			})
			.catch((error) =>
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDERN.SEARCH_PREFERENCES.DELETE_ERROR,
						null,
						error,
					),
				),
			);
	};
}

export function deleteRecommendationPreferenceN(id) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.UI_BUILDERN.RECOMMENDATION_PREFERENCES.DELETE));
		const ACC_API = getURL();
		return doDelete(`${ACC_API}/_uibuilder/${id}/recommendation`)
			.then((res) => {
				// Update preferences
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDERN.RECOMMENDATION_PREFERENCES.DELETE_SUCCESS,
						res,
					),
				);
			})
			.catch((error) =>
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDERN.RECOMMENDATION_PREFERENCES.DELETE_ERROR,
						null,
						error,
					),
				),
			);
	};
}

export function getSearchPreferenceVersionsN(preferenceId) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.UI_BUILDERN.SEARCH_PREFERENCE_VERSIONS.GET));
		const ACC_API = getURL();
		return doGet(`${ACC_API}/_uibuilder/${preferenceId}/code/versions`)
			.then((res) =>
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDERN.SEARCH_PREFERENCE_VERSIONS.GET_SUCCESS,
						{ results: res.versions, preferenceId },
						null,
					),
				),
			)
			.catch((error) =>
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDERN.SEARCH_PREFERENCE_VERSIONS.GET_ERROR,
						null,
						error,
					),
				),
			);
	};
}

// actions to handle fetching, updating, etc for versions of code for search ui
export function getSearchPreferenceLatestVersionN(preferenceId) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.UI_BUILDERN.SEARCH_PREFERENCE_VERSIONS.GET_LATEST));
		const ACC_API = getURL();
		return doGet(`${ACC_API}/_uibuilder/${preferenceId}/code`)
			.then((res) =>
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDERN.SEARCH_PREFERENCE_VERSIONS.GET_LATEST_SUCCESS,
						{ res, preferenceId },
						null,
					),
				),
			)
			.catch((error) =>
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDERN.SEARCH_PREFERENCE_VERSIONS.GET_LATEST_ERROR,
						null,
						error,
					),
				),
			);
	};
}

export function getSearchPreferenceVersionCodeByVersionN(preferenceId, versionId) {
	return (dispatch) => {
		dispatch(
			createAction(AppConstants.APP.UI_BUILDERN.SEARCH_PREFERENCE_VERSIONS.GET_VERSION_CODE),
		);
		const ACC_API = getURL();
		return doGet(`${ACC_API}/_uibuilder/${preferenceId}/code/version/${versionId}`)
			.then((res) =>
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDERN.SEARCH_PREFERENCE_VERSIONS
							.GET_VERSION_CODE_SUCCESS,
						{ res, preferenceId },
						null,
					),
				),
			)
			.catch((error) =>
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDERN.SEARCH_PREFERENCE_VERSIONS
							.GET_VERSION_CODE_ERROR,
						null,
						error,
					),
				),
			);
	};
}
