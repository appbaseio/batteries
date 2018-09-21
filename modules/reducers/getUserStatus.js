import AppConstants from '../constants';

const initialAccountState = {
	isFetching: false,
	error: undefined,
	isPaidUser: undefined,
	plan: undefined,
	success: false,
};

function account(state = initialAccountState, action) {
	switch (action.type) {
		case AppConstants.ACCOUNT.CHECK_USER_PLAN.GET:
			return {
				...state,
				isFetching: true,
				error: undefined,
				isPaidUser: undefined,
				plan: undefined,
				success: false,
			};
		case AppConstants.ACCOUNT.CHECK_USER_PLAN.GET_SUCCESS:
			return {
				...state,
				isFetching: false,
				isPaidUser: action.payload.isPaidUser,
				plan: action.payload.plan,
				success: true,
			};
		case AppConstants.ACCOUNT.CHECK_USER_PLAN.GET_ERROR:
			return {
				...state,
				isFetching: false,
				error: action.error,
			};
		default:
			return state;
	}
}

export default account;
