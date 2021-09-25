import { createAction } from './utils';
import AppConstants from '../constants';
import { getURL } from '../../../constants/config';
import { doGet, doPost, doDelete, doPut } from '../../utils/requestService';

export function getAppStoredQueries() {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.STORED_QUERIES.GET_ALL));
		const ACC_API = getURL();
		return doGet(`${ACC_API}/_storedqueries`)
			.then((res) =>
				dispatch(createAction(AppConstants.APP.STORED_QUERIES.GET_ALL_SUCCESS, res, null)),
			)
			.catch((error) =>
				dispatch(createAction(AppConstants.APP.STORED_QUERIES.GET_ALL_ERROR, null, error)),
			);
	};
}

export function getAppStoredQuery(storedQueryId) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.STORED_QUERIES.GET));
		const ACC_API = getURL();
		return doGet(`${ACC_API}/_storedquery/${storedQueryId}`)
			.then((res) => dispatch(createAction(AppConstants.APP.STORED_QUERIES.GET_SUCCESS, res)))
			.catch((error) =>
				dispatch(createAction(AppConstants.APP.STORED_QUERIES.GET_ERROR, null, error)),
			);
	};
}

export function saveAppStoredQuery(storedQueryId, payload) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.STORED_QUERIES.UPDATE));
		const ACC_API = getURL();
		return doPut(`${ACC_API}/_storedquery/${storedQueryId}`, payload)
			.then((res) =>
				dispatch(createAction(AppConstants.APP.STORED_QUERIES.UPDATE_SUCCESS, res)),
			)
			.catch((error) =>
				dispatch(createAction(AppConstants.APP.STORED_QUERIES.UPDATE_ERROR, null, error)),
			);
	};
}

export function deleteAppStoredQuery(storedQueryId) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.STORED_QUERIES.DELETE));
		const ACC_API = getURL();
		return doDelete(`${ACC_API}/_storedquery/${storedQueryId}`)
			.then((res) =>
				dispatch(createAction(AppConstants.APP.STORED_QUERIES.DELETE_SUCCESS, res)),
			)
			.catch((error) =>
				dispatch(createAction(AppConstants.APP.STORED_QUERIES.DELETE_ERROR, null, error)),
			);
	};
}

export function validateAppStoredQuery(payload) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.STORED_QUERIES.VALIDATE));
		const ACC_API = getURL();
		const url = `${ACC_API}/_storedquery/validate`;
		return doPost(url, payload, undefined, undefined, undefined, true)
			.then((res) =>
				dispatch(createAction(AppConstants.APP.STORED_QUERIES.VALIDATE_SUCCESS, res)),
			)
			.catch((error) =>
				dispatch(createAction(AppConstants.APP.STORED_QUERIES.VALIDATE_ERROR, null, error)),
			);
	};
}

export function clearAppStoredQueries() {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.STORED_QUERIES.CLEAR_EXECUTE));
		dispatch(createAction(AppConstants.APP.STORED_QUERIES.CLEAR_VALIDATE));
	};
}

export function executeAppStoredQuery(payload) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.STORED_QUERIES.EXECUTE));
		const ACC_API = getURL();
		const url = `${ACC_API}/_storedquery/execute`;
		return doPost(url, payload, undefined, undefined, undefined, true)
			.then((res) =>
				dispatch(createAction(AppConstants.APP.STORED_QUERIES.EXECUTE_SUCCESS, res)),
			)
			.catch((error) =>
				dispatch(createAction(AppConstants.APP.STORED_QUERIES.EXECUTE_ERROR, null, error)),
			);
	};
}

export function getStoredQueriesUsage() {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.STORED_QUERIES.GET_USAGE));
		const ACC_API = getURL();
		return doGet(`${ACC_API}/_analytics/storedqueries/usage`)
			.then((res) => {
				const usageStats = {};

				res.storedqueries.forEach((storedQuery) => {
					usageStats[storedQuery.key] = { ...storedQuery };
				});

				dispatch(
					createAction(
						AppConstants.APP.STORED_QUERIES.GET_USAGE_SUCCESS,
						usageStats,
						null,
					),
				);
			})
			.catch((error) =>
				dispatch(
					createAction(AppConstants.APP.STORED_QUERIES.GET_USAGE_ERROR, null, error),
				),
			);
	};
}
