import { createAction } from './utils';
import AppConstants from '../constants';
import { deleteAIFAQAPI, getAIFAQsAPI, putAIFAQAPI } from '../../utils/app';

export function getAIFAQs() {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.AI.GET_AI_FAQS));
		return getAIFAQsAPI()
			.then((res) => {
				return dispatch(createAction(AppConstants.APP.AI.GET_AI_FAQS_SUCCESS, res, null));
			})
			.catch((error) => {
				return dispatch(createAction(AppConstants.APP.AI.GET_AI_FAQS_ERROR, null, error));
			});
	};
}

export function putAIFAQ(id, payload) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.AI.UPDATE_AI_FAQS));
		return putAIFAQAPI(id, payload)
			.then((res) => {
				return dispatch(
					createAction(AppConstants.APP.AI.UPDATE_AI_FAQS_SUCCESS, res, null),
				);
			})
			.catch((error) => {
				return dispatch(
					createAction(AppConstants.APP.AI.UPDATE_AI_FAQS_ERROR, null, error),
				);
			});
	};
}

export function removeAIFAQ(id) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.AI.DELETE_AI_FAQS, { id }));
		return deleteAIFAQAPI(id)
			.then((res) => {
				return dispatch(
					createAction(AppConstants.APP.AI.DELETE_AI_FAQS_SUCCESS, res, null),
				);
			})
			.catch((error) => {
				return dispatch(
					createAction(AppConstants.APP.AI.DELETE_AI_FAQS_ERROR, null, error),
				);
			});
	};
}
