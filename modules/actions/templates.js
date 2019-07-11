import get from 'lodash/get';
import { createAction } from './utils';
import AppConstants from '../constants';
import { getURL } from '../../../constants/config';
import { doGet, doPost, doDelete } from '../../utils/requestService';

export function getAppTemplates(name) {
	return (dispatch, getState) => {
		const appName = name || get(getState(), '$getCurrentApp.name', 'default');
		dispatch(createAction(AppConstants.APP.TEMPLATES.GET_ALL));
		const ACC_API = getURL();
		return doGet(`${ACC_API}/_templates`)
			.then(res => dispatch(
					createAction(AppConstants.APP.TEMPLATES.GET_ALL_SUCCESS, res, null, {
						appName,
					}),
				))
			.catch(error => dispatch(createAction(AppConstants.APP.TEMPLATES.GET_ALL_ERROR, null, error)));
	};
}

export function getAppTemplate(templateName) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.TEMPLATES.GET));
		const ACC_API = getURL();
		return doGet(`${ACC_API}/_scripts/${templateName}`)
			.then(res => dispatch(createAction(AppConstants.APP.TEMPLATES.GET_SUCCESS, res)))
			.catch(error => dispatch(createAction(AppConstants.APP.TEMPLATES.GET_ERROR, null, error)));
	};
}

export function saveAppTemplate(templateName, payload) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.TEMPLATES.UPDATE));
		const ACC_API = getURL();
		return doPost(`${ACC_API}/_scripts/${templateName}`, payload)
			.then(res => dispatch(createAction(AppConstants.APP.TEMPLATES.UPDATE_SUCCESS, res)))
			.catch(error => dispatch(createAction(AppConstants.APP.TEMPLATES.UPDATE_ERROR, null, error)));
	};
}

export function deleteAppTemplate(templateName) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.TEMPLATES.DELETE));
		const ACC_API = getURL();
		return doDelete(`${ACC_API}/_scripts/${templateName}`)
			.then(res => dispatch(createAction(AppConstants.APP.TEMPLATES.DELETE_SUCCESS, res)))
			.catch(error => dispatch(createAction(AppConstants.APP.TEMPLATES.DELETE_ERROR, null, error)));
	};
}

export function validateAppTemplate(payload, templateName) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.TEMPLATES.VALIDATE));
		const ACC_API = getURL();
		const url = templateName
			? `${ACC_API}/_render/template/${templateName}`
			: `${ACC_API}/_render/template`;
		return doPost(url, payload, undefined, undefined, [404, 400])
			.then(res => dispatch(createAction(AppConstants.APP.TEMPLATES.VALIDATE_SUCCESS, res)))
			.catch(error => dispatch(createAction(AppConstants.APP.TEMPLATES.VALIDATE_ERROR, null, error)));
	};
}

export function clearAppTemplate() {
	return createAction(AppConstants.APP.TEMPLATES.CLEAR_VALIDATE);
}
