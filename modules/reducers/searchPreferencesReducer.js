import AppConstants from '../constants';

const initialAppState = {};

function getSearchPreferencesVersions(state = initialAppState, action) {
	switch (action.type) {
		case AppConstants.APP.UI_BUILDERN.SEARCH_PREFERENCE_VERSIONS.GET:
			return {
				...state,
				isLoading: true,
				success: false,
				error: false,
			};
		case AppConstants.APP.UI_BUILDERN.SEARCH_PREFERENCE_VERSIONS.GET_SUCCESS:
			return {
				isLoading: false,
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
				isLoading: false,
				success: false,
				error: action.error && action.error.message,
			};
		case AppConstants.APP.UI_BUILDERN.SEARCH_PREFERENCE_VERSIONS.GET_LATEST:
			return {
				...state,
				isLoading: true,
				success: false,
				error: false,
			};
		case AppConstants.APP.UI_BUILDERN.SEARCH_PREFERENCE_VERSIONS.GET_LATEST_SUCCESS: {
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
						...state.results[action.payload.preferenceId],
						currentVersion,
					},
				},
			};
		}
		case AppConstants.APP.UI_BUILDERN.SEARCH_PREFERENCE_VERSIONS.GET_LATEST_ERROR:
			return {
				...state,
				isLoading: false,
				success: false,
				error: action.error && action.error.message,
			};

		default:
			return state;
	}
}

export default getSearchPreferencesVersions;
