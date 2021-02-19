import AppConstants from '../constants';

function getSelectedFilters(state = {}, action) {
	switch (action.type) {
		case AppConstants.APP.FILTER.SET_FILTER_VALUE:
			// If key is refresh data then just immutate the store with same filters so components can refresh
			return action.payload.filterKey === 'refresh__data'
				? {
						...state,
						[action.payload.filterId]: { ...state[action.payload.filterId] },
				  }
				: {
						...state,
						[action.payload.filterId]: {
							...state[action.payload.filterId],
							[action.payload.filterKey]: action.payload.filterValue,
						},
				  };
		case AppConstants.APP.FILTER.INITIALIZE_FILTER_VALUE: {
			return {
				...state,
				[action.payload.filterId]: action.payload.filterValue,
			};
		}
		case AppConstants.APP.FILTER.CLEAR_FILTER_VALUE: {
			if (action.payload.filterKey) {
				const { [action.payload.filterKey]: del, ...obj } = state[action.payload.filterId];
				return {
					...state,
					[action.payload.filterId]: obj,
				};
			}
			return {
				...state,
				[action.payload.filterId]: {},
			};
		}
		default:
			return state;
	}
}

export default getSelectedFilters;
