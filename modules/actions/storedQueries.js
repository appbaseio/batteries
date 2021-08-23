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

export function saveAppStoredQuery(storedQueryId, payload, validate, execute) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.STORED_QUERIES.UPDATE));
		const ACC_API = getURL();
		const savePayload = { ...payload };
		return doPut(`${ACC_API}/_storedquery/${storedQueryId}`, savePayload)
			.then((res) => {
				dispatch(createAction(AppConstants.APP.STORED_QUERIES.UPDATE_SUCCESS, res));
				getAppStoredQueries()(dispatch);
				clearAppStoredQueries(validate, execute)(dispatch);
				if (validate) {
					const validatePayload = { params: payload.params };
					validateAppStoredQuery(storedQueryId, validatePayload, dispatch);
				}
				if (execute) {
					const executePayload = { params: payload.params };
					executeAppStoredQuery(storedQueryId, executePayload, dispatch);
				}
			})
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
			.then((res) => {
				dispatch(createAction(AppConstants.APP.STORED_QUERIES.DELETE_SUCCESS, res));
				getAppStoredQueries()(dispatch);
			})
			.catch((error) =>
				dispatch(createAction(AppConstants.APP.STORED_QUERIES.DELETE_ERROR, null, error)),
			);
	};
}

export function validateAppStoredQuery(storedQueryId, payload, dispatch) {
	dispatch(createAction(AppConstants.APP.STORED_QUERIES.VALIDATE));
	const ACC_API = getURL();
	const url = `${ACC_API}/_storedquery/${storedQueryId}/validate`;
	return doPost(url, payload, undefined, undefined, [404, 400])
		.then((res) => {
			dispatch(createAction(AppConstants.APP.STORED_QUERIES.VALIDATE_SUCCESS, res));
		})
		.catch((error) =>
			dispatch(createAction(AppConstants.APP.STORED_QUERIES.VALIDATE_ERROR, null, error)),
		);
}

export function clearAppStoredQueries(validate, execute) {
	return (dispatch) => {
		if (validate) {
			dispatch(createAction(AppConstants.APP.STORED_QUERIES.CLEAR_EXECUTE));
		}
		if (execute) {
			dispatch(createAction(AppConstants.APP.STORED_QUERIES.CLEAR_VALIDATE));
		}
	};
}

export function executeAppStoredQuery(storedQueryId, payload, dispatch) {
	dispatch(createAction(AppConstants.APP.STORED_QUERIES.EXECUTE));
	const ACC_API = getURL();
	const url = `${ACC_API}/_storedquery/${storedQueryId}/execute`;
	return doPost(url, payload, undefined, undefined, [404, 400])
		.then((res) => {
			saveAppStoredQuery(storedQueryId);
			dispatch(createAction(AppConstants.APP.STORED_QUERIES.EXECUTE_SUCCESS, res));
		})
		.catch((error) =>
			dispatch(createAction(AppConstants.APP.STORED_QUERIES.EXECUTE_ERROR, null, error)),
		);
}
