import React from 'react';
import PropTypes from 'prop-types';
import Flex from '../Flex';

const EmptyData = ({ message, ...props }) => (
	<Flex alignItems="center" justifyContent="center" {...props}>
		<span css="color: rgba(0, 0, 0, 0.45)">{message}</span>
	</Flex>
);

EmptyData.defaultProps = {
	message: 'No data',
};
EmptyData.propTypes = {
	message: PropTypes.string,
};
export default EmptyData;
