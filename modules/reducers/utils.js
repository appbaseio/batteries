import { getCredentialsFromPermissions } from '../../utils';
import { computeMetrics, getPlanFromTier, getApiCalls } from '../helpers';

export const computeAppPlanState = ({ payload, meta }, state) => {
	const isBootstrapMonthly = payload.tier === 'bootstrap-monthly';
	const isBootstrapAnnual = payload.tier === 'bootstrap-annual';
	const isGrowthMonthly = payload.tier === 'growth-monthly';
	const isGrowthAnnual = payload.tier === 'growth-annual';

	return {
		results: Object.assign({}, state.results, {
			[meta.appName]: {
				...payload,
				isBootstrapMonthly,
				isBootstrapAnnual,
				isGrowthMonthly,
				isGrowthAnnual,
				isBootstrap: isBootstrapMonthly || isBootstrapAnnual,
				isGrowth: isGrowthMonthly || isGrowthAnnual,
				isPaid:
					isBootstrapMonthly || isBootstrapAnnual || isGrowthMonthly || isGrowthAnnual,
				plan: getPlanFromTier(payload.tier),
				daysLeft: payload.tier_validity
					? Math.ceil(
							(payload.tier_validity - new Date().getTime() / 1000) / (24 * 60 * 60),
					  )
					: 0,
			},
		}),
	};
};

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
