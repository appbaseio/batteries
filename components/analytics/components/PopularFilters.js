import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { withRouter } from 'react-router-dom';
import { Table } from 'antd';
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

const groupBy = (collection, property) => {
	let i = 0;
	let val;
	let index;
	const values = [];
	const result = [];
	for (; i < collection.length; i += 1) {
		val = collection[i][property];
		index = values.indexOf(val);
		if (index > -1) result[index].push(collection[i]);
		else {
			values.push(val);
			result.push([collection[i]]);
		}
	}
	return result;
};

const getNormalizedData = (filtersData = []) => {
	const groupedData = groupBy(filtersData, 'key');
	const normalizedData = [];
	groupedData.forEach((data) => {
		if (data.length) {
			const { key } = data[0];
			let count = 0;
			let clicks = 0;
			let clickRate = 0;
			let clickPosition = 0;
			let clickPositionCount = 0;
			let conversions = 0;
			let conversionRate = 0;

			data.forEach((item) => {
				count += item.count;
				clicks += item.clicks;
				clickPosition += item.click_position;
				if (item.click_position) {
					clickPositionCount += 1;
				}
				// Popular filters endpoint doesn't return conversions so calculate it from conversion rate
				conversions += (item.conversion_rate * item.count) / 100;
			});
			if (key) {
				if (count !== 0) {
					clickRate = (clicks / count) * 100;
					conversionRate = (conversions / count) * 100;
				}
				if (clickPositionCount !== 0) {
					clickPosition /= clickPositionCount;
				}
				normalizedData.push({
					key,
					count,
					clicks,
					click_rate: clickRate,
					click_position: clickPosition,
					conversion_rate: conversionRate,
					child: data,
				});
			}
		}
	});
	return normalizedData;
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
		if (filters && prevProps.filters !== filters) {
			this.fetchPopularFilters();
		}
	}

	fetchPopularFilters = () => {
		const { appName, filters, arcVersion } = this.props;
		this.setState({
			isFetching: true,
		});
		getPopularFilters(appName, undefined, undefined, filters, arcVersion)
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
								value: `${get(popularFilters, 'avg_click_rate')}%`,
							},
							{
								label: 'Avg. Click Position',
								value: get(popularFilters, 'avg_click_position'),
							},
							{
								label: 'Avg. Conversion Rate',
								value: `${get(popularFilters, 'avg_conversion_rate')}%`,
							},
						]}
					/>
				) : null}
				<Searches
					tableProps={{
						scroll: { x: 700 },
						expandedRowRender: (record) => {
							return (
								<Table
									columns={popularFiltersFull(plan, displayReplaySearch, true)}
									dataSource={record.child.map((item) => ({
										...item,
										handleReplaySearch: this.handleReplaySearch,
									}))}
									rowKey={(item) => item.key + item.count + item.value}
									pagination={false}
								/>
							);
						},
					}}
					columns={popularFiltersFull(plan, displayReplaySearch)}
					dataSource={getNormalizedData(get(popularFilters, 'popular_filters')).map(
						(item) => ({
							...item,
							handleReplaySearch: this.handleReplaySearch,
						}),
					)}
					title="Popular Filters"
					pagination={{
						pageSize: 10,
						showSizeChanger: false,
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
	arcVersion: PropTypes.string.isRequired,
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
	filters: get(state, `$getSelectedFilters.${props.filterId}`),
	arcVersion: get(state, `$getAppPlan.results.version`),
});

const mapDispatchToProps = (dispatch) => ({
	saveState: (state) => dispatch(setSearchState(state)),
	selectFilterValue: (filterId, filterKey, filterValue) =>
		dispatch(setFilterValue(filterId, filterKey, filterValue)),
});

export default withErrorToaster(
	connect(mapStateToProps, mapDispatchToProps)(withRouter(PopularFilters)),
);
