import React from 'react';
import { Card } from 'antd';
import { css } from 'react-emotion';
import { BarChart, XAxis, YAxis, Bar, Label, Tooltip } from 'recharts';
import find from 'lodash/find';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import Filter from '../Filter';
import Loader from '../../../shared/Loader/Spinner';
import EmptyData from '../../../shared/EmptyData';
import { getAppSearchLatency, setFilterValue } from '../../../../modules/actions';
import { getAppSearchLatencyByName } from '../../../../modules/selectors';
import { applyFilterParams } from '../../utils';
import { withErrorToaster } from '../../../shared/ErrorToaster/ErrorToaster';
import SummaryStats from '../Summary/SummaryStats';

const getSearchLatencyDummy = (latency = []) => {
	const dummyLatency = latency.filter((l) => l.count > 0);
	let count = 0;
	while (dummyLatency.length < 11) {
		const key = count * 10;
		const isPresent = find(latency, (o) => o.key === key);
		if (!isPresent) {
			dummyLatency.push({
				key,
				count: 0,
			});
		}
		count += 1;
	}
	return dummyLatency;
};

const cls = css`
	width: 100%;
`;

class SearchLatency extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			width: undefined,
		};
	}

	componentDidMount() {
		const { fetchAppSearchLatency, filterId, selectFilterValue, filters } = this.props;
		this.setState({
			width: this.child.parentNode.clientWidth - 60,
		});
		applyFilterParams({
			filters,
			callback: fetchAppSearchLatency,
			filterId,
			applyFilter: selectFilterValue,
		});
	}

	shouldComponentUpdate(oldProps) {
		const { isInsightsSidebarOpen } = this.props;
		if (isInsightsSidebarOpen !== oldProps.isInsightsSidebarOpen) {
			return false;
		}

		return true;
	}

	componentDidUpdate(prevProps) {
		const { filters, fetchAppSearchLatency } = this.props;
		if (filters && prevProps.filters !== filters) {
			fetchAppSearchLatency();
		}
	}

	handleBarClick = (payload) => {
		const { onClickBar } = this.props;
		if (onClickBar) {
			onClickBar(payload);
		}
	};

	render() {
		const {
			searchLatency,
			isLoading,
			success,
			filterId,
			displayFilter,
			style,
			displaySummaryStats,
			totalSearches,
			avgSearchLatency,
		} = this.props;
		const { width } = this.state;
		return (
			<div
				ref={(c) => {
					this.child = c;
				}}
				css="width: 100%"
			>
				{displayFilter && filterId && <Filter hideCustomEvents filterId={filterId} />}
				{!isLoading && displaySummaryStats ? (
					<SummaryStats
						summaryConfig={[
							{
								label: 'Total Searches',
								value: totalSearches,
							},
							{
								label: 'Avg. Search Latency',
								value: `${avgSearchLatency} (in ms)`,
							},
						]}
					/>
				) : null}
				<Card title="Search Latency" css={cls} style={style}>
					{isLoading ? (
						<Loader />
					) : (
						(success && !searchLatency.length && <EmptyData css="height: 400px" />) || (
							<BarChart
								margin={{
									top: 20,
									right: 50,
									bottom: 20,
									left: 20,
								}}
								barCategoryGap={0}
								width={width}
								height={400}
								data={getSearchLatencyDummy(searchLatency)}
							>
								<XAxis dataKey="key">
									<Label value="Latency (in ms)" position="bottom" />
								</XAxis>
								<YAxis allowDecimals={false}>
									<Label value="Search Count" angle={-90} position="left" />
								</YAxis>
								<Tooltip
									labelFormatter={(label) =>
										`Latency (in ms) : ${label} - ${label + 10}`
									}
									formatter={(value) => {
										return [value, 'Requests'];
									}}
									cursor={{ fill: '#dce6f7' }}
								/>
								<Bar
									onClick={this.handleBarClick}
									style={{
										cursor: 'pointer',
									}}
									dataKey="count"
									fill="#6CA4FF"
									stroke="#1A62FF"
									minPointSize={10}
								/>
							</BarChart>
						)
					)}
				</Card>
			</div>
		);
	}
}

SearchLatency.defaultProps = {
	filterId: undefined,
	filters: undefined,
	displayFilter: true,
	style: undefined,
	onClickBar: undefined,
	displaySummaryStats: false,
	totalSearches: 0,
	avgSearchLatency: 0,
};

SearchLatency.propTypes = {
	displayFilter: PropTypes.bool,
	filterId: PropTypes.string,
	filters: PropTypes.object,
	style: PropTypes.object,
	fetchAppSearchLatency: PropTypes.func.isRequired,
	searchLatency: PropTypes.array.isRequired,
	isLoading: PropTypes.bool.isRequired,
	success: PropTypes.bool.isRequired,
	isInsightsSidebarOpen: PropTypes.bool.isRequired,
	selectFilterValue: PropTypes.func.isRequired,
	onClickBar: PropTypes.func,
	displaySummaryStats: PropTypes.bool,
	totalSearches: PropTypes.number,
	avgSearchLatency: PropTypes.number,
};
const mapStateToProps = (state, props) => {
	const searchLatency = getAppSearchLatencyByName(state);
	return {
		searchLatency: get(searchLatency, 'latencies', []),
		totalSearches: get(searchLatency, 'total_searches', []),
		avgSearchLatency: get(searchLatency, 'avg_search_latency', []),
		isLoading: get(state, '$getAppSearchLatency.isFetching'),
		success: get(state, '$getAppSearchLatency.success'),
		isSearchLatencyPresent: !!searchLatency,
		filters: get(state, `$getSelectedFilters.${props.filterId}`),
		isInsightsSidebarOpen: get(state, '$getAppAnalyticsInsights.isOpen', false),
	};
};
const mapDispatchToProps = (dispatch, props) => ({
	fetchAppSearchLatency: (appName) => dispatch(getAppSearchLatency(appName, props.filterId)),
	selectFilterValue: (filterId, filterKey, filterValue) =>
		dispatch(setFilterValue(filterId, filterKey, filterValue)),
});
export default withErrorToaster(connect(mapStateToProps, mapDispatchToProps)(SearchLatency));
