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
		case AppConstants.APP.AI.DELETE_AI_FAQS:
			return {
				...state,
				faqs: {
					...state.faqs,
					isDeleting: action.payload.id,
					error: null,
				},
			};
		case AppConstants.APP.AI.DELETE_AI_FAQS_SUCCESS:
			return {
				...state,
				faqs: {
					...state.faqs,
					isDeleting: false,
					error: null,
				},
			};
		case AppConstants.APP.AI.DELETE_AI_FAQS_ERROR:
			return {
				...state,
				faqs: {
					...state.faqs,
					isDeleting: false,
					error: action.error,
				},
			};
		case AppConstants.APP.AI.CREATE_AI_FAQS:
			return {
				...state,
				faqs: {
					...state.faqs,
					isCreating: true,
					error: null,
				},
			};
		case AppConstants.APP.AI.CREATE_AI_FAQS_SUCCESS:
			return {
				...state,
				faqs: {
					...state.faqs,
					isCreating: false,
					error: null,
					data: [...state.faqs.data, action.payload],
				},
			};
		case AppConstants.APP.AI.CREATE_AI_FAQS_ERROR:
			return {
				...state,
				faqs: {
					...state.faqs,
					isCreating: false,
					error: action.error,
				},
			};
		case AppConstants.APP.AI.UPDATE_AI_FAQS:
			return {
				...state,
				faqs: {
					...state.faqs,
					isUpdating: action.payload.id,
					error: null,
				},
			};
		case AppConstants.APP.AI.UPDATE_AI_FAQS_SUCCESS:
			return {
				...state,
				faqs: {
					...state.faqs,
					isUpdating: false,
					error: null,
					data: state.faqs.data.map((faq) =>
						faq.faq_id === action.payload.faq_id ? action.payload : faq,
					),
				},
			};
		case AppConstants.APP.AI.UPDATE_AI_FAQS_ERROR:
			return {
				...state,
				faqs: {
					...state.faqs,
					isUpdating: false,
					error: action.error,
				},
			};
		default:
			return state;
	}
}

export default AIReducer;
