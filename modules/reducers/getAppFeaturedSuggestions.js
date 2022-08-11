import AppConstants from '../constants';

const initialAppState = {};

function getAppFeaturedSuggestions(state = initialAppState, action) {
	switch (action.type) {
		case AppConstants.APP.FEATURED_SUGGESTIONS.GET:
			return {
				isFetching: true,
				success: false,
				error: false,
			};
		case AppConstants.APP.FEATURED_SUGGESTIONS.GET_SUCCESS:
			return {
				isFetching: false,
				success: true,
				error: false,
				results: { [action.payload.id]: action.payload.data },
			};
		case AppConstants.APP.FEATURED_SUGGESTIONS.GET_ERROR:
			return {
				isFetching: false,
				success: false,
				error: action.payload,
			};

		case AppConstants.APP.FEATURED_SUGGESTIONS.UPDATE: {
			return {
				...state,
				save: {
					isLoading: true,
					error: null,
				},
			};
		}
		case AppConstants.APP.FEATURED_SUGGESTIONS.UPDATE_SUCCESS: {
			return {
				...state,
				results: { ...state.results, [action.payload.id]: action.payload.data },
				save: {
					isLoading: false,
					error: null,
				},
			};
		}
		case AppConstants.APP.FEATURED_SUGGESTIONS.UPDATE_ERROR: {
			return {
				...state,
				save: {
					isLoading: false,
					error: action.error,
				},
			};
		}

		case AppConstants.APP.FEATURED_SUGGESTIONS.DELETE: {
			const updatedResults = { ...state.results };
			updatedResults[action.payload.id] = {
				...updatedResults[action.payload.id],
				isDeleting: true,
			};
			return {
				...state,
				results: updatedResults,
			};
		}
		case AppConstants.APP.FEATURED_SUGGESTIONS.DELETE_SUCCESS: {
			const filteredResults = { ...state.results };
			delete filteredResults[action.payload.id];
			return {
				...state,
				results: filteredResults,
				deleted: action.payload.id,
			};
		}
		case AppConstants.APP.FEATURED_SUGGESTIONS.DELETE_ERROR: {
			const updatedResults = { ...state.results };
			updatedResults[action.payload.id] = {
				...updatedResults[action.payload.id],
				isDeleting: false,
				deleteError: action.error,
			};
			return {
				...state,
				results: updatedResults,
			};
		}

		default:
			return state;
	}
}

export default getAppFeaturedSuggestions;
