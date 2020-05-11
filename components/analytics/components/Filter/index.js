import React from 'react';
import { Select, Spin, Row, Col, Popover, Button, Icon } from 'antd';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import get from 'lodash/get';
import Flex from '../../../shared/Flex';
import { getFilterValues, getFilterLabels, setFilterValue } from '../../../../modules/actions';
import SelectedFilters from './SelectedFilters';
import { isValidPlan } from '../../../../utils';

const { Option } = Select;

const dateRangeFilters = {
	'This week': {
		from: moment().subtract(7, 'days').format('YYYY/MM/DD'),
		to: moment().format('YYYY/MM/DD'),
	},
	'Last Week': {
		from: moment().subtract(14, 'days').format('YYYY/MM/DD'),
		to: moment().subtract(7, 'days').format('YYYY/MM/DD'),
	},
	'This Month': {
		from: moment().subtract(30, 'days').format('YYYY/MM/DD'),
		to: moment().format('YYYY/MM/DD'),
	},
	'Last Month': {
		from: moment().subtract(60, 'days').format('YYYY/MM/DD'),
		to: moment().subtract(30, 'days').format('YYYY/MM/DD'),
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
			filterKey: '',
			dateRangePopover: false,
			selectedDateRange: 'This Month',
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
	}

	componentDidMount() {
		const { fetchFilterLabels, isFetchedFilterLabels, tier, featureCustomEvents } = this.props;
		if (!isFetchedFilterLabels) {
			if (isValidPlan(tier, featureCustomEvents)) {
				fetchFilterLabels();
			}
		}
	}

	handleFilterByChange = (filterBy) => {
		if (filterBy === 'custom_event') {
			this.setState({
				filterKey: '',
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
						{filterKey && (
							<Select
								key={filterKey}
								showSearch
								style={{
									width: 200,
									paddingRight: 15,
									marginBottom: 15,
								}}
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
										<React.Fragment>
											{Object.keys(get(dateRangeColumns, column, {})).map(
												(rangeLabel) => (
													<Col key={column} md={12} span={12}>
														<Button
															key={rangeLabel}
															block
															type={
																selectedDateRange === rangeLabel
																	? 'primary'
																	: 'default'
															}
															onClick={() =>
																this.handleDateRangeChange(
																	rangeLabel,
																)
															}
														>
															{rangeLabel}
														</Button>
													</Col>
												),
											)}
										</React.Fragment>
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
					</Flex>
				</Flex>
				<SelectedFilters filterId={filterId} />
			</Flex>
		);
	}
}

Filter.defaultProps = {
	filterValues: undefined,
	filterLabels: [],
};

Filter.propTypes = {
	tier: PropTypes.string.isRequired,
	filterId: PropTypes.string.isRequired,
	selectFilterValue: PropTypes.func.isRequired,
	fetchFilterValues: PropTypes.func.isRequired,
	isLoadingFilterValues: PropTypes.bool.isRequired,
	filterValues: PropTypes.object,
	fetchFilterLabels: PropTypes.func.isRequired,
	isLoadingFilterLabels: PropTypes.bool.isRequired,
	featureCustomEvents: PropTypes.bool.isRequired,
	isFetchedFilterLabels: PropTypes.bool.isRequired,
	filterLabels: PropTypes.array,
};

const mapStateToProps = (state) => ({
	isLoadingFilterValues: get(state, '$getFilterValues.isFetching'),
	filterValues: get(state, '$getFilterValues.results'),
	tier: get(state, '$getAppPlan.results.tier'),
	featureCustomEvents: get(state, '$getAppPlan.results.feature_custom_events', false),
	isLoadingFilterLabels: get(state, '$getFilterLabels.isFetching'),
	isFetchedFilterLabels: get(state, '$getFilterLabels.results.success', false),
	filterLabels: get(state, '$getFilterLabels.results.filter_labels'),
});

const mapDispatchToProps = (dispatch) => ({
	fetchFilterValues: (label, prefix) => dispatch(getFilterValues(label, prefix)),
	fetchFilterLabels: () => dispatch(getFilterLabels()),
	// eslint-disable-next-line
	selectFilterValue: (filterId, filterKey, filterValue) =>
		dispatch(setFilterValue(filterId, filterKey, filterValue)),
});
export default connect(mapStateToProps, mapDispatchToProps)(Filter);
