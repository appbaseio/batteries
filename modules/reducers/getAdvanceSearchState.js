import constants from '../constants';

const getAdvanceSearchState = (state = {}, action) => {
	switch (action.type) {
		case constants.APP.SEARCH_SETTINGS.SET_ADVANCE_SEARCH_STATE:
			return {
				...state,
				[action.fieldName]: action.state,
			};
		default:
			return state;
	}
};

export default getAdvanceSearchState;
