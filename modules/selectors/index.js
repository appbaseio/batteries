import { createSelector } from 'reselect';
import get from 'lodash/get';

const appName = (state, name) => name || get(state, '$getCurrentApp.name') || 'default';
const preferenceId = (state, id) => {
	return id;
};
const rawMappings = (state) => get(state, '$getAppMappings.rawMappings');
const traversedMappings = (state) => get(state, '$getAppMappings.traversedMappings');
const appPlan = (state) => get(state, '$getAppPlan.results');
const appAnalytics = (state) => get(state, '$getAppAnalytics.results');
const appPermission = (state) => get(state, '$getAppPermissions.results');
const appSearchLatency = (state) => get(state, '$getAppSearchLatency.results');
const appGeoDistribution = (state) => get(state, '$getAppGeoDistribution.results');
const appRequestDistribution = (state) => get(state, '$getAppRequestDistribution.results');
const appQueryOverview = (state) => get(state, '$getAppQueryOverview.results');
const appPopularSearches = (state) => get(state, '$getAppPopularSearches.results');
const appAnalyticsSummary = (state) => get(state, '$getAppAnalyticsSummary.results');
const appPublicKey = (state) => get(state, '$getAppPublicKey.results');
const appFunctions = (state) => get(state, '$getAppFunctions.results');
const appSearchSettings = (state) => get(state, '$getAppSettings.results');
const appRules = (state) => get(state, '$getAppRules.results');
const searchPreferences = (state) => get(state, '$getSearchPreferences.results');
const recommendationPreferences = (state) => get(state, '$getRecommendationsPreferences.results');
const appAnalyticsInsights = (state) => get(state, '$getAppAnalyticsInsights.results', {});
const searchPreferencesN = (state) => get(state, '$getSearchPreferencesN.results', []);
const recommendationPreferencesN = (state) =>
	get(state, '$getRecommendationsPreferencesN.results', []);
const getCollectionByKey = (collection, key) => collection && collection[key];

const getPreferenceById = (collection = [], id) => {
	return collection.find((o) => o.id === id);
};
const calculateRequestDistribution = (collection, key) => {
	if (collection) {
		const rawRes = collection[key];
		const countRequestByCode = (code) => {
			let count = 0;
			const requestDistribution = get(rawRes, 'request_distribution');
			if (requestDistribution) {
				requestDistribution.forEach((r) => {
					r.buckets.forEach((i) => {
						if (i.key === code) {
							count += i.count;
						}
					});
				});
			}
			return count;
		};
		return {
			...rawRes,
			total_500: countRequestByCode(500),
			total_429: countRequestByCode(429),
		};
	}
	return null;
};

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
	calculateRequestDistribution,
);
const getAppQueryOverviewByName = createSelector(appQueryOverview, appName, getCollectionByKey);
const getAppPopularSearchesByName = createSelector(appPopularSearches, appName, getCollectionByKey);

const getAppPublicKey = createSelector(appPublicKey, appName, getCollectionByKey);
const getAppFunctions = createSelector(appFunctions, appName, getCollectionByKey);
const getAppSettings = createSelector(appSearchSettings, appName, getCollectionByKey);
const getAppRules = createSelector(appRules, appName, getCollectionByKey);
const getSearchPreferencesByName = createSelector(searchPreferences, appName, getCollectionByKey);
const getRecommendationsPreferencesByName = createSelector(
	recommendationPreferences,
	appName,
	getCollectionByKey,
);
const getSearchPreferenceById = createSelector(searchPreferencesN, preferenceId, getPreferenceById);
const getRecommendationPreferenceById = createSelector(
	recommendationPreferencesN,
	preferenceId,
	getPreferenceById,
);
export {
	getSearchPreferenceById,
	getRecommendationPreferenceById,
	getSearchPreferencesByName,
	getRecommendationsPreferencesByName,
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
	getAppQueryOverviewByName,
	getAppPopularSearchesByName,
};
