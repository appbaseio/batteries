import { getCredentialsFromPermissions } from '../../utils';
import { computeMetrics, getPlanFromTier, getApiCalls } from '../helpers';

export const computePlan = ({ payload }) => {
	const isBootstrapMonthly = payload.tier === 'bootstrap-monthly';
	const isBootstrapAnnual = payload.tier === 'bootstrap-annual';
	const isGrowthMonthly = payload.tier === 'growth-monthly';
	const isGrowthAnnual = payload.tier === 'growth-annual';
	// consider below plans same as growth level restriction (coming from shopify plugin)
	const isStartupMonthly = payload.tier === 'startup-monthly';
	const isBusinessMonthly = payload.tier === 'business-monthly';
	return {
		...payload,
		isBootstrapMonthly,
		isBootstrapAnnual,
		isGrowthMonthly,
		isGrowthAnnual,
		isStartupMonthly,
		isBusinessMonthly,
		isBootstrap: isBootstrapMonthly || isBootstrapAnnual,
		isGrowth:
			isGrowthMonthly ||
			isGrowthAnnual ||
			isStartupMonthly ||
			isBusinessMonthly,
		isTrialEligible: payload.is_trial_eligible || true,
		isPaid:
			isBootstrapMonthly ||
			isBootstrapAnnual ||
			isGrowthMonthly ||
			isGrowthAnnual ||
			isStartupMonthly ||
			isBusinessMonthly,
		plan: getPlanFromTier(payload.tier),
		daysLeft: payload.tier_validity
			? Math.ceil(
					(payload.tier_validity - new Date().getTime() / 1000) /
						(24 * 60 * 60),
			  )
			: 0,
		clusterDaysLeft: payload.cluster_tier_validity
			? Math.ceil(
					(payload.cluster_tier_validity -
						new Date().getTime() / 1000) /
						(24 * 60 * 60),
			  )
			: 0,
	};
};
export const computeAppPlanState = ({ payload, meta }, state) => ({
	results: Object.assign({}, state.results, {
		[meta.appName]: computePlan({ payload }),
	}),
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
		Object.keys(action.payload || {}).forEach(key => {
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
