import constants from '../constants';

const health = (
	state = {
		SERVER_HEALTH: { health: undefined, loading: false, error: null },
		SEARCH_ENGINE_HEALTH: { health: undefined, loading: false, error: null },
	},
	action,
) => {
	switch (action.type) {
		case constants.HEALTH.SET_SERVER_HEALTH:
			return {
				...state,
				SERVER_HEALTH: { health: undefined, loading: true, error: null },
			};
		case constants.HEALTH.SET_SERVER_HEALTH_SUCCESS:
			return {
				...state,
				SERVER_HEALTH: { health: true, loading: false, error: null },
			};
		case constants.HEALTH.SET_SERVER_HEALTH_ERROR:
			return {
				...state,
				SERVER_HEALTH: { health: false, loading: false, error: action.payload },
			};
		case constants.HEALTH.SET_SEARCH_ENGINE_HEALTH:
			return {
				...state,
				SEARCH_ENGINE_HEALTH: { health: undefined, loading: true, error: null },
			};
		case constants.HEALTH.SET_SEARCH_ENGINE_HEALTH_SUCCESS:
			return {
				...state,
				SEARCH_ENGINE_HEALTH: { health: true, loading: false, error: null },
			};
		case constants.HEALTH.SET_SEARCH_ENGINE_HEALTH_ERROR:
			return {
				...state,
				SEARCH_ENGINE_HEALTH: { health: false, loading: false, error: action.payload },
			};
		default:
			return state;
	}
};

export default health;
