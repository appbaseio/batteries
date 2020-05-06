import AppConstants from '../constants';
import { get } from 'lodash';

const initialState = {
	isFetching: false,
	error: undefined,
	success: false,
	results: {},
	updates: {},
};

const removeStaleUpdates = (updates) => {
	const inProgressUpdates = Object.keys(updates).filter(
		(updateKey) => updates[updateKey].inProgress,
	);

	return inProgressUpdates.reduce((agg, item) => {
		return {
			...agg,
			[item]: updates[item],
		};
	}, {});
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
				updates: [],
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
				updates: {
					...removeStaleUpdates(state.updates),
					[action.meta.id]: {
						inProgress: true,
					},
				},
				error: null,
			};
		case AppConstants.APP.ANALYTICS.UPDATE_INSIGHTS_STATUS_SUCCESS: {
			const { appName, from, to, id } = action.meta;

			const insight = state.results[appName][from].find((item) => item.id === id);
			const deleteInsightFrom = state.results[appName][from].filter((item) => item.id !== id);

			if (to === 'deleted') {
				return {
					...state,
					results: Object.assign({}, state.results, {
						[appName]: {
							...state.results[appName],
							[from]: [...deleteInsightFrom],
						},
					}),
					updates: {
						...removeStaleUpdates(state.updates),
						[id]: {
							inProgress: false,
							success: true,
							from,
							to,
						},
					},
				};
			}

			const addDataToInsight = [insight, ...state.results[appName][to]];

			return {
				...state,
				results: Object.assign({}, state.results, {
					[appName]: {
						...state.results[appName],
						[to]: [...addDataToInsight],
						[from]: [...deleteInsightFrom],
					},
				}),
				updates: {
					...removeStaleUpdates(state.updates),
					[id]: {
						inProgress: false,
						success: true,
						from,
						to,
					},
				},
			};
		}
		case AppConstants.APP.ANALYTICS.UPDATE_INSIGHTS_STATUS_ERROR: {
			const { from, to, id } = action.meta;
			return {
				...state,
				updates: {
					...removeStaleUpdates(state.updates),
					[id]: {
						inProgress: false,
						success: false,
						from,
						to,
						error: action.error,
					},
				},
			};
		}
		default:
			return state;
	}
}

export default getAppAnalyticsInsights;
