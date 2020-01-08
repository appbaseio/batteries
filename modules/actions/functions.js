import { createAction } from './utils';
import AppConstants from '../constants';
import {
	getFunctions as fetchFunctions,
	updateFunctions as putFunctions,
	createFunction as deployFunction,
	invokeFunction as invokeFunctions,
	deleteFunction as deleteFunctions,
	reorderFunction as reorderFunctions,
} from '../../utils/app';

export function getFunctions(name = 'default') {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.FUNCTIONS.GET));
		return fetchFunctions()
			.then((res) => {
				dispatch(
					createAction(AppConstants.APP.FUNCTIONS.GET_SUCCESS, res, null, {
						name,
					}),
				);
			})
			.catch(error => dispatch(createAction(AppConstants.APP.FUNCTIONS.GET_ERROR, null, error)));
	};
}

export function updateFunctions(name = 'default', payload, isTrigger) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.FUNCTIONS.UPDATE, { name, isTrigger }));
		return putFunctions(name, payload)
			.then(() => {
				dispatch(
					createAction(
						AppConstants.APP.FUNCTIONS.UPDATE_SUCCESS,
						{
							[name]: {
								...payload,
							},
						},
						null,
						{
							name,
						},
					),
				);
			})
			.catch(error => dispatch(
					createAction(AppConstants.APP.FUNCTIONS.UPDATE_ERROR, null, error, { name }),
				));
	};
}

export function createFunction(name, payload) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.FUNCTIONS.CREATE, { name, payload }));
		return deployFunction(name, payload)
			.then(() => {
				dispatch(
					createAction(
						AppConstants.APP.FUNCTIONS.CREATE_SUCCESS,
						{
							service: name,
							...payload,
						},
						null,
						{
							name,
						},
					),
				);
			})
			.catch(error => dispatch(createAction(AppConstants.APP.FUNCTIONS.CREATE_ERROR, null, error)));
	};
}

export function invokeFunction(name, payload) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.FUNCTIONS.INVOKE, { name, payload }));
		return invokeFunctions(name, payload)
			.then((res) => {
				dispatch(
					createAction(AppConstants.APP.FUNCTIONS.INVOKE_SUCCESS, res, null, {
						name,
					}),
				);
			})
			.catch(error => dispatch(createAction(AppConstants.APP.FUNCTIONS.INVOKE_ERROR, null, error)));
	};
}

export function deleteFunction(name) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.FUNCTIONS.DELETE, name));
		return deleteFunctions(name)
			.then((res) => {
				dispatch(
					createAction(AppConstants.APP.FUNCTIONS.DELETE_SUCCESS, res, null, {
						name,
					}),
				);
			})
			.catch(error => dispatch(
					createAction(AppConstants.APP.FUNCTIONS.DELETE_ERROR, null, error, { name }),
				));
	};
}

export function reorderFunction(source, destination) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.FUNCTIONS.REORDER));
		return reorderFunctions(source, destination)
			.then(() => {
				dispatch(
					createAction(
						AppConstants.APP.FUNCTIONS.REORDER_SUCCESS,
						{ source, destination },
						null,
					),
				);
			})
			.catch(error => dispatch(createAction(AppConstants.APP.FUNCTIONS.REORDER_ERROR, null, error)));
	};
}
