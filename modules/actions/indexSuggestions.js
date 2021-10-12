import { createAction } from './utils';
import AppConstants from '../constants';
import { getURL } from '../../../constants/config';
import { doGet, doPut } from '../../utils/requestService';

export function getIndexSuggestionsPreferences() {

	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.INDEX_SUGGESTIONS.GET_PREFERENCES));
		const ACC_API = getURL();
		return doGet(`http://localhost:8000/_index_suggestions/preferences`)
			.then((res) =>
				dispatch(
					createAction(AppConstants.APP.INDEX_SUGGESTIONS.GET_PREFERENCES_SUCCESS, res, null),
				),
			)
			.catch((error) =>
				dispatch(
					createAction(AppConstants.APP.INDEX_SUGGESTIONS.GET_PREFERENCES_ERROR, null, error),
				),
			);
	};
}

export function saveIndexSuggestionsPreferences(payload) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.INDEX_SUGGESTIONS.SAVE_PREFERENCES));
		const ACC_API = getURL();
		return doPut(`http://localhost:8000/_index_suggestions/preferences`, payload)
			.then((res) =>
				dispatch(createAction(AppConstants.APP.INDEX_SUGGESTIONS.SAVE_PREFERENCES_SUCCESS, res)),
			)
			.catch((error) =>
				dispatch(
					createAction(AppConstants.APP.INDEX_SUGGESTIONS.SAVE_PREFERENCES_ERROR, null, error),
				),
			);
	};
}
