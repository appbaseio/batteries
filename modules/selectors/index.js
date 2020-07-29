import { createSelector } from 'reselect';
import get from 'lodash/get';

const appName = (state, name) => name || get(state, '$getCurrentApp.name') || 'default';
const rawMappings = (state) => get(state, '$getAppMappings.rawMappings');
const traversedMappings = (state) => get(state, '$getAppMappings.traversedMappings');
const appPlan = (state) => get(state, '$getAppPlan.results');
const appAnalytics = (state) => get(state, '$getAppAnalytics.results');
const appPermission = (state) => get(state, '$getAppPermissions.results');
const appSearchLatency = (state) => get(state, '$getAppSearchLatency.results');
const appGeoDistribution = (state) => get(state, '$getAppGeoDistribution.results');
const appRequestDistribution = (state) => get(state, '$getAppRequestDistribution.results');
const appAnalyticsSummary = (state) => get(state, '$getAppAnalyticsSummary.results');
const appPublicKey = (state) => get(state, '$getAppPublicKey.results');
const appFunctions = (state) => get(state, '$getAppFunctions.results');
const appSearchSettings = (state) => get(state, '$getAppSettings.results');
const appRules = (state) => get(state, '$getAppRules.results');
const appAnalyticsInsights = (state) => get(state, '$getAppAnalyticsInsights.results', {});

const getCollectionByKey = (collection, key) => collection && collection[key];

const getRawMappingsByAppName = createSelector(rawMappings, appName, getCollectionByKey);
const getTraversedMappingsByAppName = createSelector(
	traversedMappings,
	appName,
	getCollectionByKey,
);
const getAppPlanByName = createSelector(appPlan, appName, (collection) => collection);
const getAppAnalyticsByName = createSelector(appAnalytics, appName, getCollectionByKey);
const getAppPermissionsByName = createSelector(appPermission, appName, getCollectionByKey);
const getAppSearchLatencyByName = createSelector(appSearchLatency, appName, getCollectionByKey);
const getAppGeoDistributionByName = createSelector(appGeoDistribution, appName, getCollectionByKey);
const getAppAnalyticsInsightsByName = createSelector(
	appAnalyticsInsights,
	appName,
	getCollectionByKey,
);
const getAppAnalyticsSummaryByName = createSelector(
	appAnalyticsSummary,
	appName,
	getCollectionByKey,
);
const getAppRequestDistributionByName = createSelector(
	appRequestDistribution,
	appName,
	getCollectionByKey,
);

const getAppPublicKey = createSelector(appPublicKey, appName, getCollectionByKey);
const getAppFunctions = createSelector(appFunctions, appName, getCollectionByKey);
const getAppSettings = createSelector(appSearchSettings, appName, getCollectionByKey);
const getAppRules = createSelector(appRules, appName, getCollectionByKey);
export {
	getRawMappingsByAppName,
	getTraversedMappingsByAppName,
	getAppSearchLatencyByName,
	getAppGeoDistributionByName,
	getAppRequestDistributionByName,
	getAppAnalyticsSummaryByName,
	getAppAnalyticsByName,
	getAppPermissionsByName,
	getAppPlanByName,
	getAppPublicKey,
	getAppFunctions,
	getAppSettings,
	getAppRules,
	getAppAnalyticsInsightsByName,
};
