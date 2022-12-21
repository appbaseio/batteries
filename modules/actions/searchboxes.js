import { createAction } from './utils';
import AppConstants from '../constants';
import { getSearchBoxes, getSearchBox, deleteSearchBox, updateSearchBox } from '../../utils/app';

export function saveSearchBox(id, payload, shouldFetchSearchboxes = true) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.UI_BUILDER.SEARCH_BOX.UPDATE, { id, ...payload }));
		return updateSearchBox({ id, searchBoxConfig: payload })
			.then((data) => {
				if (!data.error && shouldFetchSearchboxes) {
					dispatch(fetchSearchBoxes());
				}
				return dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.SEARCH_BOX.UPDATE_SUCCESS,
						{ id, ...data },
						null,
					),
				);
			})
			.catch((error) =>
				dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.SEARCH_BOX.UPDATE_ERROR,
						{ id, ...payload },
						error,
					),
				),
			);
	};
}

export function cloneSearchBox(refSearchBox) {
	return (dispatch) => {
		const cloneId = `${refSearchBox.id}_clone_${new Date().getTime()}`;
		const { id, ...payload } = refSearchBox;
		dispatch(
			createAction(AppConstants.APP.UI_BUILDER.SEARCH_BOX.CLONE, {
				id,
			}),
		);
		return updateSearchBox({ id: cloneId, searchBoxConfig: payload })
			.then(() => {
				dispatch(fetchSearchBoxes());
				return dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.SEARCH_BOX.CLONE_SUCCESS,
						{ id: cloneId, ...payload },
						null,
						{ id },
					),
				);
			})
			.catch((error) => {
				console.log('data cloned error', error);
				return dispatch(
					createAction(AppConstants.APP.UI_BUILDER.SEARCH_BOX.CLONE_ERROR, null, error),
				);
			});
	};
}

export function fetchSearchBoxes() {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.UI_BUILDER.SEARCH_BOXES.GET));
		return getSearchBoxes()
			.then((res) => {
				return dispatch(
					createAction(AppConstants.APP.UI_BUILDER.SEARCH_BOXES.GET_SUCCESS, res, null),
				);
			})
			.catch((error) => {
				dispatch(
					createAction(AppConstants.APP.UI_BUILDER.SEARCH_BOXES.GET_ERROR, null, error),
				);
			});
	};
}

export function fetchSearchBox(id) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.UI_BUILDER.SEARCH_BOX.GET));
		return getSearchBox(id)
			.then((res) => {
				return dispatch(
					createAction(AppConstants.APP.UI_BUILDER.SEARCH_BOX.GET_SUCCESS, res, null),
				);
			})
			.catch((error) => {
				dispatch(
					createAction(AppConstants.APP.UI_BUILDER.SEARCH_BOX.GET_ERROR, null, error),
				);
			});
	};
}

export function removeSearchBox(id, shouldRefetchSearchboxes = true) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.UI_BUILDER.SEARCH_BOX.DELETE, { id }));
		return deleteSearchBox(id)
			.then(() => {
				if (shouldRefetchSearchboxes) {
					dispatch(fetchSearchBoxes());
				}
				return dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.SEARCH_BOX.DELETE_SUCCESS,
						{ id },
						null,
					),
				);
			})
			.catch((error) => {
				return dispatch(
					createAction(
						AppConstants.APP.UI_BUILDER.SEARCH_BOX.DELETE_ERROR,
						{ id },
						error,
					),
				);
			});
	};
}
