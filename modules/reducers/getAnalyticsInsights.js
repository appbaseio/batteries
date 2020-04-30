import AppConstants from '../constants';

const initialState = {
	isFetching: false,
	error: undefined,
	success: false,
	results: {},
};

function getAppAnalyticsInsights(state = initialState, action) {
	switch (action.type) {
		case AppConstants.APP.ANALYTICS.GET_INSIGHTS:
			return {
				...state,
				isFetching: true,
				error: undefined,
				success: false,
			};
		case AppConstants.APP.ANALYTICS.GET_INSIGHTS_SUCCESS:
			return {
				...state,
				isFetching: false,
				results: Object.assign({}, state.results, {
					[action.meta.appName]: action.payload,
				}),
				success: true,
			};
		case AppConstants.APP.ANALYTICS.GET_INSIGHTS_ERROR:
			return {
				...state,
				isFetching: false,
				error: action.error,
			};
		default:
			return state;
	}
}

export default getAppAnalyticsInsights;
