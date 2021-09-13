import { createAction } from './utils';
import AppConstants from '../constants';
import { getURL } from '../../../constants/config';
import { doGet, doPut } from '../../utils/requestService';

const indexRes = {
    applyStopwords: true,
    customStopwords: ['a','to'],
    maxPredictedWords: 5,
    customQuery: '',
    includeFields: ['*'],
    excludeFields: [],
    categoryField: [],
    showDistinctSuggestions: false,
    enablePredictiveSuggestions: false,
    enableSynonyms: false,
    size: 5,
    indices: ['*'],
}

export function getIndexSuggestionsPreferences() {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.SUGGESTIONS.GET_PREFERENCES));
		const ACC_API = getURL();
		return doGet(`${ACC_API}/_index_suggestions/preferences`)
			.then((res) =>
				dispatch(
					createAction(AppConstants.APP.SUGGESTIONS.GET_PREFERENCES_SUCCESS, res, null),
				),
			)
			.catch((error) =>
				// dispatch(
				// 	createAction(AppConstants.APP.SUGGESTIONS.GET_PREFERENCES_ERROR, null, error),
				// ),
                dispatch(
					createAction(AppConstants.APP.SUGGESTIONS.GET_PREFERENCES_SUCCESS, indexRes, null),
				),
			);
	};
}

export function saveIndexSuggestionsPreferences(payload) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.SUGGESTIONS.SAVE_PREFERENCES));
		const ACC_API = getURL();
		return doPut(`${ACC_API}/_index_suggestions/preferences`, payload)
			.then((res) => {
                console.log(res);
            }

				// dispatch(createAction(AppConstants.APP.SUGGESTIONS.SAVE_PREFERENCES_SUCCESS, res)),
			)
			.catch((error) => {
                console.error(err)
            }
				// dispatch(
                //     console.error(error)
				// 	// createAction(AppConstants.APP.SUGGESTIONS.SAVE_PREFERENCES_ERROR, null, error),
				// ),
			);
	};
}
