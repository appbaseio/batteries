import AppConstants from '../constants';
import { get } from 'lodash';

const initialState = {
	isOpen: false,
	isFetching: false,
	error: null,
	success: false,
	results: {},
	updates: {},
};

const removeStaleUpdates = (updates = {}) => {
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
		case AppConstants.APP.INSIGHTS_SIDEBAR:
			return {
				...state,
				isOpen: !get(state, 'isOpen'),
			};
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
				results: {
					...state.results,
					[action.meta.appName]: action.payload,
				},
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
			const { appName, currentStatus, nextStatus, id } = action.meta;

			const insight = get(state, `results.${appName}.${currentStatus}`, []).find(
				(item) => item.id === id,
			);
			const deleteInsightFrom = get(state, `results.${appName}.${currentStatus}`, []).filter(
				(item) => item.id !== id,
			);

			if (nextStatus === 'deleted') {
				return {
					...state,
					results: {
						...state.results,
						[appName]: {
							...state.results[appName],
							[currentStatus]: [...deleteInsightFrom],
						},
					},
					updates: {
						...removeStaleUpdates(state.updates),
						[id]: {
							inProgress: false,
							success: true,
							currentStatus,
							nextStatus,
						},
					},
				};
			}

			const addDataToInsight = [
				insight,
				...get(state, `results.${appName}.${nextStatus}`, []),
			];

			return {
				...state,
				results: {
					...state.results,
					[appName]: {
						...state.results[appName],
						[nextStatus]: [...addDataToInsight],
						[currentStatus]: [...deleteInsightFrom],
					},
				},
				updates: {
					...removeStaleUpdates(state.updates),
					[id]: {
						inProgress: false,
						success: true,
						currentStatus,
						nextStatus,
					},
				},
			};
		}
		case AppConstants.APP.ANALYTICS.UPDATE_INSIGHTS_STATUS_ERROR: {
			const { currentStatus, nextStatus, id } = action.meta;
			return {
				...state,
				updates: {
					...removeStaleUpdates(state.updates),
					[id]: {
						inProgress: false,
						success: false,
						currentStatus,
						nextStatus,
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
