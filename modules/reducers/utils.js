const initialState = {
	isFetching: false,
	error: undefined,
	results: undefined,
};
// eslint-disable-next-line
export const createRequestReducer = (requestAction, successAction, errorAction, extendState) => function request(state = initialState, action) {
		switch (action.type) {
			case requestAction:
				return {
					...state,
					isFetching: true,
					error: undefined,
				};
			case successAction:
				return {
					...state,
					isFetching: false,
					results: action.payload,
					...(extendState && extendState(action.payload)),
				};

			case errorAction:
				return {
					...state,
					isFetching: false,
					error: action.error,
				};
			default:
				return state;
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
		isPaid: isBootstrapMonthly || isBootstrapAnnual || isGrowthMonthly || isGrowthAnnual,
	};
};
