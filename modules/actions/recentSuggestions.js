import { createAction } from './utils';
import AppConstants from '../constants';
import { getURL } from '../../../constants/config';
import { doGet, doPut } from '../../utils/requestService';

const recentRes = {
	"indices": ['airbeds-test-app'], // `index pattern` -> Supports a single index, comma separated indexes or wildcard indexes.
	"minHits": 1,   // Only return recent suggestions if the hits returned are > 0.
	"size": 5 // number input, [0, 100]
  }

export function getRecentSuggestionsPreferences() {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.RECENT_SUGGESTIONS.GET_PREFERENCES));
		const ACC_API = getURL();
		return doGet(`http://localhost:8000/_recent_suggestions/preferences`)
			.then((res) =>
				dispatch(
					createAction(AppConstants.APP.RECENT_SUGGESTIONS.GET_PREFERENCES_SUCCESS, res, null),
				),
			)
			.catch((error) =>
				dispatch(
					createAction(AppConstants.APP.RECENT_SUGGESTIONS.GET_PREFERENCES_SUCCESS, recentRes, null),
				),
			);
	};
}

export function saveRecentSuggestionsPreferences(payload) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.RECENT_SUGGESTIONS.SAVE_PREFERENCES));
		const ACC_API = getURL();
		return doPut(`http://localhost:8000/_recent_suggestions/preferences`, payload)
			.then((res) =>
				dispatch(createAction(AppConstants.APP.RECENT_SUGGESTIONS.SAVE_PREFERENCES_SUCCESS, res)),
			)
			.catch((error) =>
				dispatch(
					createAction(AppConstants.APP.RECENT_SUGGESTIONS.SAVE_PREFERENCES_ERROR, null, error),
				),
			);
	};
}
