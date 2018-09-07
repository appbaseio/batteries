import AppConstants from '../constants';

const initialState = {
    id: undefined,
    name: undefined,
};

function getCurrentApp(state = initialState, action) {
	switch (action.type) {
		case AppConstants.APP.SET_CURRENT_APP:
			return {
				...state,
				id: action.payload.id,
                name: action.payload.name,
            };
        case AppConstants.APP.CLEAR_CURRENT_APP:
			return {
				...state,
				id: undefined,
                name: undefined,
			};
		default:
			return state;
	}
}

export default getCurrentApp;
