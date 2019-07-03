import AppConstants from '../constants';
import { parseSearchState } from '../../utils';

const initialAppState = {
	searchState: undefined,
	parsedSearchState: undefined,
};

function getSearchState(state = initialAppState, action) {
	switch (action.type) {
		case AppConstants.APP.SET_SEARCH_STATE:
			return {
				searchState: action.payload.searchState,
				parsedSearchState: parseSearchState(action.payload.searchState),
			};
		case AppConstants.APP.CLEAR_SEARCH_STATE:
			return {
				searchState: undefined,
				parsedSearchState: undefined,
			};
		default:
			return state;
	}
}

export default getSearchState;
