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
export const computeAppPlanState = (data = {}) => {
	const isBootstrapMonthly = data.tier === 'bootstrap-monthly';
	const isBootstrapAnnual = data.tier === 'bootstrap-annual';
	const isGrowthMonthly = data.tier === 'growth-monthly';
	const isGrowthAnnual = data.tier === 'growth-annual';

	return {
		isBootstrapMonthly,
		isBootstrapAnnual,
		isGrowthMonthly,
		isGrowthAnnual,
		isBootstrap: isBootstrapMonthly || isBootstrapAnnual,
		isGrowth: isGrowthMonthly || isGrowthAnnual,
		isPaid: isBootstrapMonthly || isBootstrapAnnual || isGrowthMonthly || isGrowthAnnual,
		plan: getPlanFromTier(data.tier),
	};
};

export const computeAppPermissionState = (permissions = []) => ({
		credentials: getCredentialsFromPermissions(permissions),
	});
