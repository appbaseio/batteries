import get from 'lodash/get';
import { createAction } from './utils';
import AppConstants from '../constants';
import { doGet } from '../../utils/requestService';
import { getURL } from '../../../constants/config';
import { getApp, ANALYTICS_ROOT_FILTER_ID } from '../../components/analytics/utils';

export function setFilterValue(filterId, filterKey, filterValue) {
	return createAction(AppConstants.APP.FILTER.SET_FILTER_VALUE, {
		filterId,
		filterKey,
		filterValue,
	});
}

export function initializeFilter(filterId, initializerId = ANALYTICS_ROOT_FILTER_ID) {
	return (dispatch, getState) => {
		const filterValues = get(getState(), `$getSelectedFilters.${initializerId}`);
		dispatch(
			createAction(AppConstants.APP.FILTER.INITIALIZE_FILTER_VALUE, {
				filterId,
				filterValue: filterValues,
			}),
		);
	};
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
			.then((res) => dispatch(createAction(AppConstants.APP.FILTER.GET_LABEL_SUCCESS, res)))
			.catch((error) =>
				dispatch(createAction(AppConstants.APP.FILTER.GET_LABEL_ERROR, null, error)),
			);
	};
}

export function getFilterValues(label, prefix = '', name) {
	return (dispatch, getState) => {
		const ACC_API = getURL();
		const appName = name || get(getState(), '$getCurrentApp.name');
		dispatch(createAction(AppConstants.APP.FILTER.GET_VALUE));
		return doGet(
			`${ACC_API}/_analytics/${getApp(appName)}filter-values/${label}${
				prefix.trim() ? `?prefix=${encodeURIComponent(prefix)}` : ''
			}`,
		)
			.then((res) =>
				dispatch(
					createAction(AppConstants.APP.FILTER.GET_VALUE_SUCCESS, res, null, {
						appName: label,
					}),
				),
			)
			.catch((error) =>
				dispatch(createAction(AppConstants.APP.FILTER.GET_VALUE_ERROR, null, error)),
			);
	};
}
