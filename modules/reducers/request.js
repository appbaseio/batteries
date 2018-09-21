const initialState = {
	isFetching: false,
	success: false,
	error: undefined,
	results: undefined,
};

const createRequestReducer = (
	requestAction,
	successAction,
	errorAction,
	extendSuccessState,
	extendInitialState,
) => function request(state = initialState, action) {
		const getExtendedState = (extendState) => {
			if (typeof extendState === 'function') {
				return extendState(action, state);
			}
			if (typeof extendState === 'object') {
				return extendState;
			}
			return {};
		};
		switch (action.type) {
			case requestAction:
				return {
					...state,
					isFetching: true,
					error: undefined,
					success: false,
					...getExtendedState(extendInitialState),
				};
			case successAction:
				return {
					...state,
					isFetching: false,
					success: true,
					results: action.payload,
					...getExtendedState(extendSuccessState),
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
