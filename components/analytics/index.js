import React from 'react';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import Analytics from './components/Analytics';
import { setSearchState } from '../../modules/actions';

class Main extends React.Component {
	shouldComponentUpdate(oldProps) {
		const { isInsightsSidebarOpen } = this.props;
		if (isInsightsSidebarOpen !== oldProps.isInsightsSidebarOpen) {
			return false;
		}

		return true;
	}

	handleReplaySearch = (searchState) => {
		const { saveState, history, appName, handleReplayClick } = this.props;
		saveState(searchState);
		if (handleReplayClick) {
			handleReplayClick(appName);
		} else {
			history.push(`/app/${appName}/search-preview`);
		}
	};

	render() {
		const { onClickViewAll, displayReplaySearch, filterId } = this.props;
		const { appName, chartWidth, plan, history } = this.props;
		return (
			<Analytics
				filterId={filterId}
				chartWidth={chartWidth}
				plan={plan}
				onClickViewAll={onClickViewAll}
				displayReplaySearch={displayReplaySearch}
				handleReplaySearch={this.handleReplaySearch}
				appName={appName}
				history={history}
			/>
		);
	}
}
Main.defaultProps = {
	chartWidth: undefined,
	appName: undefined,
	handleReplayClick: undefined,
	onClickViewAll: null,
	displayReplaySearch: false,
	filterId: undefined,
	isInsightsSidebarOpen: false,
};
Main.propTypes = {
	appName: PropTypes.string,
	onClickViewAll: PropTypes.object,
	chartWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	plan: PropTypes.string.isRequired,
	displayReplaySearch: PropTypes.bool,
	saveState: PropTypes.func.isRequired,
	handleReplayClick: PropTypes.func,
	history: PropTypes.object.isRequired,
	filterId: PropTypes.string,
	isInsightsSidebarOpen: PropTypes.bool,
};
const mapStateToProps = (state) => {
	return {
		plan: 'growth',
		appName: get(state, '$getCurrentApp.name'),
		isInsightsSidebarOpen: get(state, '$getAppAnalyticsInsights.isOpen', false),
	};
};
const mapDispatchToProps = (dispatch) => ({
	saveState: (state) => dispatch(setSearchState(state)),
});
export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Main));
