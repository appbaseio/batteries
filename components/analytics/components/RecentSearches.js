import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { withRouter } from 'react-router-dom';
import Searches from './Searches';
import Filter from './Filter';
import { exportCSVFile, recentSearchesFull, applyFilterParams } from '../utils';
import { getAppRecentSearches } from '../../../modules/actions/analytics';
import Loader from '../../shared/Loader/Spinner';
import { setFilterValue } from '../../../modules/actions';
import { withErrorToaster } from '../../shared/ErrorToaster/ErrorToaster';

const headers = {
	key: 'Search Terms',
	count: 'Total Queries',
};
class RecentSearches extends React.Component {
	componentDidMount() {
		const { filterId, filters, selectFilterValue } = this.props;
		applyFilterParams({
			filters,
			filterId,
			callback: this.fetchRecentSearches,
			applyFilter: selectFilterValue,
		});
	}

	componentDidUpdate(prevProps) {
		const { filters } = this.props;
		if (filters && prevProps.filters !== filters) {
			this.fetchRecentSearches();
		}
	}

	fetchRecentSearches = () => {
		const { appName, fetchRecentSearches } = this.props;
		fetchRecentSearches(appName);
	};

	getSearches = () => {
		const { appName, recentSearches } = this.props;
		if (recentSearches && recentSearches[appName]) {
			return recentSearches[appName];
		}
		if (recentSearches && recentSearches.default) {
			return recentSearches.default;
		}
		return [];
	};

	render() {
		const { displayReplaySearch, plan, filterId, isFetching, recentSearches } = this.props;

		if (isFetching) {
			return <Loader />;
		}

		return (
			<React.Fragment>
				{filterId && <Filter filterId={filterId} />}
				<Searches
					tableProps={{
						scroll: { x: 700 },
					}}
					showViewOption={false}
					dataSource={this.getSearches().map((item) => ({
						...item,
					}))}
					breakWord
					columns={recentSearchesFull(plan, displayReplaySearch)}
					title="Recent Searches"
					pagination={{
						pageSize: 10,
					}}
					onClickDownload={() =>
						exportCSVFile(
							headers,
							(recentSearches || []).map((item) => ({
								key: item.key,
								count: item.count,
							})),
							'recent_searches',
						)
					}
				/>
			</React.Fragment>
		);
	}
}
RecentSearches.defaultProps = {
	appName: undefined,
	displayReplaySearch: false,
	filterId: undefined,
	filters: undefined,
	isFetching: false,
	recentSearches: undefined,
};

RecentSearches.propTypes = {
	plan: PropTypes.string.isRequired,
	filterId: PropTypes.string,
	filters: PropTypes.object,
	appName: PropTypes.string,
	displayReplaySearch: PropTypes.bool,
	fetchRecentSearches: PropTypes.func.isRequired,
	selectFilterValue: PropTypes.func.isRequired,
	isFetching: PropTypes.bool,
	recentSearches: PropTypes.object,
};
const mapStateToProps = (state, props) => ({
	plan: get(state, '$getAppPlan.results.plan'),
	appName: get(state, '$getCurrentApp.name'),
	filters: get(state, `$getSelectedFilters.${props.filterId}`),
	isFetching: get(state, '$getAppRecentSearches.isFetching'),
	recentSearches: get(state, '$getAppRecentSearches.results'),
});

const mapDispatchToProps = (dispatch, props) => ({
	fetchRecentSearches: (appName) => {
		return dispatch(getAppRecentSearches(appName, props.filterId));
	},
	selectFilterValue: (filterId, filterKey, filterValue) =>
		dispatch(setFilterValue(filterId, filterKey, filterValue)),
});

export default withErrorToaster(
	connect(mapStateToProps, mapDispatchToProps)(withRouter(RecentSearches)),
);
