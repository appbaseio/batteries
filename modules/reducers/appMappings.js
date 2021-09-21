import constants from '../constants';

const getAllAppMappings = (state = {}, action) => {
	switch (action.type) {
		case constants.APP.QUERY.GET_MAPPINGS:
			return {
				...state,
				...action.payload,
			};
		default:
			return state;
	}
};

export default getAllAppMappings;
