import AppConstants from '../constants';

const initialAppState = {};

function getSearchPreferencesVersions(state = initialAppState, action) {
	switch (action.type) {
		case AppConstants.APP.UI_BUILDERN.SEARCH_PREFERENCE_VERSIONS.GET:
			return {
				...state,
				isFetching: true,
				success: false,
				error: false,
			};
		case AppConstants.APP.UI_BUILDERN.SEARCH_PREFERENCE_VERSIONS.GET_SUCCESS:
			return {
				isFetching: false,
				success: true,
				error: false,
				results: {
					...state.results,
					[action.payload.preferenceId]: {
						...(state.results?.[action.payload.preferenceId] ?? {}),
						allVersions: [...action.payload.results],
					},
				},
			};
		case AppConstants.APP.UI_BUILDERN.SEARCH_PREFERENCE_VERSIONS.GET_ERROR:
			return {
				...state,
				isFetching: false,
				success: false,
				error: action.error && action.error.message,
			};
		case AppConstants.APP.UI_BUILDERN.SEARCH_PREFERENCE_VERSIONS.GET_LATEST:
		case AppConstants.APP.UI_BUILDERN.SEARCH_PREFERENCE_VERSIONS.GET_VERSION_CODE:
			return {
				...state,
				isLoading: true,
				success: false,
				error: false,
			};
		case AppConstants.APP.UI_BUILDERN.SEARCH_PREFERENCE_VERSIONS.GET_LATEST_SUCCESS:
		case AppConstants.APP.UI_BUILDERN.SEARCH_PREFERENCE_VERSIONS.GET_VERSION_CODE_SUCCESS: {
			const { res } = action.payload;
			const currentVersion = {
				version_id: res.version_id,
				updated_at: res.updated_at || res.created_at,
				commit: res?.metadata?.commit || '',
			};
			return {
				isLoading: false,
				success: true,
				error: false,
				results: {
					...state.results,
					[action.payload.preferenceId]: {
						...(state.results?.[action.payload.preferenceId] ?? {}),
						currentVersion,
					},
				},
			};
		}
		case AppConstants.APP.UI_BUILDERN.SEARCH_PREFERENCE_VERSIONS.GET_LATEST_ERROR:
		case AppConstants.APP.UI_BUILDERN.SEARCH_PREFERENCE_VERSIONS.GET_VERSION_CODE_ERROR:
			return {
				...state,
				isLoading: false,
				success: false,
				error: action.error && action.error.message,
			};

		case AppConstants.APP.UI_BUILDERN.SEARCH_PREFERENCE_VERSIONS.UPDATE_PREFERENCE_STATE:
			return {
				...state,
				isLoading: true,
				success: false,
				error: false,
			};
		case AppConstants.APP.UI_BUILDERN.SEARCH_PREFERENCE_VERSIONS
			.UPDATE_PREFERENCE_STATE_SUCCESS: {
			const { preferenceId, patchPayload } = action.payload;
			return {
				isLoading: false,
				success: true,
				error: false,
				results: {
					...state.results,
					[preferenceId]: {
						...(state.results?.[preferenceId] ?? {}),
						...patchPayload,
					},
				},
			};
		}
		case AppConstants.APP.UI_BUILDERN.SEARCH_PREFERENCE_VERSIONS.UPDATE_PREFERENCE_STATE_ERROR:
			return {
				...state,
				isLoading: false,
				success: false,
				error: action.error && action.error.message,
			};

		case AppConstants.APP.UI_BUILDERN.SEARCH_PREFERENCE_DEPLOYEMENTS.GET:
			return {
				...state,
				isFetching: true,
				success: false,
				error: false,
			};
		case AppConstants.APP.UI_BUILDERN.SEARCH_PREFERENCE_DEPLOYEMENTS.GET_SUCCESS:
			return {
				isFetching: false,
				success: true,
				error: false,
				results: {
					...state.results,
					[action.payload.preferenceId]: {
						...(state.results?.[action.payload.preferenceId] ?? {}),
						deploymentStatus: { ...action.payload.results },
					},
				},
			};
		case AppConstants.APP.UI_BUILDERN.SEARCH_PREFERENCE_DEPLOYEMENTS.GET_ERROR:
			return {
				...state,
				isFetching: false,
				success: false,
				error: action.error && action.error.message,
			};

		default:
			return state;
	}
}

export default getSearchPreferencesVersions;
