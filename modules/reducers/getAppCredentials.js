import AppConstants from '../constants';

const initialState = {
	isFetching: false,
	error: undefined,
	credentials: undefined,
};

function getAppCredentials(state = initialState, action) {
	switch (action.type) {
		case AppConstants.APP.GET_CREDENTIALS:
			return {
				...state,
				isFetching: true,
				error: undefined,
			};
		case AppConstants.APP.GET_CREDENTIALS_SUCCESS:
			return {
				...state,
				isFetching: false,
				credentials: action.payload,
			};
		case AppConstants.APP.GET_CREDENTIALS_ERROR:
			return {
				...state,
				isFetching: false,
				error: action.error,
			};
		default:
			return state;
	}
}

export default getAppCredentials;
