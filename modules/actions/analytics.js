import get from 'lodash/get';
import { getAnalytics } from '../../components/analytics/utils';
import { createAction } from './utils';
import AppConstants from '../constants';
/**
 * Get the app analytics
 * @param {string} name App name ( Optional )
 * @param {string} plan App Plan ( Optional )
 * @param {boolean} clickanalytics Whether to return click analytics data ( Optional )
 */
// eslint-disable-next-line
export function getAppAnalytics(name, plan, clickanalytics) {
	return (dispatch, getState) => {
		const appName = name || get(getState(), '$getCurrentApp.name', 'default');
		const appPlan = plan || get(getState(), '$getAppPlan.plan', 'default');
		dispatch(createAction(AppConstants.APP.GET_ANALYTICS));
		return getAnalytics(appName, appPlan, clickanalytics)
			.then(res => dispatch(
					createAction(AppConstants.APP.GET_ANALYTICS_SUCCESS, res, undefined, {
						appName,
					}),
				))
			.catch(error => dispatch(createAction(AppConstants.APP.GET_ANALYTICS_ERROR, null, error)));
	};
}
