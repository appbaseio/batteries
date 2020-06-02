import React from 'react';
import { Select, Spin, Row, Col, Popover, Button, Icon } from 'antd';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import get from 'lodash/get';
import Flex from '../../../shared/Flex';
import {
	getFilterValues,
	getFilterLabels,
	setFilterValue,
	toggleInsightsSidebar,
} from '../../../../modules/actions';
import SelectedFilters from './SelectedFilters';
import { isValidPlan } from '../../../../utils';

const { Option } = Select;

const dateRangeFilters = {
	'This week': {
		from: moment().startOf('week').format('YYYY/MM/DD'),
		to: moment().format('YYYY/MM/DD'),
	},
	'Last Week': {
		from: moment().subtract(1, 'weeks').startOf('week').format('YYYY/MM/DD'),
		to: moment().subtract(1, 'weeks').endOf('week').format('YYYY/MM/DD'),
	},
	'This Month': {
		from: moment().startOf('month').format('YYYY/MM/DD'),
		to: moment().format('YYYY/MM/DD'),
	},
	'Last Month': {
		from: moment().subtract(1, 'months').startOf('month').format('YYYY/MM/DD'),
		to: moment().subtract(1, 'months').endOf('month').format('YYYY/MM/DD'),
	},
	'Last 7 days': {
		from: moment().subtract(7, 'days').format('YYYY/MM/DD'),
		to: moment().format('YYYY/MM/DD'),
	},
	'Last 30 days': {
		from: moment().subtract(30, 'days').format('YYYY/MM/DD'),
		to: moment().format('YYYY/MM/DD'),
	},
	'Last 60 days': {
		from: moment().subtract(60, 'days').format('YYYY/MM/DD'),
		to: moment().format('YYYY/MM/DD'),
	},
	'Last 90 days': {
		from: moment().subtract(90, 'days').format('YYYY/MM/DD'),
		to: moment().format('YYYY/MM/DD'),
	},
};

const dateRangeColumns = Object.keys(dateRangeFilters).reduce((agg, item, index) => {
	const columnIndex = `col_${Math.floor(index / 4)}`; // 4 is the number of items in a column.
	return {
		...agg,
		[columnIndex]: {
			...get(agg, columnIndex, {}),
			[item]: dateRangeFilters[item],
		},
	};
}, {});

// eslint-disable-next-line
const filterOption = (input, option) =>
	option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;

class Filter extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			displayLabelSelector: false,
			filterKey: undefined,
			dateRangePopover: false,
			selectedDateRange: 'Last 30 days',
		};
		this.filterBy = [
			{
				key: 'custom_event',
				label: 'Custom Event',
			},
			{
				key: 'user_id',
				label: 'User Id',
			},
			{
				key: 'ip',
				label: 'IP address',
			},
		];

		this.currentKeyes = this.filterBy.map((item) => item.key);
	}

	componentDidMount() {
		const {
			fetchFilterLabels,
			isFetchedFilterLabels,
			tier,
			featureCustomEvents,
			selectedFilterValue,
		} = this.props;
		if (!isFetchedFilterLabels) {
			if (isValidPlan(tier, featureCustomEvents)) {
				if (selectedFilterValue) {
					this.setSelectedlabel(selectedFilterValue);
				}
				fetchFilterLabels();
			}
		}
	}

	componentDidUpdate(prevProps) {
		const { selectedFilterValue } = this.props;
		if (JSON.stringify(prevProps.selectedFilterValue) !== JSON.stringify(selectedFilterValue)) {
			this.setSelectedlabel(selectedFilterValue);
		}
	}

	setSelectedlabel = (value) => {
		const { selectedDateRange: prevSelectedRange } = this.state;

		let currentSelectedRange = prevSelectedRange;

		const selectedKeyes = Object.keys(value || {});
		if (Object.keys(value || {}).length === 0) {
			// Reset keyes when all filters are cleared
			this.setState({
				displayLabelSelector: false,
				filterKey: undefined,
				selectedDateRange: 'Last 30 days',
			});
			return;
		}

		const selectedFilter = selectedKeyes.find((item) => this.currentKeyes.includes(item));

		if (typeof value === 'object' && get(value, 'from') && get(value, 'to')) {
			const { from, to } = value;
			const selectedDateRange = Object.keys(dateRangeFilters).find(
				(dateRange) =>
					get(dateRangeFilters, `${dateRange}.from`) === from &&
					get(dateRangeFilters, `${dateRange}.to`) === to,
			);

			currentSelectedRange = selectedDateRange;
		}

		this.setState({
			filterKey: selectedFilter,
			displayLabelSelector: selectedFilter === 'custom_event',
			selectedDateRange: currentSelectedRange,
		});
	};

	handleFilterByChange = (filterBy) => {
		if (filterBy === 'custom_event') {
			this.setState({
				filterKey: filterBy,
				displayLabelSelector: true,
			});
		} else {
			this.setState(
				{
					filterKey: filterBy,
					displayLabelSelector: false,
				},
				this.fetchFilterValue,
			);
		}
	};

	handleFilterLabelChange = (filterLabel) => {
		this.setState(
			{
				filterKey: filterLabel,
			},
			this.fetchFilterValue,
		);
	};

	handleFilterValueChange = (filterValue = '') => {
		const { filterKey } = this.state;
		const { selectFilterValue, filterId } = this.props;
		selectFilterValue(filterId, filterKey, filterValue);
	};

	handleDateRangeChange = (filterValue = '') => {
		const { selectFilterValue, filterId } = this.props;
		const filters = dateRangeFilters[filterValue];
		selectFilterValue(filterId, 'from', filters.from);
		selectFilterValue(filterId, 'to', filters.to);
		this.setState({
			dateRangePopover: false,
			selectedDateRange: filterValue,
		});
	};

	handleDateRangePopover = () => {
		this.setState((state) => ({
			dateRangePopover: !state.dateRangePopover,
		}));
	};

	handleFilterValueSearch = (filterValue) => {
		this.fetchFilterValue(filterValue);
	};

	fetchFilterValue = (filterValue = '') => {
		const { filterKey } = this.state;
		const { fetchFilterValues } = this.props;
		fetchFilterValues(filterKey, filterValue);
	};

	render() {
		const { displayLabelSelector, filterKey, dateRangePopover, selectedDateRange } = this.state;
		const {
			filterLabels,
			isLoadingFilterValues,
			isLoadingFilterLabels,
			filterValues: filterValuesByLabels,
			filterId,
			featureCustomEvents,
			tier,
			toggleInsights,
			hideInsightsButton,
			selectedFilterValue,
		} = this.props;
		if (!isValidPlan(tier, featureCustomEvents)) {
			return null;
		}
		const filterValues = get(filterValuesByLabels, `${filterKey}.filter_values`, []);
		return (
			<Flex flexDirection="column" style={{ paddingBottom: 15 }}>
				<Flex justifyContent="space-between" style={{ flexWrap: 'wrap' }}>
					<Flex style={{ flexWrap: 'wrap' }}>
						<Select
							showSearch
							style={{ width: 150, marginBottom: 15, paddingRight: 15 }}
							placeholder="Filter by"
							value={filterKey}
							optionFilterProp="children"
							onChange={this.handleFilterByChange}
							filterOption={filterOption}
						>
							{this.filterBy.map((filter) => (
								<Option value={filter.key} key={filter.key}>
									{filter.label}
								</Option>
							))}
						</Select>
						{displayLabelSelector && (
							<Select
								showSearch
								style={{ width: 200, paddingRight: 15, marginBottom: 15 }}
								placeholder="Filter label"
								optionFilterProp="children"
								defaultValue={get(selectedFilterValue, filterKey)}
								onChange={this.handleFilterLabelChange}
								notFoundContent={
									isLoadingFilterLabels ? <Spin size="small" /> : 'No label found'
								}
								filterOption={filterOption}
							>
								{filterLabels.map((filter) => (
									<Option value={filter} key={filter}>
										{filter}
									</Option>
								))}
							</Select>
						)}
						{filterKey && filterKey !== 'custom_event' && (
							<Select
								key={filterKey}
								showSearch
								style={{
									width: 200,
									paddingRight: 15,
									marginBottom: 15,
								}}
								defaultValue={get(selectedFilterValue, filterKey)}
								placeholder="Filter value"
								optionFilterProp="children"
								notFoundContent={
									isLoadingFilterValues ? <Spin size="small" /> : 'No value found'
								}
								onSearch={this.handleFilterValueSearch}
								onChange={this.handleFilterValueChange}
								filterOption={filterOption}
							>
								{filterValues.map((value) => (
									<Option value={value} key={value}>
										{value}
									</Option>
								))}
							</Select>
						)}
					</Flex>
					<Flex>
						<Popover
							visible={dateRangePopover}
							trigger="click"
							content={
								<Row style={{ width: 300 }} gutter={[8, 8]}>
									{Object.keys(dateRangeColumns).map((column) => (
										<Col key={column} md={12} span={12}>
											{Object.keys(get(dateRangeColumns, column, {})).map(
												(rangeLabel, index) => (
													<Button
														key={rangeLabel}
														block
														style={{
															marginBottom: index !== 3 ? 8 : 0,
														}}
														type={
															selectedDateRange === rangeLabel
																? 'primary'
																: 'default'
														}
														onClick={() =>
															this.handleDateRangeChange(rangeLabel)
														}
													>
														{rangeLabel}
													</Button>
												),
											)}
										</Col>
									))}
								</Row>
							}
							placement="leftTop"
						>
							<Button onClick={this.handleDateRangePopover}>
								<Icon type="clock-circle" />
								{selectedDateRange}
							</Button>
						</Popover>
						{hideInsightsButton ? null : (
							<Button onClick={toggleInsights} style={{ marginLeft: 15 }}>
								<Icon type="bar-chart" />
								Insights
							</Button>
						)}
					</Flex>
				</Flex>
				<SelectedFilters filterId={filterId} />
			</Flex>
		);
	}
}

Filter.defaultProps = {
	filterValues: undefined,
	selectedFilterValue: null,
	filterLabels: [],
	hideInsightsButton: false,
};

Filter.propTypes = {
	tier: PropTypes.string.isRequired,
	filterId: PropTypes.string.isRequired,
	selectFilterValue: PropTypes.func.isRequired,
	fetchFilterValues: PropTypes.func.isRequired,
	isLoadingFilterValues: PropTypes.bool.isRequired,
	filterValues: PropTypes.object,
	selectedFilterValue: PropTypes.object,
	fetchFilterLabels: PropTypes.func.isRequired,
	isLoadingFilterLabels: PropTypes.bool.isRequired,
	featureCustomEvents: PropTypes.bool.isRequired,
	isFetchedFilterLabels: PropTypes.bool.isRequired,
	hideInsightsButton: PropTypes.bool,
	filterLabels: PropTypes.array,
	toggleInsights: PropTypes.func.isRequired,
};

const mapStateToProps = (state, props) => ({
	isLoadingFilterValues: get(state, '$getFilterValues.isFetching'),
	filterValues: get(state, '$getFilterValues.results'),
	selectedFilterValue: props.filterId
		? get(state, `$getSelectedFilters.${props.filterId}`, null)
		: null,
	tier: get(state, '$getAppPlan.results.tier'),
	featureCustomEvents: get(state, '$getAppPlan.results.feature_custom_events', false),
	isLoadingFilterLabels: get(state, '$getFilterLabels.isFetching'),
	isFetchedFilterLabels: get(state, '$getFilterLabels.results.success', false),
	filterLabels: get(state, '$getFilterLabels.results.filter_labels'),
});

const mapDispatchToProps = (dispatch) => ({
	fetchFilterValues: (label, prefix) => dispatch(getFilterValues(label, prefix)),
	fetchFilterLabels: () => dispatch(getFilterLabels()),
	toggleInsights: () => dispatch(toggleInsightsSidebar()),
	selectFilterValue: (filterId, filterKey, filterValue) =>
		dispatch(setFilterValue(filterId, filterKey, filterValue)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Filter);
