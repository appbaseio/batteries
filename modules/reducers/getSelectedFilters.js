import AppConstants from '../constants';

function getSelectedFilters(state = {}, action) {
	switch (action.type) {
		case AppConstants.APP.FILTER.SET_FILTER_VALUE:
			return {
				...state,
				[action.payload.filterId]: {
					...state[action.payload.filterId],
					[action.payload.filterKey]: action.payload.filterValue,
				},
			};
		case AppConstants.APP.FILTER.CLEAR_FILTER_VALUE: {
			if (action.payload.filterKey) {
				const { [action.payload.filterKey]: del, ...obj } = state[action.payload.filterId];
				return {
					...state,
					[action.payload.filterId]: obj,
				};
			}
			const { [action.payload.filterId]: del, ...obj } = state;
			return obj;
		}
		default:
			return state;
	}
}

export default getSelectedFilters;
