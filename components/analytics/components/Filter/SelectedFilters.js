import React from 'react';
import PropTypes from 'prop-types';
import { Tag } from 'antd';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { clearFilterValue } from '../../../../modules/actions';
import Flex from '../../../shared/Flex';
import { withErrorToaster } from '../../../../../components/ErrorToaster/ErrorToaster';

const hiddenFilters = ['size', 'from', 'to', 'clickanalytics'];

const SelectedFilters = ({ selectedFilters, clearFilterValue: onClear }) => {
	const filteredFilters = Object.keys(selectedFilters).reduce(
		(obj = {}, filter) => ({
			...obj,
			...(hiddenFilters.includes(filter)
				? null
				: {
						[filter]: selectedFilters[filter],
				  }),
		}),
		{},
	);
	return (
		<Flex style={{ flexWrap: 'wrap' }}>
			{Object.keys(filteredFilters).map((filter) => (
				<Tag color="#108ee9" key={filter} closable onClose={() => onClear(filter)}>
					{filter} : {filteredFilters[filter]}
				</Tag>
			))}
			{Object.keys(filteredFilters).length ? (
				<Tag color="blue" closable onClose={() => onClear('')}>
					Clear all
				</Tag>
			) : null}
		</Flex>
	);
};

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
	clearFilterValue: (filterKey) => dispatch(clearFilterValue(props.filterId, filterKey)),
});
export default withErrorToaster(connect(mapStateToProps, mapDispatchToProps)(SelectedFilters));
