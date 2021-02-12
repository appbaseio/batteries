import AppConstants from '../constants';
import getAppMappings from './getAppMappings';
import getCurrentApp from './getCurrentApp';
import getSearchState from './getSearchState';
import getSelectedFilters from './getSelectedFilters';
import createRequestReducer from './request';
import {
	computeAppPlanState,
	computeAppPermissionState,
	computeStateByAppName,
	computePlan,
} from './utils';
import getAppFunction from './getAppFunction';
import privateRegistries from './getPrivateRegistry';
import getAppSettings from './getAppSettings';
import getAppRules from './getAppRules';
import getAppAnalyticsInsights from './getAnalyticsInsights';
import localRelevancyReducer from './localRelevancy';
import localMappingReducer from './localMapping';
import getAdvanceSearchState from './getAdvanceSearchState';
import reIndexingTasks from './reIndexingTasks';
import monitoring from './monitoring';

export default {
	$getAppMappings: getAppMappings,
	$getSearchState: getSearchState,
	$getSelectedFilters: getSelectedFilters,
	$getAppPermissions: createRequestReducer(
		AppConstants.APP.PERMISSION.GET,
		AppConstants.APP.PERMISSION.GET_SUCCESS,
		AppConstants.APP.PERMISSION.GET_ERROR,
		computeAppPermissionState,
	),
	$transferAppOwnership: createRequestReducer(
		AppConstants.APP.TRANSFER_OWNERSHIP,
		AppConstants.APP.TRANSFER_OWNERSHIP_SUCCESS,
		AppConstants.APP.TRANSFER_OWNERSHIP_ERROR,
	),
	$getAppPlan: createRequestReducer(
		AppConstants.APP.GET_PLAN,
		AppConstants.APP.GET_PLAN_SUCCESS,
		AppConstants.APP.GET_PLAN_ERROR,
		computeAppPlanState,
	),
	$getFilterLabels: createRequestReducer(
		AppConstants.APP.FILTER.GET_LABEL,
		AppConstants.APP.FILTER.GET_LABEL_SUCCESS,
		AppConstants.APP.FILTER.GET_LABEL_ERROR,
	),
	$getFilterValues: createRequestReducer(
		AppConstants.APP.FILTER.GET_VALUE,
		AppConstants.APP.FILTER.GET_VALUE_SUCCESS,
		AppConstants.APP.FILTER.GET_VALUE_ERROR,
		computeStateByAppName,
	),
	$getClusterUsers: createRequestReducer(
		AppConstants.APP.USERS.GET,
		AppConstants.APP.USERS.GET_SUCCESS,
		AppConstants.APP.USERS.GET_ERROR,
	),
	$createClusterUser: createRequestReducer(
		AppConstants.APP.USERS.CREATE_USER,
		AppConstants.APP.USERS.CREATE_USER_SUCCESS,
		AppConstants.APP.USERS.CREATE_USER_ERROR,
	),
	$updateClusterUser: createRequestReducer(
		AppConstants.APP.USERS.EDIT_USER,
		AppConstants.APP.USERS.EDIT_USER_SUCCESS,
		AppConstants.APP.USERS.EDIT_USER_ERROR,
	),
	$deleteClusterUser: createRequestReducer(
		AppConstants.APP.USERS.DELETE_USER,
		AppConstants.APP.USERS.DELETE_USER_SUCCESS,
		AppConstants.APP.USERS.DELETE_USER_ERROR,
	),
	$getUserPlan: createRequestReducer(
		AppConstants.ACCOUNT.CHECK_USER_PLAN.GET,
		AppConstants.ACCOUNT.CHECK_USER_PLAN.GET_SUCCESS,
		AppConstants.ACCOUNT.CHECK_USER_PLAN.GET_ERROR,
		computePlan,
	),
	$updateUser: createRequestReducer(
		AppConstants.ACCOUNT.UPDATE_USER,
		AppConstants.ACCOUNT.UPDATE_USER_SUCCESS,
		AppConstants.ACCOUNT.UPDATE_USER_ERROR,
	),
	$getAppTemplates: createRequestReducer(
		AppConstants.APP.TEMPLATES.GET_ALL,
		AppConstants.APP.TEMPLATES.GET_ALL_SUCCESS,
		AppConstants.APP.TEMPLATES.GET_ALL_ERROR,
	),
	$getAppTemplate: createRequestReducer(
		AppConstants.APP.TEMPLATES.GET,
		AppConstants.APP.TEMPLATES.GET_SUCCESS,
		AppConstants.APP.TEMPLATES.GET_ERROR,
	),
	$saveAppTemplate: createRequestReducer(
		AppConstants.APP.TEMPLATES.UPDATE,
		AppConstants.APP.TEMPLATES.UPDATE_SUCCESS,
		AppConstants.APP.TEMPLATES.UPDATE_ERROR,
	),
	$deleteAppTemplate: createRequestReducer(
		AppConstants.APP.TEMPLATES.DELETE,
		AppConstants.APP.TEMPLATES.DELETE_SUCCESS,
		AppConstants.APP.TEMPLATES.DELETE_ERROR,
	),
	$getSuggestionsPreferences: createRequestReducer(
		AppConstants.APP.SUGGESTIONS.GET_PREFERENCES,
		AppConstants.APP.SUGGESTIONS.GET_PREFERENCES_SUCCESS,
		AppConstants.APP.SUGGESTIONS.GET_PREFERENCES_ERROR,
	),
	$saveSuggestionsPreferences: createRequestReducer(
		AppConstants.APP.SUGGESTIONS.SAVE_PREFERENCES,
		AppConstants.APP.SUGGESTIONS.SAVE_PREFERENCES_SUCCESS,
		AppConstants.APP.SUGGESTIONS.SAVE_PREFERENCES_ERROR,
	),
	$validateAppTemplate: createRequestReducer(
		AppConstants.APP.TEMPLATES.VALIDATE,
		AppConstants.APP.TEMPLATES.VALIDATE_SUCCESS,
		AppConstants.APP.TEMPLATES.VALIDATE_ERROR,
		undefined,
		undefined,
		AppConstants.APP.TEMPLATES.CLEAR_VALIDATE,
	),
	$getSearchPreferences: createRequestReducer(
		AppConstants.APP.UI_BUILDER.SEARCH_PREFERENCES.GET,
		AppConstants.APP.UI_BUILDER.SEARCH_PREFERENCES.GET_SUCCESS,
		AppConstants.APP.UI_BUILDER.SEARCH_PREFERENCES.GET_ERROR,
		computeStateByAppName,
	),
	$saveSearchPreferences: createRequestReducer(
		AppConstants.APP.UI_BUILDER.SEARCH_PREFERENCES.SAVE,
		AppConstants.APP.UI_BUILDER.SEARCH_PREFERENCES.SAVE_SUCCESS,
		AppConstants.APP.UI_BUILDER.SEARCH_PREFERENCES.SAVE_ERROR,
		computeStateByAppName,
	),
	$deleteSearchPreferences: createRequestReducer(
		AppConstants.APP.UI_BUILDER.SEARCH_PREFERENCES.DELETE,
		AppConstants.APP.UI_BUILDER.SEARCH_PREFERENCES.DELETE_SUCCESS,
		AppConstants.APP.UI_BUILDER.SEARCH_PREFERENCES.DELETE_ERROR,
		computeStateByAppName,
	),
	$getRecommendationsPreferences: createRequestReducer(
		AppConstants.APP.UI_BUILDER.RECOMMENDATION_PREFERENCES.GET,
		AppConstants.APP.UI_BUILDER.RECOMMENDATION_PREFERENCES.GET_SUCCESS,
		AppConstants.APP.UI_BUILDER.RECOMMENDATION_PREFERENCES.GET_ERROR,
		computeStateByAppName,
	),
	$saveRecommendationsPreferences: createRequestReducer(
		AppConstants.APP.UI_BUILDER.RECOMMENDATION_PREFERENCES.SAVE,
		AppConstants.APP.UI_BUILDER.RECOMMENDATION_PREFERENCES.SAVE_SUCCESS,
		AppConstants.APP.UI_BUILDER.RECOMMENDATION_PREFERENCES.SAVE_ERROR,
		computeStateByAppName,
	),
	$deleteRecommendationsPreferences: createRequestReducer(
		AppConstants.APP.UI_BUILDER.RECOMMENDATION_PREFERENCES.DELETE,
		AppConstants.APP.UI_BUILDER.RECOMMENDATION_PREFERENCES.DELETE_SUCCESS,
		AppConstants.APP.UI_BUILDER.RECOMMENDATION_PREFERENCES.DELETE_ERROR,
		computeStateByAppName,
	),
	$getAppAnalytics: createRequestReducer(
		AppConstants.APP.ANALYTICS.GET,
		AppConstants.APP.ANALYTICS.GET_SUCCESS,
		AppConstants.APP.ANALYTICS.GET_ERROR,
		computeStateByAppName,
	),
	$getAppRequestDistribution: createRequestReducer(
		AppConstants.APP.ANALYTICS.GET_REQUEST_DISTRIBUTION,
		AppConstants.APP.ANALYTICS.GET_REQUEST_DISTRIBUTION_SUCCESS,
		AppConstants.APP.ANALYTICS.GET_REQUEST_DISTRIBUTION_ERROR,
		computeStateByAppName,
	),
	$getAppAnalyticsSummary: createRequestReducer(
		AppConstants.APP.ANALYTICS.GET_SUMMARY,
		AppConstants.APP.ANALYTICS.GET_SUMMARY_SUCCESS,
		AppConstants.APP.ANALYTICS.GET_SUMMARY_ERROR,
		computeStateByAppName,
	),
	$getAppSearchLatency: createRequestReducer(
		AppConstants.APP.ANALYTICS.GET_LATENCY,
		AppConstants.APP.ANALYTICS.GET_LATENCY_SUCCESS,
		AppConstants.APP.ANALYTICS.GET_LATENCY_ERROR,
		computeStateByAppName,
	),
	$getAppQueryOverview: createRequestReducer(
		AppConstants.APP.ANALYTICS.GET_QUERY_VOLUME,
		AppConstants.APP.ANALYTICS.GET_QUERY_VOLUME_SUCCESS,
		AppConstants.APP.ANALYTICS.GET_QUERY_VOLUME_ERROR,
		computeStateByAppName,
	),
	$getAppGeoDistribution: createRequestReducer(
		AppConstants.APP.ANALYTICS.GET_GEO_DISTRIBUTION,
		AppConstants.APP.ANALYTICS.GET_GEO_DISTRIBUTION_SUCCESS,
		AppConstants.APP.ANALYTICS.GET_GEO_DISTRIBUTION_ERROR,
		computeStateByAppName,
	),
	$getAppPopularSearches: createRequestReducer(
		AppConstants.APP.ANALYTICS.GET_POPULAR_SEARCHES,
		AppConstants.APP.ANALYTICS.GET_POPULAR_SEARCHES_SUCCESS,
		AppConstants.APP.ANALYTICS.GET_POPULAR_SEARCHES_ERROR,
		computeStateByAppName,
	),
	$getAppRecentSearches: createRequestReducer(
		AppConstants.APP.ANALYTICS.GET_RECENT_SEARCHES,
		AppConstants.APP.ANALYTICS.GET_RECENT_SEARCHES_SUCCESS,
		AppConstants.APP.ANALYTICS.GET_RECENT_SEARCHES_ERROR,
		computeStateByAppName,
	),
	$getAppRecentResults: createRequestReducer(
		AppConstants.APP.ANALYTICS.GET_RECENT_RESULTS,
		AppConstants.APP.ANALYTICS.GET_RECENT_RESULTS_SUCCESS,
		AppConstants.APP.ANALYTICS.GET_RECENT_RESULTS_ERROR,
		computeStateByAppName,
	),
	$createAppPermission: createRequestReducer(
		AppConstants.APP.PERMISSION.CREATE,
		AppConstants.APP.PERMISSION.CREATE_SUCCESS,
		AppConstants.APP.PERMISSION.CREATE_ERROR,
	),
	$deleteAppPermission: createRequestReducer(
		AppConstants.APP.PERMISSION.DELETE,
		AppConstants.APP.PERMISSION.DELETE_SUCCESS,
		AppConstants.APP.PERMISSION.DELETE_ERROR,
	),
	$updateAppPermission: createRequestReducer(
		AppConstants.APP.PERMISSION.UPDATE,
		AppConstants.APP.PERMISSION.UPDATE_SUCCESS,
		AppConstants.APP.PERMISSION.UPDATE_ERROR,
	),
	$deleteApp: createRequestReducer(
		AppConstants.APP.DELETE_APP,
		AppConstants.APP.DELETE_APP_SUCCESS,
		AppConstants.APP.DELETE_APP_ERROR,
	),
	$getSharedApp: createRequestReducer(
		AppConstants.APP.GET_SHARE,
		AppConstants.APP.GET_SHARE_SUCCESS,
		AppConstants.APP.GET_SHARE_ERROR,
	),
	$createAppShare: createRequestReducer(
		AppConstants.APP.CREATE_SHARE,
		AppConstants.APP.CREATE_SHARE_SUCCESS,
		AppConstants.APP.CREATE_SHARE_ERROR,
	),
	$deleteAppShare: createRequestReducer(
		AppConstants.APP.DELETE_SHARE,
		AppConstants.APP.DELETE_SHARE_SUCCESS,
		AppConstants.APP.DELETE_SHARE_ERROR,
	),
	$createAppSubscription: createRequestReducer(
		AppConstants.APP.CREATE_SUBSCRIPTION,
		AppConstants.APP.CREATE_SUBSCRIPTION_SUCCESS,
		AppConstants.APP.CREATE_SUBSCRIPTION_ERROR,
	),
	$deleteAppSubscription: createRequestReducer(
		AppConstants.APP.DELETE_SUBSCRIPTION,
		AppConstants.APP.DELETE_SUBSCRIPTION_SUCCESS,
		AppConstants.APP.DELETE_SUBSCRIPTION_ERROR,
	),
	$getAppPublicKey: createRequestReducer(
		AppConstants.APP.PUBLIC_KEY.GET,
		AppConstants.APP.PUBLIC_KEY.GET_SUCCESS,
		AppConstants.APP.PUBLIC_KEY.GET_ERROR,
	),
	$getAppFunctions: getAppFunction,
	$getAppRules: getAppRules,
	$getAppRegistries: privateRegistries,
	$updateAppPublicKey: createRequestReducer(
		AppConstants.APP.PUBLIC_KEY.UPDATE,
		AppConstants.APP.PUBLIC_KEY.UPDATE_SUCCESS,
		AppConstants.APP.PUBLIC_KEY.UPDATE_ERROR,
	),
	$getCurrentApp: getCurrentApp,
	$updateAppPaymentMethod: createRequestReducer(
		AppConstants.ACCOUNT.PAYMENT.UPDATE,
		AppConstants.ACCOUNT.PAYMENT.UPDATE_SUCCESS,
		AppConstants.ACCOUNT.PAYMENT.UPDATE_ERROR,
	),
	$getAppSettings: getAppSettings,
	$getAppAnalyticsInsights: getAppAnalyticsInsights,
	$getAppGradeMetrics: createRequestReducer(
		AppConstants.APP.GRADE.GET,
		AppConstants.APP.GRADE.GET_SUCCESS,
		AppConstants.APP.GRADE.GET_ERROR,
	),
	$getLocalRelevancy: localRelevancyReducer,
	$getLocalMapping: localMappingReducer,
	$getAdvanceSearchState: getAdvanceSearchState,
	$reIndexingTasks: reIndexingTasks,
	$monitoring: monitoring,
};
