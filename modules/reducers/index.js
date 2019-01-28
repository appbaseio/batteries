import AppConstants from '../constants';
import getAppInfo from './getAppInfo';
import getAppMappings from './getAppMappings';
import getCurrentApp from './getCurrentApp';
import createRequestReducer from './request';
import {
	computeAppPlanState,
	computeAppPermissionState,
	computeStateByAppName,
	computePlan,
} from './utils';

export default {
	$getAppInfo: getAppInfo,
	$getAppMappings: getAppMappings,
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
	$getAppGeoDistribution: createRequestReducer(
		AppConstants.APP.ANALYTICS.GET_GEO_DISTRIBUTION,
		AppConstants.APP.ANALYTICS.GET_GEO_DISTRIBUTION_SUCCESS,
		AppConstants.APP.ANALYTICS.GET_GEO_DISTRIBUTION_ERROR,
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
	$getCurrentApp: getCurrentApp,
};
