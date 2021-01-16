import constants from '../constants';

const monitoring = (state = { config: {}, filter: { time: 'now-5m' } }, action) => {
	switch (action.type) {
		case constants.MONITORING.SET_CONFIG:
			return {
				...state,
				config: action.data,
			};
		case constants.MONITORING.SET_TIME_FILTER:
			return {
				...state,
				filter: {
					...state.filter,
					time: action.data,
				},
			};
		default:
			return state;
	}
};

export default monitoring;
