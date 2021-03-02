import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';

const GraphToolTip = ({ active, payload, graphLabel, unit }) => {
	if (active) {
		return (
			<div
				style={{
					background: 'rgb(250,250,250',
					borderRadius: 5,
					padding: 10,
					border: '1px solid #dfdfdf',
				}}
			>
				<div>
					<b>{graphLabel}:</b> {get(payload, '0.payload.data', 'N/A')}{' '}
					{unit}
				</div>
				<div>
					<b>Time: </b>
					{get(payload, '0.payload.date', 'N/A')}
				</div>
			</div>
		);
	}
	return null;
};

GraphToolTip.propTypes = {
	active: PropTypes.bool,
	payload: PropTypes.any,
	graphLabel: PropTypes.string.isRequired,
	unit: PropTypes.string,
};

GraphToolTip.defaultProps = {
	active: false,
	payload: [],
	unit: '',
};

export default GraphToolTip;
