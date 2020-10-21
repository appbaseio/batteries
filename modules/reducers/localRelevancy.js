import constants from '../constants';

const localRelevancyReducer = (state = null, action) => {
	switch (action.type) {
		case constants.APP.SEARCH_SETTINGS.SET_LOCAL_SEARCH_RELEVANCY_STATE:
			return {
				...state,
				[action.appName]: action.data,
			};
		default:
			return state;
	}
};

export default localRelevancyReducer;
