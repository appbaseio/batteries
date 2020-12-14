import { createAction } from './utils';
import AppConstants from '../constants';
import { getURL } from '../../../constants/config';
import { doGet, doPut } from '../../utils/requestService';

export function getSuggestionsPreferences() {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.SUGGESTIONS.GET_PREFERENCES));
		const ACC_API = getURL();
		return doGet(`${ACC_API}/_suggestions/preferences`)
			.then((res) =>
				dispatch(
					createAction(AppConstants.APP.SUGGESTIONS.GET_PREFERENCES_SUCCESS, res, null),
				),
			)
			.catch((error) =>
				dispatch(
					createAction(AppConstants.APP.SUGGESTIONS.GET_PREFERENCES_ERROR, null, error),
				),
			);
	};
}

export function saveSuggestionsPreferences(payload) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.SUGGESTIONS.SAVE_PREFERENCES));
		const ACC_API = getURL();
		return doPut(`${ACC_API}/_suggestions/preferences`, payload)
			.then((res) =>
				dispatch(createAction(AppConstants.APP.SUGGESTIONS.SAVE_PREFERENCES_SUCCESS, res)),
			)
			.catch((error) =>
				dispatch(
					createAction(AppConstants.APP.SUGGESTIONS.SAVE_PREFERENCES_ERROR, null, error),
				),
			);
	};
}
