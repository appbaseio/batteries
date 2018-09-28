import React from 'react';
import { Icon, Spin } from 'antd';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Flex from '../shared/Flex';
import Analytics from './components/Analytics';
import { getAppAnalytics } from '../../modules/actions';
import { getAppPlanByName, getAppAnalyticsByName } from '../../modules/selectors';
import RequestLogs from './components/RequestLogs';

class Main extends React.Component {
	componentDidMount() {
		// Comment out the below code to test paid user
		const { fetchAppAnalytics } = this.props;
		fetchAppAnalytics();
	}

	viewAll = (src) => {
		window.location = src;
	};

	render() {
		const {
			noResults,
			popularSearches,
			searchVolume,
			popularResults,
			popularFilters,
			isFetching,
		} = this.props;
		const { appName, chartWidth, plan } = this.props;
		if (isFetching) {
			const antIcon = (
				<Icon type="loading" style={{ fontSize: 50, marginTop: '250px' }} spin />
			);
			return (
				<Flex justifyContent="center" alignItems="center">
					<Spin indicator={antIcon} />
				</Flex>
			);
		}
		return (
			<React.Fragment>
				<Analytics
					loading={isFetching}
					noResults={noResults}
					chartWidth={chartWidth}
					plan={plan}
					popularSearches={popularSearches}
					popularFilters={popularFilters}
					popularResults={popularResults}
					searchVolume={searchVolume}
					redirectTo={link => this.viewAll(link)}
				/>
				<div css="margin-top: 20px">
					<RequestLogs appName={appName} />
				</div>
			</React.Fragment>
		);
	}
}
Main.defaultProps = {
	chartWidth: undefined,
};
Main.propTypes = {
	appName: PropTypes.string.isRequired,
	chartWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	plan: PropTypes.string.isRequired,
	fetchAppAnalytics: PropTypes.func.isRequired,
	popularSearches: PropTypes.array.isRequired,
	popularResults: PropTypes.array.isRequired,
	popularFilters: PropTypes.array.isRequired,
	searchVolume: PropTypes.array.isRequired,
	noResults: PropTypes.array.isRequired,
	isFetching: PropTypes.bool.isRequired,
};
const mapStateToProps = (state) => {
	const appPlan = getAppPlanByName(state);
	const appAnalytics = getAppAnalyticsByName(state);
	return {
		plan: get(appPlan, 'plan'),
		appName: get(state, '$getCurrentApp.name'),
		popularSearches: get(appAnalytics, 'popularSearches', []),
		popularResults: get(appAnalytics, 'popularResults', []),
		popularFilters: get(appAnalytics, 'popularFilters', []),
		searchVolume: get(appAnalytics, 'searchVolume', []),
		noResults: get(appAnalytics, 'noResultSearches', []),
		isFetching: get(state, '$getAppAnalytics.isFetching'),
	};
};
const mapDispatchToProps = dispatch => ({
	fetchAppAnalytics: (appName, plan) => dispatch(getAppAnalytics(appName, plan)),
});
export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(Main);
