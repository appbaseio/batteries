import { createSelector } from 'reselect';
import get from 'lodash/get';

const appName = (state, name) => name || get(state, '$getCurrentApp.name');
const rawMappings = state => get(state, '$getAppMappings.rawMappings');
const traversedMappings = state => get(state, '$getAppMappings.traversedMappings');
const appInfo = state => get(state, '$getAppInfo.apps');
const appMetrics = state => get(state, '$getAppMetrics.results');
const appAnalytics = state => get(state, '$getAppAnalytics.results');

const getCollectionByKey = (collection, key) => collection && collection[key];

const getRawMappingsByAppName = createSelector(rawMappings, appName, getCollectionByKey);
const getTraversedMappingsByAppName = createSelector(
	traversedMappings,
	appName,
	getCollectionByKey,
);
const getAppInfoByName = createSelector(appInfo, appName, getCollectionByKey);
const getAppMetricsByName = createSelector(appMetrics, appName, getCollectionByKey);
const getAppAnalyticsByName = createSelector(appAnalytics, appName, getCollectionByKey);

export {
	getRawMappingsByAppName,
	getTraversedMappingsByAppName,
	getAppInfoByName,
	getAppMetricsByName,
	getAppAnalyticsByName,
};
