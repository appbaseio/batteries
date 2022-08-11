import { createAction } from './utils';
import AppConstants from '../constants';
import {
	createFeaturedSuggestions,
	deleteFeaturedSuggestions,
	fetchFeaturedSuggestions,
} from '../../utils/app';

export function saveFeaturedSuggestions(id, payload) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.FEATURED_SUGGESTIONS.UPDATE, { ...payload }));
		return createFeaturedSuggestions(id, payload)
			.then((data) =>
				dispatch(
					createAction(
						AppConstants.APP.FEATURED_SUGGESTIONS.UPDATE_SUCCESS,
						{ id, ...data },
						null,
					),
				),
			)
			.catch((error) =>
				dispatch(
					createAction(AppConstants.APP.FEATURED_SUGGESTIONS.UPDATE_ERROR, null, error),
				),
			);
	};
}

export function getFeaturedSuggestions(id) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.FEATURED_SUGGESTIONS.GET));
		return fetchFeaturedSuggestions(id)
			.then((res) => {
				return dispatch(
					createAction(
						AppConstants.APP.FEATURED_SUGGESTIONS.GET_SUCCESS,
						{ id, data: res },
						null,
					),
				);
			})
			.catch((error) => {
				dispatch(
					createAction(AppConstants.APP.FEATURED_SUGGESTIONS.GET_ERROR, null, error),
				);
			});
	};
}

export function removeFeaturedSuggestions(id) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.FEATURED_SUGGESTIONS.DELETE, { id }));
		return deleteFeaturedSuggestions(id)
			.then(() => {
				return dispatch(
					createAction(
						AppConstants.APP.FEATURED_SUGGESTIONS.DELETE_SUCCESS,
						{ id },
						null,
					),
				);
			})
			.catch((error) =>
				dispatch(
					createAction(AppConstants.APP.FEATURED_SUGGESTIONS.DELETE_ERROR, { id }, error),
				),
			);
	};
}
