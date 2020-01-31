import AppConstants from '../constants';

const initialState = {};

function privateRegistries(state = initialState, action) {
	switch (action.type) {
		case AppConstants.APP.PRIVATE_REGISTRY.GET_SUCCESS:
			return action.payload;
		case AppConstants.APP.PRIVATE_REGISTRY.UPDATE:
			return {
				...state,
				updating: true,
				error: null,
				success: false,
			};
		case AppConstants.APP.PRIVATE_REGISTRY.UPDATE_SUCCESS:
			return {
				...action.payload,
				updating: false,
				error: null,
				success: true,
			};
		case AppConstants.APP.PRIVATE_REGISTRY.UPDATE_ERROR:
			return {
				...state,
				updating: false,
				error: action.error && action.error.message,
				success: false,
			};
		default:
			return state;
	}
}

export default privateRegistries;
