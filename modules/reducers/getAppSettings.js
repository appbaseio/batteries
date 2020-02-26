import AppConstants from '../constants';

const initialState = {
	isFetching: false,
	error: null,
	success: false,
	settings: {},
};

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
					[action.meta.appName]: action.payload,
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
				default: { success: false, error: false, isFetching: true },
			};
		case AppConstants.APP.SEARCH_SETTINGS.GET_DEFAULT_SUCCESS:
			return {
				...state,
				default: { success: true, error: false, isFetching: false },
				defaultSettings: action.payload,
			};

		case AppConstants.APP.SEARCH_SETTINGS.GET_DEFAULT_ERROR:
			return {
				...state,
				default: { success: false, error: action.error, isFetching: false },
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
					[action.meta.name]: action.payload,
				}),
				success: true,
			};

		case AppConstants.APP.SEARCH_SETTINGS.UPDATE_ERROR:
			return {
				...state,
				isUpdating: false,
				error: action.error,
			};
		default:
			return state;
	}
}

export default getAppSettings;
