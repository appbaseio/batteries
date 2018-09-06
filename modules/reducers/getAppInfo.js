import AppConstants from '../constants';

const initialAppState = {
	isFetching: false,
	error: undefined,
	app: undefined,
};

function app(state = initialAppState, action) {
	switch (action.type) {
		case AppConstants.APP.GET_INFO:
			return {
				...state,
				isFetching: true,
				error: undefined,
			};
		case AppConstants.APP.GET_INFO_SUCCESS:
			return {
				...state,
				isFetching: false,
				app: action.payload,
			};
		case AppConstants.APP.GET_INFO_ERROR:
			return {
				...state,
				isFetching: false,
				error: action.error,
			};
		default:
			return state;
	}
}

export default app;
