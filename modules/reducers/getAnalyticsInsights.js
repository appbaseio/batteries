import AppConstants from '../constants';
import { get } from 'lodash';

const initialState = {
	isFetching: false,
	error: undefined,
	success: false,
	results: {},
};

function getAppAnalyticsInsights(state = initialState, action) {
	switch (action.type) {
		case AppConstants.APP.ANALYTICS.GET_INSIGHTS:
			return {
				...state,
				isFetching: true,
				error: undefined,
				success: false,
			};
		case AppConstants.APP.ANALYTICS.GET_INSIGHTS_SUCCESS:
			return {
				...state,
				isFetching: false,
				results: Object.assign({}, state.results, {
					[action.meta.appName]: action.payload,
				}),
				success: true,
			};
		case AppConstants.APP.ANALYTICS.GET_INSIGHTS_ERROR:
			return {
				...state,
				isFetching: false,
				error: action.error,
			};
		case AppConstants.APP.ANALYTICS.UPDATE_INSIGHTS_STATUS:
			return {
				...state,
				isUpdating: action.meta.id,
				error: null,
			};
		case AppConstants.APP.ANALYTICS.UPDATE_INSIGHTS_STATUS_SUCCESS: {
			const { status, id, appName } = action.meta;
			const currentStatusType = Object.keys(state.results[appName]).find((statusType) =>
				get(state.results[appName], `${statusType}.${id}`),
			);

			const insightData = state.results[appName][currentStatusType].find(item => item.type === id);
			const updateCurrentStatusData = state.results[appName][currentStatusType].filter(
				(item) => item.type !== id,
			);

			const updatedInsights = {
				...state.results[appName],
				[currentStatusType]: updateCurrentStatusData,
				[status]: {
					...state.results[appName][status],
					[id]: {
						...insightData,
					},
				},
			};
			return {
				...state,
				results: Object.assign({}, state.results, {
					[appName]: updatedInsights,
				}),
				isUpdating: null,
				error: null,
			};
		}
		case AppConstants.APP.ANALYTICS.UPDATE_INSIGHTS_STATUS_ERROR:
			return {
				...state,
				isUpdating: null,
				error: action.error,
			};
		default:
			return state;
	}
}

export default getAppAnalyticsInsights;
