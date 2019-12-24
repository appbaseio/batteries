import AppConstants from '../constants';

const initialAppState = {};

function getAppFunction(state = initialAppState, action) {
	switch (action.type) {
		case AppConstants.APP.FUNCTIONS.GET:
			return {
				isFetching: true,
				success: false,
				error: false,
			};
		case AppConstants.APP.FUNCTIONS.GET_SUCCESS:
			return {
				isFetching: false,
				success: true,
				error: false,
				results: [...action.payload],
			};
		case AppConstants.APP.FUNCTIONS.GET_ERROR:
			return {
				isFetching: false,
				success: false,
				error: action.payload,
			};
		case AppConstants.APP.FUNCTIONS.UPDATE: {
			const updatedResults = state.results.map((item) => {
				if (item._id === action.payload.name) {
					const triggerUpdation = !!action.payload.isTrigger;

					return {
						...item,
						triggerUpdation,
						isToggling: !triggerUpdation,
					};
				}
				return item;
			});

			return {
				...state,
				results: updatedResults,
			};
		}
		case AppConstants.APP.FUNCTIONS.UPDATE_SUCCESS: {
			const updatedResults = state.results.map((item) => {
				if (item._id === action.meta.name) {
					return {
						...action.payload[action.meta.name],
						triggerUpdation: false,
						isToggling: false,
					};
				}
				return item;
			});

			return { ...state, results: updatedResults };
		}
		default:
			return state;
	}
}

export default getAppFunction;
