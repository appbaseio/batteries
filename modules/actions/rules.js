import { createAction } from './utils';
import AppConstants from '../constants';
import {
	getRules as fetchRules,
	updateRule,
	deleteRule as removeRule,
	createRule,
	getScriptRule as fetchScriptRule,
	validateScriptRule,
} from '../../utils/app';

export function getRules() {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.RULES.GET));
		return fetchRules()
			.then((res) => {
				dispatch(createAction(AppConstants.APP.RULES.GET_SUCCESS, res, null));
			})
			.catch((error) => {
				dispatch(createAction(AppConstants.APP.RULES.GET_ERROR, null, error));
			});
	};
}

export function getScriptRule(scriptId) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.SCRIPT_RULES.GET));
		return fetchScriptRule(scriptId)
			.then((res) => {
				return dispatch(createAction(AppConstants.APP.SCRIPT_RULES.GET_SUCCESS, res, null));
			})
			.catch((error) => {
				return dispatch(createAction(AppConstants.APP.SCRIPT_RULES.GET_ERROR, null, error));
			});
	};
}

export function validateScript(requestBody) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.SCRIPT_RULES.VALIDATE));
		return validateScriptRule(requestBody)
			.then((res) => {
				return dispatch(
					createAction(AppConstants.APP.SCRIPT_RULES.VALIDATE_SUCCESS, res, null),
				);
			})
			.catch((error) => {
				return dispatch(
					createAction(AppConstants.APP.SCRIPT_RULES.VALIDATE_ERROR, null, error),
				);
			});
	};
}

export function clearValidatedScriptRule() {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.SCRIPT_RULES.VALIDATE_SUCCESS, '', null));
		dispatch(createAction(AppConstants.APP.SCRIPT_RULES.VALIDATE_ERROR, '', null));
	};
}

export function reorderRules({ toBePromoted, toBeDemoted }) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.RULES.REORDER, { toBePromoted }));
		const promotePromise = updateRule(toBePromoted);
		return Promise.all([promotePromise])
			.then(() => {
				dispatch(
					createAction(
						AppConstants.APP.RULES.REORDER_SUCCESS,
						{ toBePromoted },
						null,
					),
				);
			})
			.catch((error) =>
				dispatch(
					createAction(
						AppConstants.APP.RULES.REORDER_ERROR,
						{ toBePromoted, toBeDemoted },
						error,
					),
				),
			);
	};
}

export function deleteRule(id) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.RULES.DELETE, { id }));
		return removeRule(id)
			.then(() => {
				dispatch(createAction(AppConstants.APP.RULES.DELETE_SUCCESS, { id }, null));
			})
			.catch((error) =>
				dispatch(createAction(AppConstants.APP.RULES.DELETE_ERROR, { id }, error)),
			);
	};
}

export function toggleRuleStatus(rule) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.RULES.TOGGLE_STATUS, { ...rule }));
		return updateRule(rule)
			.then(() => {
				dispatch(
					createAction(AppConstants.APP.RULES.TOGGLE_STATUS_SUCCESS, { ...rule }, null),
				);
			})
			.catch((error) =>
				dispatch(
					createAction(AppConstants.APP.RULES.TOGGLE_STATUS_ERROR, { ...rule }, error),
				),
			);
	};
}

export function addQueryRule(rule) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.RULES.CREATE, { ...rule }));
		return createRule(rule)
			.then((data) =>
				dispatch(createAction(AppConstants.APP.RULES.CREATE_SUCCESS, { ...data }, null)),
			)
			.catch((error) =>
				dispatch(createAction(AppConstants.APP.RULES.CREATE_ERROR, null, error)),
			);
	};
}

export function cloneQueryRule(rule, newRule) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.RULES.CLONE, { ...rule }));
		return createRule(newRule)
			.then((data) => {
				dispatch(
					createAction(AppConstants.APP.RULES.CLONE_SUCCESS, { ...data }, null, {
						...rule,
					}),
				);
			})
			.catch((error) =>
				dispatch(createAction(AppConstants.APP.RULES.CLONE_ERROR, { ...rule }, error)),
			);
	};
}

export function putRule(rule) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.RULES.UPDATE_RULE, { ...rule }));
		return updateRule(rule)
			.then(() =>
				dispatch(
					createAction(AppConstants.APP.RULES.UPDATE_RULE_SUCCESS, { ...rule }, null),
				),
			)
			.catch((error) =>
				dispatch(
					createAction(AppConstants.APP.RULES.UPDATE_RULE_ERROR, { ...rule }, error),
				),
			);
	};
}
