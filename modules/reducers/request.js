const initialState = {
	isFetching: false,
	success: false,
	error: undefined,
	results: undefined,
};

const createRequestReducer = (requestAction, successAction, errorAction, extendState) => function request(state = initialState, action) {
		switch (action.type) {
			case requestAction:
				return {
					...state,
					isFetching: true,
					error: undefined,
					success: false,
				};
			case successAction:
				return {
					...state,
					isFetching: false,
					success: true,
					results: action.payload,
					...(extendState && extendState(action, state)),
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

export default createRequestReducer;
