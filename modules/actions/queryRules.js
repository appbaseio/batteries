import { createAction } from './utils';
import AppConstants from '../constants';
import { getURL } from '../../../constants/config';
import { doGet } from '../../utils/requestService';

export function getUsageStats() {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.USAGE_STATS.GET));
		const ACC_API = getURL();
		return doGet(`${ACC_API}/_analytics/rules/usage`)
			.then((res) => {
                const usageStats = {};

                res.rules.forEach(rule => {
                    usageStats[rule.key] = { ...rule };
                });

				dispatch(
					createAction(AppConstants.APP.USAGE_STATS.GET_SUCCESS, usageStats, null),
				);
            })
			.catch((error) =>
				dispatch(
					createAction(AppConstants.APP.USAGE_STATS.GET_ERROR, null, error),
				),
			);
	};
}
