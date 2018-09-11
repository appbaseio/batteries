import AppConstants from '../constants';
import getUserStatus from './getUserStatus';
import getAppInfo from './getAppInfo';
import getAppMappings from './getAppMappings';
import getAppCredentials from './getAppCredentials';
import getCurrentApp from './getCurrentApp';
import { createRequestReducer, computeAppPlanState } from './utils';

export default {
	$getUserStatus: getUserStatus,
	$getAppInfo: getAppInfo,
	$getAppMappings: getAppMappings,
	$getAppCredentials: getAppCredentials,
	$getAppPermissions: createRequestReducer(
		AppConstants.APP.PERMISSION.GET,
		AppConstants.APP.PERMISSION.GET_SUCCESS,
		AppConstants.APP.PERMISSION.GET_ERROR,
	),
	$getAppPlan: createRequestReducer(
		AppConstants.APP.GET_PLAN,
		AppConstants.APP.GET_PLAN_SUCCESS,
		AppConstants.APP.GET_PLAN_ERROR,
		computeAppPlanState,
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
	$getCurrentApp: getCurrentApp,
};
