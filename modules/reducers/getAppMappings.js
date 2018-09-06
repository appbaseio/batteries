import AppConstants from '../constants';
import { traverseMapping } from '../../utils/mappings';

const initialState = {
	isFetching: false,
	error: undefined,
	rawMappings: undefined,
	traversedMappings: undefined,
};

function getAppMappings(state = initialState, action) {
	switch (action.type) {
		case AppConstants.APP.GET_MAPPINGS:
			return {
				...state,
				isFetching: true,
				error: undefined,
			};
		case AppConstants.APP.GET_MAPPINGS_SUCCESS:
			return {
				...state,
				isFetching: false,
				rawMappings: action.payload,
				traversedMappings: traverseMapping(action.payload),
			};
		case AppConstants.APP.GET_MAPPINGS_ERROR:
			return {
				...state,
				isFetching: false,
				error: action.error,
			};
		default:
			return state;
	}
}

export default getAppMappings;
