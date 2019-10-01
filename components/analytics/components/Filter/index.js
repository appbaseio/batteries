import React from 'react';
import { Select, Spin } from 'antd';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import get from 'lodash/get';
import Flex from '../../../shared/Flex';
import { getFilterValues, getFilterLabels, setFilterValue } from '../../../../modules/actions';
import SelectedFilters from './SelectedFilters';

const { Option } = Select;

// eslint-disable-next-line
const filterOption = (input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;

class Filter extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			displayLabelSelector: false,
			filterKey: '',
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
		const { fetchFilterLabels, isFetchedFilterLabels } = this.props;
		if (!isFetchedFilterLabels) {
			fetchFilterLabels();
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

	handleFilterValueSearch = (filterValue) => {
		this.fetchFilterValue(filterValue);
	};

	fetchFilterValue = (filterValue = '') => {
		const { filterKey } = this.state;
		const { fetchFilterValues } = this.props;
		fetchFilterValues(filterKey, filterValue);
	};

	render() {
		const { displayLabelSelector, filterKey } = this.state;
		const {
			filterLabels,
			isLoadingFilterValues,
			isLoadingFilterLabels,
			filterValues: filterValuesByLabels,
			filterId,
		} = this.props;
		const filterValues = get(filterValuesByLabels, `${filterKey}.filter_values`, []);
		return (
			<Flex style={{ padding: '15px 0' }} flexDirection="column">
				<Flex style={{ flexWrap: 'wrap' }}>
					<Select
						showSearch
						style={{ width: 150 }}
						placeholder="Filter by"
						optionFilterProp="children"
						onChange={this.handleFilterByChange}
						filterOption={filterOption}
					>
						{this.filterBy.map(filter => (
							<Option value={filter.key} key={filter.key}>
								{filter.label}
							</Option>
						))}
					</Select>
					{displayLabelSelector && (
						<Select
							showSearch
							style={{ width: 200, paddingLeft: 15 }}
							placeholder="Filter label"
							optionFilterProp="children"
							onChange={this.handleFilterLabelChange}
							notFoundContent={isLoadingFilterLabels ? <Spin size="small" /> : null}
							filterOption={filterOption}
						>
							{filterLabels.map(filter => (
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
							style={{ width: 200, paddingLeft: 15 }}
							placeholder="Filter value"
							optionFilterProp="children"
							notFoundContent={isLoadingFilterValues ? <Spin size="small" /> : null}
							onSearch={this.handleFilterValueSearch}
							onChange={this.handleFilterValueChange}
							filterOption={filterOption}
						>
							{filterValues.map(value => (
								<Option value={value} key={value}>
									{value}
								</Option>
							))}
						</Select>
					)}
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
	filterId: PropTypes.string.isRequired,
	selectFilterValue: PropTypes.func.isRequired,
	fetchFilterValues: PropTypes.func.isRequired,
	isLoadingFilterValues: PropTypes.bool.isRequired,
	filterValues: PropTypes.object,
	fetchFilterLabels: PropTypes.func.isRequired,
	isLoadingFilterLabels: PropTypes.bool.isRequired,
	isFetchedFilterLabels: PropTypes.bool.isRequired,
	filterLabels: PropTypes.array,
};

const mapStateToProps = state => ({
	isLoadingFilterValues: get(state, '$getFilterValues.isFetching'),
	filterValues: get(state, '$getFilterValues.results'),
	isLoadingFilterLabels: get(state, '$getFilterLabels.isFetching'),
	isFetchedFilterLabels: get(state, '$getFilterLabels.results.success', false),
	filterLabels: get(state, '$getFilterLabels.results.filter_labels'),
});

const mapDispatchToProps = dispatch => ({
	fetchFilterValues: (label, prefix) => dispatch(getFilterValues(label, prefix)),
	fetchFilterLabels: () => dispatch(getFilterLabels()),
	// eslint-disable-next-line
	selectFilterValue: (filterId, filterKey, filterValue) => dispatch(setFilterValue(filterId, filterKey, filterValue)),
});
export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(Filter);
