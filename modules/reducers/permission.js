import AppConstants from '../constants';

const initialPermissionState = {
	isFetching: false,
	error: undefined,
	permissions: [],
	success: undefined,
};

function permission(state = initialPermissionState, action) {
	switch (action.type) {
		case AppConstants.APP.PERMISSION.GET:
			return {
				...state,
				isFetching: true,
				error: undefined,
			};
		case AppConstants.APP.PERMISSION.GET_SUCCESS:
			return {
				...state,
				isFetching: false,
				permissions: action.payload,
			};
		case AppConstants.APP.PERMISSION.GET_ERROR:
			return {
				...state,
				isFetching: false,
				error: action.error,
			};
		case AppConstants.APP.PERMISSION.UPDATE:
		case AppConstants.APP.PERMISSION.CREATE:
		case AppConstants.APP.PERMISSION.DELETE:
			return {
				...state,
				isFetching: true,
				error: undefined,
				success: undefined,
			};
		case AppConstants.APP.PERMISSION.UPDATE_SUCCESS:
		case AppConstants.APP.PERMISSION.CREATE_SUCCESS:
		case AppConstants.APP.PERMISSION.DELETE_SUCCESS:
			return {
				...state,
				isFetching: false,
				success: action.payload,
			};
		case AppConstants.APP.PERMISSION.UPDATE_ERROR:
		case AppConstants.APP.PERMISSION.CREATE_ERROR:
		case AppConstants.APP.PERMISSION.DELETE_ERROR:
			return {
				...state,
				isFetching: false,
				error: action.error,
			};
		default:
			return state;
	}
}

export default permission;
