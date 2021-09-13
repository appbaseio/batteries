import { createAction } from './utils';
import AppConstants from '../constants';
import { getURL } from '../../../constants/config';
import { doGet, doPut } from '../../utils/requestService';

const indexRes = {
	"indices": ['airbeds-test-app'],
	"showDistinctSuggestions": false, // true / false
	"enablePredictiveSuggestions": true, // true / false
	"maxPredictedWords": 2,  // Max predicted words either as a suffix or prefix
	"applyStopwords": true,
	"customStopwords": ['the','a'], // An array of string of custom stopwords, refer to language settings (text area with csv)
	"enableSynonyms": true, // true / false
	"categoryField": 'body_html',   // single select dropdown
	"size": 5, // number input, [0, 100]
	"includeFields": ['body_html','image'],  // refer to result settings
	"excludeFields": ['handle'],  // refer to result settings
	"customQuery": "efe",    // Specify a stored query id to execute a custom query, use GET /_storedqueries
}

export function getIndexSuggestionsPreferences() {

	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.INDEX_SUGGESTIONS.GET_PREFERENCES));
		const ACC_API = getURL();
		return doGet(`${ACC_API}/_index_suggestions/preferences`)
			.then((res) =>
				dispatch(
					createAction(AppConstants.APP.INDEX_SUGGESTIONS.GET_PREFERENCES_SUCCESS, indexRes, null),
				),
			)
			.catch((error) =>
				dispatch(
					createAction(AppConstants.APP.INDEX_SUGGESTIONS.GET_PREFERENCES_ERROR, null, error),
				),
				// dispatch(
				// 	createAction(AppConstants.APP.INDEX_SUGGESTIONS.GET_PREFERENCES_SUCCESS, indexRes, null),
				// ),
			);
	};
}

export function saveIndexSuggestionsPreferences(payload) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.INDEX_SUGGESTIONS.SAVE_PREFERENCES));
		const ACC_API = getURL();
		return doPut(`${ACC_API}/_index_suggestions/preferences`, payload)
			.then((res) => {
                console.log(res);
            }
				// dispatch(createAction(AppConstants.APP.INDEX_SUGGESTIONS.SAVE_PREFERENCES_SUCCESS, res)),
			)
			.catch((error) => {
                console.error(err)
            }
				// dispatch(
                //     console.error(error)
				// 	// createAction(AppConstants.APP.INDEX_SUGGESTIONS.SAVE_PREFERENCES_ERROR, null, error),
				// ),
			);
	};
}
