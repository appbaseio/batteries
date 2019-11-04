import { getCredentialsFromPermissions } from '../../utils';
import { computeMetrics, getPlanFromTier, getApiCalls } from '../helpers';

export const computePlan = ({ payload }) => {
	const isBootstrapMonthly = !!payload.tier;
	const isGrowthMonthly = !!payload.tier;
	return {
		...payload,
		isBootstrapMonthly,
		isGrowthMonthly,
		isBootstrap: isBootstrapMonthly,
		isGrowth: isGrowthMonthly,
		isPaid: isBootstrapMonthly || isGrowthMonthly,
		plan: getPlanFromTier(payload.tier),
		daysLeft: payload.trial_validity
			? Math.ceil((payload.trial_validity - new Date().getTime() / 1000) / (24 * 60 * 60))
			: 0,
	};
};
export const computeAppPlanState = ({ payload }) => ({
	results: computePlan({ payload }),
});

export const computeAppMappingState = (action, state) => ({
	results: Object.assign({}, state.results, {
		[action.meta.appName]: {
			...action.payload,
			computedMetrics: computeMetrics(action.payload),
			totalApiCalls: getApiCalls(action.payload),
		},
	}),
});

export const computeStateByAppName = (action, state) => ({
	results: Object.assign({}, state.results, {
		[action.meta.appName]: action.payload,
	}),
});

export const computeAppPermissionState = (action, state) => {
	if (action.meta.source === 'user_apps') {
		const collectResults = {};
		Object.keys(action.payload || {}).forEach((key) => {
			collectResults[key] = {
				credentials: getCredentialsFromPermissions(action.payload[key]),
				results: action.payload[key],
			};
		});
		return {
			results: Object.assign({}, state.results, collectResults),
		};
	}
	return {
		results: Object.assign({}, state.results, {
			[action.meta.appName]: {
				credentials: getCredentialsFromPermissions(action.payload),
				results: action.payload,
			},
		}),
	};
};
