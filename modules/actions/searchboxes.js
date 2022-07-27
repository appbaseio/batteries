import { createAction } from './utils';
import AppConstants from '../constants';
import { getSearchBoxes, getSearchBox, deleteSearchBox, updateSearchBox } from '../../utils/app';

export function saveSearchBox(id, payload) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.UI_BUILDERN.SEARCH_BOX.UPDATE, { ...payload }));
		return updateSearchBox({ id, searchBoxConfig: payload })
			.then((data) => {
				dispatch(fetchSearchBoxes());
				return dispatch(
					createAction(
						AppConstants.APP.UI_BUILDERN.SEARCH_BOX.UPDATE_SUCCESS,
						{ id, ...data },
						null,
					),
				);
			})
			.catch((error) =>
				dispatch(
					createAction(AppConstants.APP.UI_BUILDERN.SEARCH_BOX.UPDATE_ERROR, null, error),
				),
			);
	};
}

export function fetchSearchBoxes() {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.UI_BUILDERN.SEARCH_BOXES.GET));
		return getSearchBoxes()
			.then((res) => {
				return dispatch(
					createAction(AppConstants.APP.UI_BUILDERN.SEARCH_BOXES.GET_SUCCESS, res, null),
				);
			})
			.catch((error) => {
				dispatch(
					createAction(AppConstants.APP.UI_BUILDERN.SEARCH_BOXES.GET_ERROR, null, error),
				);
			});
	};
}

export function fetchSearchBox(id) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.UI_BUILDERN.SEARCH_BOX.GET));
		return getSearchBox(id)
			.then((res) => {
				return dispatch(
					createAction(AppConstants.APP.UI_BUILDERN.SEARCH_BOX.GET_SUCCESS, res, null),
				);
			})
			.catch((error) => {
				dispatch(
					createAction(AppConstants.APP.UI_BUILDERN.SEARCH_BOX.GET_ERROR, null, error),
				);
			});
	};
}

export function removeSearchBox(id) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.UI_BUILDERN.SEARCH_BOX.DELETE, { id }));
		return deleteSearchBox(id)
			.then(() => {
				dispatch(fetchSearchBoxes());
				return dispatch(
					createAction(
						AppConstants.APP.UI_BUILDERN.SEARCH_BOX.DELETE_SUCCESS,
						{ id },
						null,
					),
				);
			})
			.catch((error) =>
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDERN.SEARCH_BOX.DELETE_ERROR,
						{ id },
						error,
					),
				),
			);
	};
}
