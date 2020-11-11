import constants from '../constants';

const localMappingReducer = (state = null, action) => {
	switch (action.type) {
		case constants.APP.SEARCH_SETTINGS.SET_LOCAL_MAPPING_STATE:
			return {
				...state,
				[action.appName]: action.data,
			};
		default:
			return state;
	}
};

export default localMappingReducer;
