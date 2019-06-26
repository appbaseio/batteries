import get from 'lodash/get';
import { createAction } from './utils';
import AppConstants from '../constants';
import { doGet, doPost, doDelete } from '../../utils/requestService';
import { ACC_API } from '../../utils';

export function getAppTemplates(name) {
	return (dispatch, getState) => {
		const appName = name || get(getState(), '$getCurrentApp.name', 'default');
		dispatch(createAction(AppConstants.APP.TEMPLATES.GET_ALL));
		return doGet(`${ACC_API}/app/${appName}/templates`)
			.then(res => dispatch(
					createAction(AppConstants.APP.TEMPLATES.GET_ALL_SUCCESS, res, null, {
						appName,
					}),
				))
			.catch(error => dispatch(createAction(AppConstants.APP.TEMPLATES.GET_ALL_ERROR, null, error)));
	};
}

export function getAppTemplate(templateName, name) {
	return (dispatch, getState) => {
		const appName = name || get(getState(), '$getCurrentApp.name', 'default');
		dispatch(createAction(AppConstants.APP.TEMPLATES.GET));
		return doGet(`${ACC_API}/app/${appName}/templates/${templateName}`)
			.then(res => dispatch(createAction(AppConstants.APP.TEMPLATES.GET_SUCCESS, res)))
			.catch(error => dispatch(createAction(AppConstants.APP.TEMPLATES.GET_ERROR, null, error)));
	};
}

export function saveAppTemplate(templateName, payload, name) {
	return (dispatch, getState) => {
		const appName = name || get(getState(), '$getCurrentApp.name', 'default');
		dispatch(createAction(AppConstants.APP.TEMPLATES.UPDATE));
		return doPost(`${ACC_API}/app/${appName}/templates/${templateName}`, payload)
			.then(res => dispatch(createAction(AppConstants.APP.TEMPLATES.UPDATE_SUCCESS, res)))
			.catch(error => dispatch(createAction(AppConstants.APP.TEMPLATES.UPDATE_ERROR, null, error)));
	};
}

export function deleteAppTemplate(templateName, name) {
	return (dispatch, getState) => {
		const appName = name || get(getState(), '$getCurrentApp.name', 'default');
		dispatch(createAction(AppConstants.APP.TEMPLATES.DELETE));
		return doDelete(`${ACC_API}/app/${appName}/templates/${templateName}`)
			.then(res => dispatch(createAction(AppConstants.APP.TEMPLATES.DELETE_SUCCESS, res)))
			.catch(error => dispatch(createAction(AppConstants.APP.TEMPLATES.DELETE_ERROR, null, error)));
	};
}
export function validateAppTemplate(payload, templateName, name) {
	return (dispatch, getState) => {
		const appName = name || get(getState(), '$getCurrentApp.name', 'default');
		dispatch(createAction(AppConstants.APP.TEMPLATES.VALIDATE));
		const url = templateName
			? `${ACC_API}/app/${appName}/validatetemplate/${templateName}`
			: `${ACC_API}/app/${appName}/validatetemplate`;
		return doPost(url, payload, undefined, undefined, [404, 400])
			.then(res => dispatch(createAction(AppConstants.APP.TEMPLATES.VALIDATE_SUCCESS, res)))
			.catch(error => dispatch(createAction(AppConstants.APP.TEMPLATES.VALIDATE_ERROR, null, error)));
	};
}

export function clearAppTemplate() {
	return createAction(AppConstants.APP.TEMPLATES.CLEAR_VALIDATE);
}
