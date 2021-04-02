import React from 'react';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import Analytics from './components/Analytics';
import { getAppAnalytics, setSearchState } from '../../modules/actions';

class Main extends React.Component {
	shouldComponentUpdate(oldProps) {
		const { isInsightsSidebarOpen } = this.props;
		if (isInsightsSidebarOpen !== oldProps.isInsightsSidebarOpen) {
			return false;
		}

		return true;
	}

	componentDidUpdate(previousProps) {
		const { filters } = this.props;
		if (filters && JSON.stringify(previousProps.filters) !== JSON.stringify(filters)) {
			this.fetchAnalytics();
		}
	}

	fetchAnalytics = () => {
		const { fetchAppAnalytics } = this.props;
		fetchAppAnalytics();
	};

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
		const { appName, chartWidth, plan } = this.props;
		return (
			<Analytics
				filterId={filterId}
				chartWidth={chartWidth}
				plan={plan}
				onClickViewAll={onClickViewAll}
				displayReplaySearch={displayReplaySearch}
				handleReplaySearch={this.handleReplaySearch}
				appName={appName}
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
	filters: undefined,
	isInsightsSidebarOpen: false,
};
Main.propTypes = {
	appName: PropTypes.string,
	onClickViewAll: PropTypes.object,
	chartWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	plan: PropTypes.string.isRequired,
	displayReplaySearch: PropTypes.bool,
	fetchAppAnalytics: PropTypes.func.isRequired,
	saveState: PropTypes.func.isRequired,
	handleReplayClick: PropTypes.func,
	history: PropTypes.object.isRequired,
	filterId: PropTypes.string,
	filters: PropTypes.object,
	isInsightsSidebarOpen: PropTypes.bool,
};
const mapStateToProps = (state, props) => {
	return {
		plan: 'growth',
		appName: get(state, '$getCurrentApp.name'),
		filters: get(state, `$getSelectedFilters.${props.filterId}`),
		isInsightsSidebarOpen: get(state, '$getAppAnalyticsInsights.isOpen', false),
	};
};
const mapDispatchToProps = (dispatch, props) => ({
	fetchAppAnalytics: (appName) => dispatch(getAppAnalytics(appName, props.filterId)),
	saveState: (state) => dispatch(setSearchState(state)),
});
export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Main));
