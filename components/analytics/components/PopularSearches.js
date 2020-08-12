import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { withRouter } from 'react-router-dom';
import Filter from './Filter';
import Searches from './Searches';
import { popularSearchesFull, exportCSVFile, applyFilterParams } from '../utils';
import { setSearchState } from '../../../modules/actions/app';
import { getAppPopularSearches } from '../../../modules/actions/analytics';
import { getAppPopularSearchesByName } from '../../../modules/selectors';
import Loader from '../../shared/Loader/Spinner';
import { setFilterValue } from '../../../modules/actions';
import SummaryStats from './Summary/SummaryStats';
import { withErrorToaster } from '../../shared/ErrorToaster/ErrorToaster';

const headers = {
	key: 'Search Terms',
	count: 'Total Queries',
	// clicks: 'Clicks',
	// clickposition: 'Click Position',
	// conversionrate: 'Conversion Rate',
};
class PopularSearches extends React.Component {
	componentDidMount() {
		const { filterId, filters, selectFilterValue, isSuccess, popularSearches } = this.props;
		if (
			!isSuccess ||
			// to handle the index switch
			popularSearches === null
		) {
			applyFilterParams({
				filters,
				filterId,
				callback: this.fetchPopularSearches,
				applyFilter: selectFilterValue,
			});
		}
	}

	componentDidUpdate(prevProps) {
		const { filters } = this.props;
		if (filters && JSON.stringify(prevProps.filters) !== JSON.stringify(filters)) {
			this.fetchPopularSearches();
		}
	}

	fetchPopularSearches = () => {
		const { appName, fetchPopularSearches } = this.props;
		fetchPopularSearches(appName);
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
		const {
			plan,
			isLoading,
			displayReplaySearch,
			filterId,
			displaySummaryStats,
			displayFilter,
			popularSearches,
		} = this.props;
		if (isLoading) {
			return <Loader />;
		}
		return (
			<React.Fragment>
				{displayFilter && filterId && <Filter filterId={filterId} />}
				{displaySummaryStats ? (
					<SummaryStats
						summaryConfig={[
							{
								label: 'Total Searches',
								value: get(popularSearches, 'total_searches'),
							},
							{
								label: 'Search Terms',
								value: get(popularSearches, 'total_search_terms'),
							},
							{
								label: 'Clicks',
								value: get(popularSearches, 'total_clicks'),
							},
							{
								label: 'Avg. Click Rate',
								value: get(popularSearches, 'avg_click_rate'),
							},
							{
								label: 'Avg. Click Position',
								value: get(popularSearches, 'avg_click_position'),
							},
							{
								label: 'Avg. Conversion Rate',
								value: get(popularSearches, 'avg_conversion_rate'),
							},
						]}
					/>
				) : null}
				<Searches
					tableProps={{
						scroll: { x: 700 },
					}}
					showViewOption={false}
					columns={popularSearchesFull(plan, displayReplaySearch)}
					dataSource={(get(popularSearches, 'popular_searches') || []).map((item) => ({
						...item,
						handleReplaySearch: this.handleReplaySearch,
					}))}
					title="Popular Searches"
					onClickDownload={() => {
						exportCSVFile(
							headers,
							(get(popularSearches, 'popular_searches') || []).map((item) => ({
								key: item.key,
								count: item.count,
								clicks: item.clicks || '-',
								clickposition: item.clickposition || '-',
								conversionrate: item.conversionrate || '-',
							})),
							'popular_searches',
						);
					}}
					pagination={{
						pageSize: 10,
					}}
				/>
			</React.Fragment>
		);
	}
}
PopularSearches.defaultProps = {
	handleReplayClick: undefined,
	displayReplaySearch: false,
	displaySummaryStats: false,
	displayFilter: false,
	isLoading: false,
	isSuccess: false,
	filterId: undefined,
	popularSearches: null,
	filters: {},
};
PopularSearches.propTypes = {
	plan: PropTypes.string.isRequired,
	popularSearches: PropTypes.object,
	isLoading: PropTypes.bool,
	isSuccess: PropTypes.bool,
	filterId: PropTypes.string,
	displayFilter: PropTypes.bool,
	filters: PropTypes.object,
	fetchPopularSearches: PropTypes.func.isRequired,
	appName: PropTypes.string.isRequired,
	displayReplaySearch: PropTypes.bool,
	saveState: PropTypes.func.isRequired,
	handleReplayClick: PropTypes.func,
	history: PropTypes.object.isRequired,
	selectFilterValue: PropTypes.func.isRequired,
	displaySummaryStats: PropTypes.bool,
};
const mapStateToProps = (state, props) => {
	const popularSearchesRaw = getAppPopularSearchesByName(state);
	return {
		plan: 'growth',
		isLoading: get(state, '$getAppPopularSearches.isFetching'),
		isSuccess: get(state, '$getAppPopularSearches.success'),
		popularSearches: popularSearchesRaw,
		appName: get(state, '$getCurrentApp.name'),
		filters: get(state, `$getSelectedFilters.${props.filterId}`),
	};
};

const mapDispatchToProps = (dispatch, props) => ({
	saveState: (state) => dispatch(setSearchState(state)),
	fetchPopularSearches: (appName, clickAnalytics, size) =>
		dispatch(getAppPopularSearches(appName, clickAnalytics, size, props.filterId)),
	selectFilterValue: (filterId, filterKey, filterValue) =>
		dispatch(setFilterValue(filterId, filterKey, filterValue)),
});

export default withErrorToaster(
	connect(mapStateToProps, mapDispatchToProps)(withRouter(PopularSearches)),
);
