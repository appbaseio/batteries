export default {
	ACCOUNT: {
		CHECK_USER_PLAN: {
			GET: '$GET_CHECK_USER_PLAN',
			GET_SUCCESS: '$GET_CHECK_USER_PLAN_SUCCESS',
			GET_ERROR: '$GET_CHECK_USER_PLAN_ERROR',
		},
		UPDATE_USER: '$UPDATE_USER',
		UPDATE_USER_SUCCESS: '$UPDATE_USER_SUCCESS',
		UPDATE_USER_ERROR: '$UPDATE_USER_ERROR',
	},
	APP: {
		SET_SEARCH_STATE: '$SET_SEARCH_STATE',
		CLEAR_SEARCH_STATE: '$CLEAR_SEARCH_STATE',
		SET_CURRENT_APP: '$SET_CURRENT_APP',
		CLEAR_CURRENT_APP: '$CLEAR_CURRENT_APP',
		GET_INFO: '$GET_APP_INFO',
		GET_INFO_SUCCESS: '$GET_APP_INFO_SUCCESS',
		GET_INFO_ERROR: '$GET_APP_INFO_ERROR',
		GET_MAPPINGS: '$GET_APP_MAPPINGS',
		GET_MAPPINGS_SUCCESS: '$GET_APP_MAPPINGS_SUCCESS',
		GET_MAPPINGS_ERROR: '$GET_APP_MAPPINGS_ERROR',
		CLEAR_MAPPINGS: '$CLEAR_APP_MAPPINGS',
		DELETE_APP: '$$DELETE_APP',
		DELETE_APP_SUCCESS: '$$DELETE_APP_SUCCESS',
		DELETE_APP_ERROR: '$$DELETE_APP_ERROR',
		GET_SHARE: '$GET_APP_SHARE',
		GET_SHARE_SUCCESS: '$GET_SHARE_SUCCESS',
		GET_SHARE_ERROR: '$GET_SHARE_ERROR',
		DELETE_SHARE: '$DELETE_APP_SHARE',
		DELETE_SHARE_SUCCESS: '$DELETE_SHARE_SUCCESS',
		DELETE_SHARE_ERROR: '$DELETE_SHARE_ERROR',
		GET_PLAN: '$GET_APP_PLAN',
		GET_PLAN_SUCCESS: '$GET_APP_PLAN_SUCCESS',
		GET_PLAN_ERROR: '$GET_APP_PLAN_ERROR',
		CREATE_SHARE: '$CREATE_APP_SHARE',
		CREATE_SHARE_SUCCESS: '$CREATE_APP_SHARE_SUCCESS',
		CREATE_SHARE_ERROR: '$CREATE_APP_SHARE_ERROR',
		TRANSFER_OWNERSHIP: '$TRANSFER_OWNERSHIP_SHARE',
		TRANSFER_OWNERSHIP_SUCCESS: '$TRANSFER_OWNERSHIP_SHARE_SUCCESS',
		TRANSFER_OWNERSHIP_ERROR: '$TRANSFER_OWNERSHIP_SHARE_ERROR',
		CREATE_SUBSCRIPTION: '$CREATE_APP_SUBSCRIPTION',
		CREATE_SUBSCRIPTION_SUCCESS: '$CREATE_APP_SUBSCRIPTION_SUCCESS',
		CREATE_SUBSCRIPTION_ERROR: '$CREATE_APP_SUBSCRIPTION_ERROR',
		DELETE_SUBSCRIPTION: '$DELETE_APP_SUBSCRIPTION',
		DELETE_SUBSCRIPTION_SUCCESS: '$DELETE_APP_SUBSCRIPTION_SUCCESS',
		DELETE_SUBSCRIPTION_ERROR: '$DELETE_APP_SUBSCRIPTION_ERROR',
		GET_METRICS: '$GET_APP_METRICS',
		GET_METRICS_SUCCESS: '$GET_APP_METRICS_SUCCESS',
		GET_METRICS_ERROR: '$GET_APP_METRICS_ERROR',
		ANALYTICS: {
			GET: '$GET_ANALYTICS',
			GET_SUCCESS: '$GET_ANALYTICS_SUCCESS',
			GET_ERROR: '$GET_ANALYTICS_ERROR',
			GET_SUMMARY: '$GET_ANALYTICS_SUMMARY',
			GET_SUMMARY_SUCCESS: '$GET_ANALYTICS_SUMMARY_SUCCESS',
			GET_SUMMARY_ERROR: '$GET_ANALYTICS_SUMMARY_ERROR',
			GET_LATENCY: '$GET_ANALYTICS_LATENCY',
			GET_LATENCY_SUCCESS: '$GET_ANALYTICS_LATENCY_SUCCESS',
			GET_LATENCY_ERROR: '$GET_ANALYTICS_LATENCY_ERROR',
			GET_GEO_DISTRIBUTION: '$GET_ANALYTICS_GEO_DISTRIBUTION',
			GET_GEO_DISTRIBUTION_SUCCESS: '$GET_ANALYTICS_GEO_DISTRIBUTION_SUCCESS',
			GET_GEO_DISTRIBUTION_ERROR: '$GET_ANALYTICS_GEO_DISTRIBUTION_ERROR',
			GET_REQUEST_DISTRIBUTION: '$GET_ANALYTICS_REQUEST_DISTRIBUTION',
			GET_REQUEST_DISTRIBUTION_SUCCESS: '$GET_ANALYTICS_REQUEST_DISTRIBUTION_SUCCESS',
			GET_REQUEST_DISTRIBUTION_ERROR: '$GET_ANALYTICS_REQUEST_DISTRIBUTION_ERROR',
		},
		PERMISSION: {
			GET: '$GET_APP_PERMISSION',
			GET_SUCCESS: '$GET_APP_PERMISSION_SUCCESS',
			GET_ERROR: '$GET_APP_PERMISSION_ERROR',
			CREATE: '$CREATE_APP_PERMISSION',
			CREATE_SUCCESS: '$CREATE_APP_PERMISSION_SUCCESS',
			CREATE_ERROR: '$CREATE_APP_PERMISSION_ERROR',
			DELETE: '$DELETE_APP_PERMISSION',
			DELETE_SUCCESS: '$DELETE_APP_PERMISSION_SUCCESS',
			DELETE_ERROR: '$DELETE_APP_PERMISSION_ERROR',
			UPDATE: '$UPDATE_APP_PERMISSION',
			UPDATE_SUCCESS: '$UPDATE_APP_PERMISSION_SUCCESS',
			UPDATE_ERROR: '$UPDATE_APP_PERMISSION_ERROR',
		},
		PUBLIC_KEY: {
			GET: '$GET_APP_PUBLIC_KEY',
			GET_SUCCESS: '$GET_APP_PUBLIC_KEY_SUCCESS',
			GET_ERROR: '$GET_APP_PUBLIC_KEY_ERROR',
			UPDATE: '$UPDATE_APP_PUBLIC_KEY',
			UPDATE_SUCCESS: '$UPDATE_APP_PUBLIC_KEY_SUCCESS',
			UPDATE_ERROR: '$UPDATE_APP_PUBLIC_KEY_ERROR',
		},
		TEMPLATES: {
			GET: '$GET_APP_TEMPLATE',
			GET_SUCCESS: '$GET_APP_TEMPLATE_SUCCESS',
			GET_ERROR: '$GET_APP_TEMPLATE_ERROR',
			GET_ALL: '$GET_ALL_APP_TEMPLATE',
			GET_ALL_SUCCESS: '$GET_ALL_APP_TEMPLATE_SUCCESS',
			GET_ALL_ERROR: '$GET_ALL_APP_TEMPLATE_ERROR',
			UPDATE: '$UPDATE_APP_TEMPLATE',
			UPDATE_SUCCESS: '$UPDATE_APP_TEMPLATE_SUCCESS',
			UPDATE_ERROR: '$UPDATE_APP_TEMPLATE_ERROR',
			DELETE: '$DELETE_APP_TEMPLATE',
			DELETE_SUCCESS: '$DELETE_APP_TEMPLATE_SUCCESS',
			DELETE_ERROR: '$DELETE_APP_TEMPLATE_ERROR',
			VALIDATE: '$VALIDATE_APP_TEMPLATE',
			CLEAR_VALIDATE: '$CLEAR_VALIDATE_APP_TEMPLATE',
			VALIDATE_SUCCESS: '$VALIDATE_APP_TEMPLATE_SUCCESS',
			VALIDATE_ERROR: '$VALIDATE_APP_TEMPLATE_ERROR',
		},
	},
};
