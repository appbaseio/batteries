import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { initializeFilter } from '../../../../modules/actions';
import { withErrorToaster } from '../../../shared/ErrorToaster/ErrorToaster';

// Populates the filter values before rendering
class FilterInitializer extends React.Component {
	constructor(props) {
		super(props);
		const { initializeFilterValue, filterId } = props;
		initializeFilterValue(filterId);
	}

	render() {
		const { children } = this.props;
		return children;
	}
}

FilterInitializer.propTypes = {
	initializeFilterValue: PropTypes.func.isRequired,
	filterId: PropTypes.string.isRequired,
	children: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
};

const mapDispatchToProps = (dispatch) => ({
	initializeFilterValue: (filterId) => dispatch(initializeFilter(filterId)),
});

export default withErrorToaster(connect(null, mapDispatchToProps)(FilterInitializer));
