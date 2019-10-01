import get from 'lodash/get';
import { createAction } from './utils';
import AppConstants from '../constants';
import { doGet } from '../../utils/requestService';
import { getURL } from '../../../constants/config';
import { getApp } from '../../components/analytics/utils';

export function setFilterValue(filterId, filterKey, filterValue) {
	return createAction(AppConstants.APP.FILTER.SET_FILTER_VALUE, {
		filterId,
		filterKey,
		filterValue,
	});
}

export function clearFilterValue(filterId, filterKey) {
	return createAction(AppConstants.APP.FILTER.CLEAR_FILTER_VALUE, {
		filterId,
		filterKey,
	});
}

export function getFilterLabels() {
	return (dispatch) => {
		const ACC_API = getURL();
		dispatch(createAction(AppConstants.APP.FILTER.GET_LABEL));
		return doGet(`${ACC_API}/_analytics/filter-labels`)
			.then(res => dispatch(createAction(AppConstants.APP.FILTER.GET_LABEL_SUCCESS, res)))
			.catch(error => dispatch(createAction(AppConstants.APP.FILTER.GET_LABEL_ERROR, null, error)));
	};
}

export function getFilterValues(label, prefix = '', name) {
	return (dispatch, getState) => {
		const ACC_API = getURL();
		const appName = name || get(getState(), '$getCurrentApp.name');
		dispatch(createAction(AppConstants.APP.FILTER.GET_VALUE));
		return doGet(
			`${ACC_API}/_analytics/${getApp(appName)}filter-values/${label}${
				prefix.trim() ? `?prefix=${prefix}` : ''
			}`,
		)
			.then(res => dispatch(
					createAction(AppConstants.APP.FILTER.GET_VALUE_SUCCESS, res, null, {
						appName: label,
					}),
				))
			.catch(error => dispatch(createAction(AppConstants.APP.FILTER.GET_VALUE_ERROR, null, error)));
	};
}
