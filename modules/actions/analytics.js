import get from 'lodash/get';
import {
	getAnalytics,
	getGeoDistribution,
	getSearchLatency,
	getAnalyticsSummary,
	getRequestDistribution,
	getAnalyticsInsights,
	updateAnalyticsInsights,
	getQueryOverview,
	getPopularSearches,
} from '../../components/analytics/utils';
import { createAction } from './utils';
import AppConstants from '../constants';
/**
 * Get the app analytics
 * @param {string} name App name ( Optional )
 * @param {string} plan App Plan ( Optional )
 * @param {boolean} clickanalytics Whether to return click analytics data ( Optional )
 */
export function getAppAnalytics(name, filterId) {
	return (dispatch, getState) => {
		const appName = name || get(getState(), '$getCurrentApp.name', 'default');
		const filters = filterId ? get(getState(), `$getSelectedFilters.${filterId}`, {}) : null;
		dispatch(createAction(AppConstants.APP.ANALYTICS.GET));
		return getAnalytics(appName, filters)
			.then((res) =>
				dispatch(
					createAction(AppConstants.APP.ANALYTICS.GET_SUCCESS, res, undefined, {
						appName,
					}),
				),
			)
			.catch((error) =>
				dispatch(createAction(AppConstants.APP.ANALYTICS.GET_ERROR, null, error)),
			);
	};
}
export function getAppAnalyticsSummary(name, filterId) {
	return (dispatch, getState) => {
		const appName = name || get(getState(), '$getCurrentApp.name', 'default');
		const filters = filterId ? get(getState(), `$getSelectedFilters.${filterId}`, {}) : null;
		dispatch(createAction(AppConstants.APP.ANALYTICS.GET_SUMMARY));
		return getAnalyticsSummary(appName, filters)
			.then((res) =>
				dispatch(
					createAction(AppConstants.APP.ANALYTICS.GET_SUMMARY_SUCCESS, res, undefined, {
						appName,
					}),
				),
			)
			.catch((error) =>
				dispatch(createAction(AppConstants.APP.ANALYTICS.GET_SUMMARY_ERROR, null, error)),
			);
	};
}

export function getAppSearchLatency(name, filterId) {
	return (dispatch, getState) => {
		const appName = name || get(getState(), '$getCurrentApp.name', 'default');
		const filters = filterId ? get(getState(), `$getSelectedFilters.${filterId}`, {}) : null;
		dispatch(createAction(AppConstants.APP.ANALYTICS.GET_LATENCY));
		return getSearchLatency(appName, filters)
			.then((res) =>
				dispatch(
					createAction(AppConstants.APP.ANALYTICS.GET_LATENCY_SUCCESS, res, undefined, {
						appName,
					}),
				),
			)
			.catch((error) =>
				dispatch(createAction(AppConstants.APP.ANALYTICS.GET_LATENCY_ERROR, null, error)),
			);
	};
}

const getFilters = (state, filterId) => {
	if (Array.isArray(filterId)) {
		return filterId.reduce(
			(acc, curr) => ({ ...get(state, `$getSelectedFilters.${curr}`, {}), ...acc }),
			{},
		);
	}
	if (filterId) {
		return get(state, `$getSelectedFilters.${filterId}`, {});
	}
	return null;
};

export function getAppQueryOverview(name, filterId, query) {
	return (dispatch, getState) => {
		const appName = name || get(getState(), '$getCurrentApp.name', 'default');
		const filters = getFilters(getState(), filterId);
		dispatch(createAction(AppConstants.APP.ANALYTICS.GET_QUERY_VOLUME));
		return getQueryOverview(appName, filters, query)
			.then((res) =>
				dispatch(
					createAction(
						AppConstants.APP.ANALYTICS.GET_QUERY_VOLUME_SUCCESS,
						res,
						undefined,
						{
							appName,
						},
					),
				),
			)
			.catch((error) =>
				dispatch(
					createAction(AppConstants.APP.ANALYTICS.GET_QUERY_VOLUME_ERROR, null, error),
				),
			);
	};
}

export function getAppRequestDistribution(name, filterId) {
	return (dispatch, getState) => {
		const appName = name || get(getState(), '$getCurrentApp.name', 'default');
		const filters = filterId ? get(getState(), `$getSelectedFilters.${filterId}`, {}) : null;
		dispatch(createAction(AppConstants.APP.ANALYTICS.GET_REQUEST_DISTRIBUTION));
		return getRequestDistribution(appName, filters)
			.then((res) =>
				dispatch(
					createAction(
						AppConstants.APP.ANALYTICS.GET_REQUEST_DISTRIBUTION_SUCCESS,
						res,
						undefined,
						{
							appName,
						},
					),
				),
			)
			.catch((error) =>
				dispatch(
					createAction(
						AppConstants.APP.ANALYTICS.GET_REQUEST_DISTRIBUTION_ERROR,
						null,
						error,
					),
				),
			);
	};
}

export function getAppPopularSearches(name, clickAnalytics, size, filterId) {
	return (dispatch, getState) => {
		const appName = name || get(getState(), '$getCurrentApp.name', 'default');
		const filters = filterId ? get(getState(), `$getSelectedFilters.${filterId}`, {}) : null;
		dispatch(createAction(AppConstants.APP.ANALYTICS.GET_POPULAR_SEARCHES));
		return getPopularSearches(appName, clickAnalytics, size, filters)
			.then((res) =>
				dispatch(
					createAction(
						AppConstants.APP.ANALYTICS.GET_POPULAR_SEARCHES_SUCCESS,
						res,
						undefined,
						{
							appName,
						},
					),
				),
			)
			.catch((error) =>
				dispatch(
					createAction(
						AppConstants.APP.ANALYTICS.GET_POPULAR_SEARCHES_ERROR,
						null,
						error,
					),
				),
			);
	};
}

export function getAppGeoDistribution(name, filterId) {
	return (dispatch, getState) => {
		const appName = name || get(getState(), '$getCurrentApp.name', 'default');
		const filters = filterId ? get(getState(), `$getSelectedFilters.${filterId}`, {}) : null;
		dispatch(createAction(AppConstants.APP.ANALYTICS.GET_GEO_DISTRIBUTION));
		return getGeoDistribution(appName, filters)
			.then((res) =>
				dispatch(
					createAction(
						AppConstants.APP.ANALYTICS.GET_GEO_DISTRIBUTION_SUCCESS,
						res,
						undefined,
						{
							appName,
						},
					),
				),
			)
			.catch((error) =>
				dispatch(
					createAction(
						AppConstants.APP.ANALYTICS.GET_GEO_DISTRIBUTION_ERROR,
						null,
						error,
					),
				),
			);
	};
}

export function getAppAnalyticsInsights(name) {
	return (dispatch, getState) => {
		const appName = name || get(getState(), '$getCurrentApp.name', 'default');
		dispatch(createAction(AppConstants.APP.ANALYTICS.GET_INSIGHTS));
		return getAnalyticsInsights(appName)
			.then((res) => {
				if (res.status === 404) {
					throw new Error('404: Insights route Not Found');
				}
				if (res.status >= 400) {
					throw new Error(res.error);
				} else {
					dispatch(
						createAction(
							AppConstants.APP.ANALYTICS.GET_INSIGHTS_SUCCESS,
							res,
							undefined,
							{
								appName,
							},
						),
					);
				}
			})
			.catch((error) =>
				dispatch(createAction(AppConstants.APP.ANALYTICS.GET_INSIGHTS_ERROR, null, error)),
			);
	};
}

/**
 * Update the analytics insights status
 * @param {Object} insightData
 * @param {string} insightData.id - Insight Id
 * @param {string} insightData.nextStatus - This is the status in which we want to update the insight.
 * @param {string} insightData.currentStatus - This is the current status of Insight; used in reducers for updating the data of the status.
 */
export function updateInsightStatus({ id, currentStatus, nextStatus }) {
	return (dispatch, getState) => {
		const appName = get(getState(), '$getCurrentApp.name', 'default');
		dispatch(
			createAction(AppConstants.APP.ANALYTICS.UPDATE_INSIGHTS_STATUS, null, null, { id }),
		);
		return updateAnalyticsInsights({ id, status: nextStatus, appName })
			.then((res) =>
				dispatch(
					createAction(
						AppConstants.APP.ANALYTICS.UPDATE_INSIGHTS_STATUS_SUCCESS,
						res,
						undefined,
						{
							appName,
							currentStatus,
							nextStatus,
							id,
						},
					),
				),
			)
			.catch((error) =>
				dispatch(
					createAction(
						AppConstants.APP.ANALYTICS.UPDATE_INSIGHTS_STATUS_ERROR,
						null,
						error,
						{
							appName,
							id,
							currentStatus,
							nextStatus,
						},
					),
				),
			);
	};
}
