import { createAction } from './utils';
import AppConstants from '../constants';
import { getSearchSettings, getAggsSettings, getResultSettings } from '../../utils/app';

// eslint-disable-next-line import/prefer-default-export
export function getSettings(name) {
	const searchPromise = getSearchSettings(name);
	const resultPromise = getResultSettings(name);
	const aggsPromise = getAggsSettings(name);

	const settingsPromise = Promise.all([searchPromise, resultPromise, aggsPromise]);
	return dispatch => {
		dispatch(createAction(AppConstants.APP.SEARCH_SETTINGS.GET));
		return settingsPromise
			.then(res => res.reduce((agg, item) => ({ ...agg, ...item }), {}))
			.then(res => {
				dispatch(
					createAction(AppConstants.APP.SEARCH_SETTINGS.GET_SUCCESS, res, null, {
						appName: name,
					}),
				);
			})
			.catch(error =>
				dispatch(createAction(AppConstants.APP.SEARCH_SETTINGS.GET_ERROR, null, error)),
			);
	};
}
