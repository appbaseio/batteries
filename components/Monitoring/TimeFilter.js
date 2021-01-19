import React from 'react';
import get from 'lodash/get';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Select } from 'antd';

import { setTimeFilter } from '../../modules/actions';
import { TIME_FILTER } from '../../utils/monitoring';
import { CLUSTER_PLANS } from '../../utils';

const getTimeFilters = (currentPlan) => {
	return Object.keys(TIME_FILTER).reduce((agg, item) => {
		if (
			item === 'now-7d' &&
			(currentPlan !== CLUSTER_PLANS.PRODUCTION_2019_1 ||
				currentPlan !== CLUSTER_PLANS.PRODUCTION_2019_2 ||
				currentPlan !== CLUSTER_PLANS.PRODUCTION_2019_3)
		) {
			return { ...agg };
		}

		return {
			...agg,
			[item]: get(TIME_FILTER, item),
		};
	}, {});
};

const TimeFilter = ({ filterValue, setFilter, plan }) => {
	const filtersAsPerPlan = getTimeFilters(plan);
	return (
		<Select onChange={setFilter} value={filterValue} style={{ marginLeft: 10, width: 150 }}>
			{Object.keys(filtersAsPerPlan).map((filter) => (
				<Select.Option value={filter} key={filter}>
					{get(filtersAsPerPlan, `${filter}.label`)}
				</Select.Option>
			))}
		</Select>
	);
};

TimeFilter.propTypes = {
	filterValue: PropTypes.string.isRequired,
	setFilter: PropTypes.func.isRequired,
	plan: PropTypes.string.isRequired,
};
const mapStateToProps = (state) => {
	return {
		filterValue: get(state, '$monitoring.filter.time'),
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		setFilter: (data) => dispatch(setTimeFilter(data)),
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(TimeFilter);
