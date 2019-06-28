import { createSelector } from 'reselect';
import get from 'lodash/get';

const appName = (state, name) => name || get(state, '$getCurrentApp.name');
const rawMappings = state => get(state, '$getAppMappings.rawMappings');
const traversedMappings = state => get(state, '$getAppMappings.traversedMappings');
const appInfo = state => get(state, '$getAppInfo.apps');
const appPlan = state => get(state, '$getAppPlan.results');
const appMetrics = state => get(state, '$getAppMetrics.results');
const appAnalytics = state => get(state, '$getAppAnalytics.results');
const appPermission = state => get(state, '$getAppPermissions.results');
const appTemplates = state => get(state, '$getAppTemplates.results');
const appSearchLatency = state => get(state, '$getAppSearchLatency.results');
const appGeoDistribution = state => get(state, '$getAppGeoDistribution.results');
const appRequestDistribution = state => get(state, '$getAppRequestDistribution.results');
const appAnalyticsSummary = state => get(state, '$getAppAnalyticsSummary.results');
const appPublicKey = state => get(state, '$getAppPublicKey.results');

const getCollectionByKey = (collection, key) => collection && collection[key];

const getRawMappingsByAppName = createSelector(
	rawMappings,
	appName,
	getCollectionByKey,
);
const getTraversedMappingsByAppName = createSelector(
	traversedMappings,
	appName,
	getCollectionByKey,
);
const getAppInfoByName = createSelector(
	appInfo,
	appName,
	getCollectionByKey,
);
const getAppPlanByName = createSelector(
	appPlan,
	appName,
	getCollectionByKey,
);
const getAppMetricsByName = createSelector(
	appMetrics,
	appName,
	getCollectionByKey,
);
const getAppAnalyticsByName = createSelector(
	appAnalytics,
	appName,
	getCollectionByKey,
);
const getAppPermissionsByName = createSelector(
	appPermission,
	appName,
	getCollectionByKey,
);
const getAppTemplatesByName = createSelector(
	appTemplates,
	appName,
	getCollectionByKey,
);
const getAppSearchLatencyByName = createSelector(
	appSearchLatency,
	appName,
	getCollectionByKey,
);
const getAppGeoDistributionByName = createSelector(
	appGeoDistribution,
	appName,
	getCollectionByKey,
);
const getAppRequestDistributionByName = createSelector(
	appRequestDistribution,
	appName,
	getCollectionByKey,
);
const getAppAnalyticsSummaryByName = createSelector(
	appAnalyticsSummary,
	appName,
	getCollectionByKey,
);

const getAppPublicKey = createSelector(
	appPublicKey,
	appName,
	getCollectionByKey,
);
export {
	getRawMappingsByAppName,
	getTraversedMappingsByAppName,
	getAppSearchLatencyByName,
	getAppGeoDistributionByName,
	getAppAnalyticsSummaryByName,
	getAppRequestDistributionByName,
	getAppInfoByName,
	getAppMetricsByName,
	getAppAnalyticsByName,
	getAppPermissionsByName,
	getAppPlanByName,
	getAppPublicKey,
	getAppTemplatesByName,
};
