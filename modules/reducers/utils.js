const initialState = {
	isFetching: false,
	error: undefined,
	results: undefined,
};
// eslint-disable-next-line
export const createRequestReducer = (requestAction, successAction, errorAction) => function request(state = initialState, action) {
		switch (action.type) {
			case requestAction:
				return {
					...state,
					isFetching: true,
					error: undefined,
				};
			case successAction:
				return {
					...state,
					isFetching: false,
					results: action.payload,
				};
			case errorAction:
				return {
					...state,
					isFetching: false,
					error: action.error,
				};
			default:
				return state;
		}
	};
