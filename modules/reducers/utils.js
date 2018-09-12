import get from 'lodash/get';
import { getCredentialsFromPermissions } from '../../utils';

const getPlanFromTier = (tier) => {
	switch (tier) {
		case 'bootstrap-monthly':
		case 'bootstrap-annual':
			return 'bootstrap';
		case 'growth-monthly':
		case 'growth-annual':
			return 'growth';
		default:
			return 'free';
	}
};
const computeMetrics = (metrics) => {
	let totalRecords = 0;
	let totalStorage = 0;
	let totalCalls = 0;
	const currentDate = new Date();
	// current_date.setMonth(current_date.getMonth() - 1);
	currentDate.setDate(1);

	totalRecords += parseInt(get(metrics, 'overall.numDocs'), 10) || 0;
	const dividend = 1024 ** 2;
	totalStorage += get(metrics, 'overall.storage') / dividend || 0; // in MB

	get(metrics, 'month.buckets', []).forEach((bucket) => {
		if (bucket.key >= currentDate.getTime()) totalCalls += bucket.apiCalls.value;
	});

	return {
		storage: totalStorage.toFixed(3),
		records: totalRecords,
		calls: totalCalls,
	};
};
const getApiCalls = (data) => {
	let total = 0;
	get(data, 'month.buckets', []).forEach((bucket) => {
		total += bucket.apiCalls.value;
	});
	return total;
};
export const computeAppPlanState = ({ payload }) => {
	const isBootstrapMonthly = payload.tier === 'bootstrap-monthly';
	const isBootstrapAnnual = payload.tier === 'bootstrap-annual';
	const isGrowthMonthly = payload.tier === 'growth-monthly';
	const isGrowthAnnual = payload.tier === 'growth-annual';

	return {
		isBootstrapMonthly,
		isBootstrapAnnual,
		isGrowthMonthly,
		isGrowthAnnual,
		isBootstrap: isBootstrapMonthly || isBootstrapAnnual,
		isGrowth: isGrowthMonthly || isGrowthAnnual,
		isPaid: isBootstrapMonthly || isBootstrapAnnual || isGrowthMonthly || isGrowthAnnual,
		plan: getPlanFromTier(payload.tier),
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

export const computeAppAnalyticsState = (action, state) => ({
	results: Object.assign({}, state.results, {
		[action.meta.appName]: action.payload,
	}),
});

export const computeAppPermissionState = ({ payload }) => ({
	credentials: getCredentialsFromPermissions(payload),
});
