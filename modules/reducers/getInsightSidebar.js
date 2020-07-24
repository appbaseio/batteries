import get from 'lodash/get';
import AppConstants from '../constants';

const initialSidebarState = {
	isOpen: false,
};

function getInsightSidebar(state = initialSidebarState, action) {
	switch (action.type) {
		case AppConstants.APP.INSIGHTS_SIDEBAR:
			return {
				isOpen: !get(state, 'isOpen'),
			};
		default:
			return state;
	}
}

export default getInsightSidebar;
