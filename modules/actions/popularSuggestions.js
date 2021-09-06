import { createAction } from './utils';
import AppConstants from '../constants';
import { getURL } from '../../../constants/config';
import { doGet, doPut } from '../../utils/requestService';

export function getPopularSuggestionsPreferences() {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.SUGGESTIONS.GET_PREFERENCES));
		const ACC_API = getURL();
		return doGet(`${ACC_API}/_popular_suggestions/preferences`)
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

export function savePopularSuggestionsPreferences(payload) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.SUGGESTIONS.SAVE_PREFERENCES));
		const ACC_API = getURL();
		return doPut(`${ACC_API}/_popular_suggestions/preferences`, payload)
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
