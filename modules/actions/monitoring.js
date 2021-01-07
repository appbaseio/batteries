import constants from '../constants';

export const setMonitoringConfig = (config) => {
	return {
		type: constants.MONITORING.SET_CONFIG,
		data: config,
	};
};

export const setTimeFilter = (data) => {
	return {
		type: constants.MONITORING.SET_TIME_FILTER,
		data,
	};
};
