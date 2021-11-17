import { createAction } from './utils';
import AppConstants from '../constants';
import { getURL } from '../../../constants/config';
import { doGet, doPut } from '../../utils/requestService';

export function getSyncPreferences() {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.SYNC_PREFERENCES.GET_PREFERENCES));
		const ACC_API = getURL();
		return doGet(`${ACC_API}/_sync/preferences`)
			.then((res) =>
				dispatch(
					createAction(AppConstants.APP.SYNC_PREFERENCES.GET_PREFERENCES_SUCCESS, res, null),
				),
			)
			.catch((error) =>
				dispatch(
					createAction(AppConstants.APP.SYNC_PREFERENCES.GET_PREFERENCES_ERROR, null, error),
				),
			);
	};
}

export function saveSyncPreferences(payload) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.SYNC_PREFERENCES.SAVE_PREFERENCES));
		const ACC_API = getURL();
		return doPut(`${ACC_API}/_sync/preferences`, payload)
			.then((res) =>
                dispatch(createAction(AppConstants.APP.SYNC_PREFERENCES.SAVE_PREFERENCES_SUCCESS, res)),
            )
			.catch((error) =>
                dispatch(createAction(AppConstants.APP.SYNC_PREFERENCES.SAVE_PREFERENCES_ERROR, null, error)),
            );
	};
}
