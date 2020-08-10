import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import get from 'lodash/get';
import ViewSource from './ViewSource';
import Filter from './Filter';
import Searches from './Searches';
import { getPopularResults, popularResultsFull, exportCSVFile, applyFilterParams } from '../utils';
import Loader from '../../shared/Loader/Spinner';
import { setSearchState } from '../../../modules/actions/app';
import { setFilterValue } from '../../../modules/actions';
import { withErrorToaster } from '../../shared/ErrorToaster/ErrorToaster';
import SummaryStats from './Summary/SummaryStats';

const headers = {
	key: 'Results',
	count: 'Impressions',
	// clicks: 'Clicks',
	// clickposition: 'Click Position',
	// conversionrate: 'Conversion Rate',
};

class PopularResults extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isFetching: false,
			popularResults: null,
		};
	}

	componentDidMount() {
		const { filterId, filters, selectFilterValue } = this.props;
		applyFilterParams({
			filters,
			callback: this.fetchPopularResults,
			filterId,
			applyFilter: selectFilterValue,
		});
	}

	componentDidUpdate(prevProps) {
		const { filters } = this.props;
		if (filters && JSON.stringify(prevProps.filters) !== JSON.stringify(filters)) {
			this.fetchPopularResults();
		}
	}

	fetchPopularResults = () => {
		const { appName, filters } = this.props;
		this.setState({
			isFetching: true,
		});
		getPopularResults(appName, undefined, undefined, filters)
			.then((res) => {
				this.setState({
					popularResults: res,
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
		const { isFetching, popularResults } = this.state;
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
								label: 'Total Results',
								value: get(popularResults, 'total_results'),
							},
							{
								label: 'Total Impressions',
								value: get(popularResults, 'total_impressions'),
							},
							{
								label: 'Clicks',
								value: get(popularResults, 'total_clicks'),
							},
							{
								label: 'Avg. Click Position',
								value: get(popularResults, 'avg_click_position'),
							},
							{
								label: 'Avg. Click Rate',
								value: get(popularResults, 'avg_click_rate'),
							},
							{
								label: 'Avg. Conversion Rate',
								value: get(popularResults, 'avg_conversion_rate'),
							},
						]}
					/>
				) : null}
				<Searches
					tableProps={{
						scroll: { x: 1000 },
					}}
					showViewOption={false}
					columns={popularResultsFull(plan, displayReplaySearch, ViewSource)}
					dataSource={(get(popularResults, 'popular_results') || []).map((item) => ({
						...item,
						handleReplaySearch: this.handleReplaySearch,
					}))}
					title="Popular Results"
					pagination={{
						pageSize: 10,
					}}
					onClickDownload={() =>
						exportCSVFile(
							headers,
							(get(popularResults, 'popular_results') || []).map((item) => ({
								key: item.key,
								count: item.count,
								clicks: item.clicks || '-',
								clickposition: item.clickposition || '-',
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

PopularResults.defaultProps = {
	handleReplayClick: undefined,
	displayReplaySearch: false,
	displaySummaryStats: false,
	filterId: undefined,
	filters: undefined,
};

PopularResults.propTypes = {
	filterId: PropTypes.string,
	filters: PropTypes.object,
	plan: PropTypes.string.isRequired,
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
	connect(mapStateToProps, mapDispatchToProps)(withRouter(PopularResults)),
);
