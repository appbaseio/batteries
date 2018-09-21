import AppConstants from '../constants';
import getUserStatus from './getUserStatus';
import getAppInfo from './getAppInfo';
import getAppMappings from './getAppMappings';
import getCurrentApp from './getCurrentApp';
import createRequestReducer from './request';
import {
	computeAppPlanState,
	computeAppPermissionState,
	computeAppMappingState,
	computeStateByAppName,
} from './utils';

export default {
	$getUserStatus: getUserStatus,
	$getAppInfo: getAppInfo,
	$getAppMappings: getAppMappings,
	$getAppPermissions: createRequestReducer(
		AppConstants.APP.PERMISSION.GET,
		AppConstants.APP.PERMISSION.GET_SUCCESS,
		AppConstants.APP.PERMISSION.GET_ERROR,
		computeAppPermissionState,
	),
	$getAppPlan: createRequestReducer(
		AppConstants.APP.GET_PLAN,
		AppConstants.APP.GET_PLAN_SUCCESS,
		AppConstants.APP.GET_PLAN_ERROR,
		computeAppPlanState,
		{
			plan: 'free',
		},
	),
	$updateUser: createRequestReducer(
		AppConstants.ACCOUNT.UPDATE_USER,
		AppConstants.ACCOUNT.UPDATE_USER_SUCCESS,
		AppConstants.ACCOUNT.UPDATE_USER_ERROR,
		computeAppPlanState,
	),
	$getAppAnalytics: createRequestReducer(
		AppConstants.APP.ANALYTICS.GET,
		AppConstants.APP.ANALYTICS.GET_SUCCESS,
		AppConstants.APP.ANALYTICS.GET_ERROR,
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
	$getAppGeoDistribution: createRequestReducer(
		AppConstants.APP.ANALYTICS.GET_GEO_DISTRIBUTION,
		AppConstants.APP.ANALYTICS.GET_GEO_DISTRIBUTION_SUCCESS,
		AppConstants.APP.ANALYTICS.GET_GEO_DISTRIBUTION_ERROR,
		computeStateByAppName,
	),
	$getAppMetrics: createRequestReducer(
		AppConstants.APP.GET_METRICS,
		AppConstants.APP.GET_METRICS_SUCCESS,
		AppConstants.APP.GET_METRICS_ERROR,
		computeAppMappingState,
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
	$getCurrentApp: getCurrentApp,
};
