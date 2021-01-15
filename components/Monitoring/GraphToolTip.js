import React from 'react';
import PropTypes from 'prop-types';

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
					<b>{graphLabel}:</b> {payload[0].payload.data} {unit}
				</div>
				<div>
					<b>Time: </b>
					{payload[0].payload.date}
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
