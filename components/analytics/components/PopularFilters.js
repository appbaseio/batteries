import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { withRouter } from 'react-router-dom';
import Searches from './Searches';
import Filter from './Filter';
import { getPopularFilters, popularFiltersFull, exportCSVFile, applyFilterParams } from '../utils';
import Loader from '../../shared/Loader/Spinner';
import { setSearchState } from '../../../modules/actions/app';
import { setFilterValue } from '../../../modules/actions';
import { withErrorToaster } from '../../shared/ErrorToaster/ErrorToaster';
import SummaryStats from './Summary/SummaryStats';

const headers = {
	key: 'Filters',
	count: 'Count',
	// clicks: 'Clicks',
	// conversionrate: 'Conversion Rate',
};

class PopularFilters extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isFetching: false,
			popularFilters: null,
		};
	}

	componentDidMount() {
		const { filterId, filters, selectFilterValue } = this.props;
		applyFilterParams({
			filters,
			callback: this.fetchPopularFilters,
			filterId,
			applyFilter: selectFilterValue,
		});
	}

	componentDidUpdate(prevProps) {
		const { filters } = this.props;
		if (filters && JSON.stringify(prevProps.filters) !== JSON.stringify(filters)) {
			this.fetchPopularFilters();
		}
	}

	fetchPopularFilters = () => {
		const { appName, filters } = this.props;
		this.setState({
			isFetching: true,
		});
		getPopularFilters(appName, undefined, undefined, filters)
			.then((res) => {
				this.setState({
					popularFilters: res,
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
		const { isFetching, popularFilters } = this.state;
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
								label: 'Total Filters',
								value: get(popularFilters, 'total_filters'),
							},
							{
								label: 'Total Selections',
								value: get(popularFilters, 'total_selections'),
							},
							{
								label: 'Clicks',
								value: get(popularFilters, 'total_clicks'),
							},
							{
								label: 'Avg. Click Rate',
								value: get(popularFilters, 'avg_click_rate'),
							},
							{
								label: 'Avg. Click Position',
								value: get(popularFilters, 'avg_click_position'),
							},
							{
								label: 'Avg. Conversion Rate',
								value: get(popularFilters, 'avg_conversion_rate'),
							},
						]}
					/>
				) : null}
				<Searches
					tableProps={{
						scroll: { x: 700 },
					}}
					showViewOption={false}
					columns={popularFiltersFull(plan, displayReplaySearch)}
					dataSource={(get(popularFilters, 'popular_filters') || []).map((item) => ({
						...item,
						handleReplaySearch: this.handleReplaySearch,
					}))}
					title="Popular Filters"
					pagination={{
						pageSize: 10,
					}}
					onClickDownload={() =>
						exportCSVFile(
							headers,
							(get(popularFilters, 'popular_filters') || []).map((item) => ({
								key: item.key.replace(/,/g, ''),
								count: item.count,
								clicks: item.clicks || '-',
								conversionrate: item.conversionrate || '-',
							})),
							'popular_results',
						)
					}
				/>
			</React.Fragment>
		);
	}
}

PopularFilters.defaultProps = {
	handleReplayClick: undefined,
	displayReplaySearch: false,
	displaySummaryStats: false,
	filterId: undefined,
	filters: undefined,
};

PopularFilters.propTypes = {
	plan: PropTypes.string.isRequired,
	filterId: PropTypes.string,
	filters: PropTypes.object,
	appName: PropTypes.string.isRequired,
	displayReplaySearch: PropTypes.bool,
	displaySummaryStats: PropTypes.bool,
	saveState: PropTypes.func.isRequired,
	handleReplayClick: PropTypes.func,
	history: PropTypes.object.isRequired,
	selectFilterValue: PropTypes.func.isRequired,
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
	connect(mapStateToProps, mapDispatchToProps)(withRouter(PopularFilters)),
);
