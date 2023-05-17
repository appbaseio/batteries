import AppConstants from '../constants';

const initialAppState = {
	faqs: {
		isFetching: false,
		error: undefined,
	},
};

function AIReducer(state = initialAppState, action) {
	switch (action.type) {
		case AppConstants.APP.AI.GET_AI_FAQS:
			return {
				...state,
				faqs: {
					...state.faqs,
					isFetching: true,
					error: null,
				},
			};
		case AppConstants.APP.AI.GET_AI_FAQS_SUCCESS:
			return {
				...state,
				faqs: {
					...state.faqs,
					isFetching: false,
					error: null,
					data: action.payload,
				},
			};
		case AppConstants.APP.AI.GET_AI_FAQS_ERROR:
			return {
				...state,
				faqs: {
					...state.faqs,
					isFetching: false,
					error: action.error,
					data: action.payload,
				},
			};
		default:
			return state;
	}
}

export default AIReducer;
