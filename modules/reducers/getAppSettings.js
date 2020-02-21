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
		default:
			return state;
	}
}

export default getAppSettings;
