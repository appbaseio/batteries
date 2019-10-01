import React from 'react';
import PropTypes from 'prop-types';
import { Tag } from 'antd';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { clearFilterValue } from '../../../../modules/actions';
import Flex from '../../../shared/Flex';

const SelectedFilters = ({ selectedFilters, clearFilterValue: onClear }) => (
	<Flex style={{ paddingTop: 15, flexWrap: 'wrap' }}>
		{Object.keys(selectedFilters).map(filter => (
			<Tag color="#108ee9" key={filter} closable onClose={() => onClear(filter)}>
				{filter} : {selectedFilters[filter]}
			</Tag>
		))}
		{Object.keys(selectedFilters).length ? (
			<Tag color="blue" closable onClose={() => onClear('')}>
				Clear all
			</Tag>
		) : null}
	</Flex>
);

SelectedFilters.defaultProps = {
	selectedFilters: undefined,
};

SelectedFilters.propTypes = {
	// eslint-disable-next-line
	filterId: PropTypes.string.isRequired,
	clearFilterValue: PropTypes.func.isRequired,
	selectedFilters: PropTypes.object,
};

const mapStateToProps = (state, props) => ({
	selectedFilters: get(state, `$getSelectedFilters.${props.filterId}`, {}),
});

const mapDispatchToProps = (dispatch, props) => ({
	clearFilterValue: filterKey => dispatch(clearFilterValue(props.filterId, filterKey)),
});
export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(SelectedFilters);
