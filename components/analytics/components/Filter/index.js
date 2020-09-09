import React from 'react';
import { Select, Spin, Button, Icon, Tooltip } from 'antd';
import PropTypes from 'prop-types';
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
import DateFilter from './DateFilter';
import { dateRanges } from '../../utils';
import { withErrorToaster } from '../../../shared/ErrorToaster/ErrorToaster';

const { Option } = Select;

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
					this.setSelectedLabel(selectedFilterValue);
				}
				fetchFilterLabels();
			}
		}
	}

	componentDidUpdate(prevProps) {
		const { selectedFilterValue } = this.props;
		if (JSON.stringify(prevProps.selectedFilterValue) !== JSON.stringify(selectedFilterValue)) {
			this.setSelectedLabel(selectedFilterValue);
		}
	}

	setSelectedLabel = (value) => {
		if (typeof value === 'object' && get(value, 'from') && get(value, 'to')) {
			const { from, to } = value;
			const selectedDateRange = Object.keys(dateRanges).find(
				(dateRange) =>
					get(dateRanges, `${dateRange}.from`) === from &&
					get(dateRanges, `${dateRange}.to`) === to,
			);

			this.setState({
				selectedDateRange,
			});
		}
	};

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
		const filters = dateRanges[filterValue];
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

	handleRefresh = () => {
		const { selectFilterValue, filterId } = this.props;
		// Set filter key as `refresh` to im-mutate the filters with same value in the redux store
		// so component can trigger the API (check the getSelectedFilters reducer it handles that special case)
		selectFilterValue(filterId, 'refresh__data');
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
			hideCustomEvents,
		} = this.props;
		if (!isValidPlan(tier, featureCustomEvents)) {
			return null;
		}
		const filterValues = get(filterValuesByLabels, `${filterKey}.filter_values`, []);
		return (
			<Flex flexDirection="column" style={{ paddingBottom: 15 }}>
				<Flex justifyContent="space-between" style={{ flexWrap: 'wrap' }}>
					<Flex style={{ flexWrap: 'wrap' }}>
						{!hideCustomEvents ? (
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
						) : null}
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
						<Tooltip placement="topLeft" title="Refresh data.">
							<Button onClick={this.handleRefresh} icon="redo" />
						</Tooltip>
						<DateFilter
							onChange={this.handleDateRangeChange}
							toggleVisible={this.handleDateRangePopover}
							label={selectedDateRange}
							visible={dateRangePopover}
						/>
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
	hideCustomEvents: false,
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
	hideCustomEvents: PropTypes.bool,
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

export default withErrorToaster(connect(mapStateToProps, mapDispatchToProps)(Filter));
