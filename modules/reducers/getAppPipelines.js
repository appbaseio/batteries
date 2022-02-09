import AppConstants from '../constants';

const initialAppState = {};

function getAppPipelines(state = initialAppState, action) {
	switch (action.type) {
		case AppConstants.APP.PIPELINES.GET:
			return {
				isFetching: true,
				success: false,
				error: false,
			};
		case AppConstants.APP.PIPELINES.GET_SUCCESS:
			return {
				isFetching: false,
				success: true,
				error: false,
				results: action.payload,
			};
		case AppConstants.APP.PIPELINES.GET_ERROR:
			return {
				isFetching: false,
				success: false,
				error: action.payload,
			};

		default:
			return state;
	}
}

export default getAppPipelines;
