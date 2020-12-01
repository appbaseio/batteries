import constants from '../constants';

const reIndexingTasks = (state = [], action) => {
	switch (action.type) {
		case constants.APP.SEARCH_SETTINGS.SET_RE_INDEXING_TASKS:
			return [...action.data];

		case constants.APP.SEARCH_SETTINGS.ADD_RE_INDEXING_TASKS:
			return [...state, action.data];
		default:
			return state;
	}
};

export default reIndexingTasks;
