import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { withRouter } from 'react-router-dom';
import Filter from './Filter';
import Searches from './Searches';
import {
	getPopularSearches,
	popularSearchesFull,
	exportCSVFile,
	applyFilterParams,
} from '../utils';
import { setSearchState } from '../../../modules/actions/app';
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
	constructor(props) {
		super(props);
		this.state = {
			isFetching: false,
			popularSearches: null,
		};
	}

	componentDidMount() {
		const { filterId, filters, selectFilterValue } = this.props;
		applyFilterParams({
			filters,
			filterId,
			callback: this.fetchPopularSearches,
			applyFilter: selectFilterValue,
		});
	}

	componentDidUpdate(prevProps) {
		const { filters } = this.props;
		if (filters && JSON.stringify(prevProps.filters) !== JSON.stringify(filters)) {
			this.fetchPopularSearches();
		}
	}

	fetchPopularSearches = () => {
		const { appName, filters } = this.props;
		this.setState({
			isFetching: true,
		});
		getPopularSearches(appName, undefined, undefined, filters)
			.then((res) => {
				this.setState({
					popularSearches: res,
					isFetching: false,
				});
			})
			.catch(() => {
				this.setState({
					isFetching: false,
				});
			});
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
		const { isFetching, popularSearches } = this.state;
		const { plan, displayReplaySearch, filterId, displaySummaryStats } = this.props;

		if (isFetching) {
			return <Loader />;
		}
		return (
			<React.Fragment>
				{filterId && <Filter filterId={filterId} />}
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
								label: 'Avg. Click Position',
								value: get(popularSearches, 'avg_click_position'),
							},
							{
								label: 'Avg. Click Rate',
								value: get(popularSearches, 'avg_click_rate'),
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
	filterId: undefined,
	filters: undefined,
};
PopularSearches.propTypes = {
	plan: PropTypes.string.isRequired,
	filterId: PropTypes.string,
	filters: PropTypes.object,
	appName: PropTypes.string.isRequired,
	displayReplaySearch: PropTypes.bool,
	saveState: PropTypes.func.isRequired,
	handleReplayClick: PropTypes.func,
	history: PropTypes.object.isRequired,
	selectFilterValue: PropTypes.func.isRequired,
	displaySummaryStats: PropTypes.bool,
};
const mapStateToProps = (state, props) => ({
	plan: 'growth',
	appName: get(state, '$getCurrentApp.name'),
	filters: get(state, `$getSelectedFilters.${props.filterId}`, {}),
});

const mapDispatchToProps = (dispatch) => ({
	saveState: (state) => dispatch(setSearchState(state)),
	selectFilterValue: (filterId, filterKey, filterValue) =>
		dispatch(setFilterValue(filterId, filterKey, filterValue)),
});

export default withErrorToaster(
	connect(mapStateToProps, mapDispatchToProps)(withRouter(PopularSearches)),
);
