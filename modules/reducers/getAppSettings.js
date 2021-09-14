import AppConstants from '../constants';

const initialState = {
	isFetching: false,
	error: null,
	success: false,
	settings: {},
};

const indexSuggestionsInitialState = {
	showDistinctSuggestions: true,
	enablePredictiveSuggestions: true,
	maxPredictedWords: 2,
	applyStopwords: true,
	customStopwords: ['the','a'],
	enableSynonyms: true,
	size: 5,
	includeFields: ['body_html','image'],
	excludeFields: ['bathrooms'],
	categoryField: 'body_html',
	customQuery: 'efe',
	indices: ['airbeds-test-app'],
};

const popularSuggestionsInitialState = {
	indices: ['airbeds-test-app'],
	numberOfDays: 2,
	minHits: 3,
	minCount: 3,
	minCharacters: 3,
	transformDiacritics: true,
	blacklist: ['movie'],
	size: 5,
};

const recentSuggestionsInitialState = {
	minHits: 1,
	size: 5,
	indices: ['airbeds-test-app'],
}

function getAppSettings(state = initialState, action) {
	switch (action.type) {
		case AppConstants.APP.SEARCH_SETTINGS.GET:
			return {
				...state,
				isFetching: true,
			};
		case AppConstants.APP.SEARCH_SETTINGS.GET_SUCCESS:
			return {
				...state,
				isFetching: false,
				settings: Object.assign({}, state.settings, {
					[action.meta.appName]: {
						...action.payload,
						indexSuggestions: {...indexSuggestionsInitialState},
						recentSuggestions: {...recentSuggestionsInitialState},
						popularSuggestions: {...popularSuggestionsInitialState}
					},
				}),
				success: true,
			};

		case AppConstants.APP.SEARCH_SETTINGS.GET_ERROR:
			return {
				...state,
				isFetching: false,
				error: action.error,
			};
		case AppConstants.APP.SEARCH_SETTINGS.GET_DEFAULT:
			return {
				...state,
				default: { success: false, error: false, loading: true },
			};
		case AppConstants.APP.SEARCH_SETTINGS.GET_DEFAULT_SUCCESS:
			return {
				...state,
				default: { success: true, error: false, loading: false },
				defaultSettings: action.payload,
			};

		case AppConstants.APP.SEARCH_SETTINGS.GET_DEFAULT_ERROR:
			return {
				...state,
				default: { success: false, error: action.error, loading: false },
			};
		case AppConstants.APP.SEARCH_SETTINGS.UPDATE:
			return {
				...state,
				isUpdating: true,
			};
		case AppConstants.APP.SEARCH_SETTINGS.UPDATE_SUCCESS:
			return {
				...state,
				isUpdating: false,
				settings: Object.assign({}, state.settings, {

					[action.meta.name]: {
						...action.payload,
						indexSuggestions: {...indexSuggestionsInitialState},
						recentSuggestions: {...recentSuggestionsInitialState},
						popularSuggestions: {...popularSuggestionsInitialState}
					}
				}),
				success: true,
			};

		case AppConstants.APP.SEARCH_SETTINGS.UPDATE_ERROR:
			return {
				...state,
				isUpdating: false,
				error: action.error,
			};

		case AppConstants.APP.SEARCH_SETTINGS.DELETE:
			return {
				...state,
				settings: Object.assign({}, state.settings, {
					[action.meta.name]: {
						...state.settings[action.meta.name],
						deleteError: null,
						isDeleting: true,
					},
				}),
			};

		case AppConstants.APP.SEARCH_SETTINGS.DELETE_ERROR:
			return {
				...state,
				settings: Object.assign({}, state.settings, {
					[action.meta.name]: {
						...state.settings[action.meta.name],
						isDeleting: false,
						deleteError: action.error,
					},
				}),
			};
		case AppConstants.APP.SEARCH_SETTINGS.DELETE_SUCCESS:
			return {
				...state,
				settings: Object.assign({}, state.settings, {
					[action.meta.name]: {
						...state.settings[action.meta.name],
						isDeleting: false,
					},
				}),
			};
		default:
			return state;
	}
}

export default getAppSettings;
