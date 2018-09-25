import React from 'react';
import {
 LineChart, XAxis, Tooltip, CartesianGrid, Line, YAxis,
} from 'recharts';
import PropTypes from 'prop-types';
import EmptyData from '../EmptyData';

const normalizeData = (data = []) => data.map((o) => {
		const newData = o;
		const date = new Date(o.key_as_string);
		newData.formatDate = `${date.getMonth() + 1}/${date.getDate()}`;
		return newData;
	});

const SearchVolumeChart = ({ data, height, width }) => {
	if (data && data.length) {
		return (
			<LineChart
				width={width}
				height={height}
				data={normalizeData(data)}
				margin={{
					top: 5,
					right: 20,
					left: 10,
					bottom: 5,
				}}
			>
				<XAxis dataKey="formatDate" />
				<YAxis dataKey="count" />
				<Tooltip />
				<CartesianGrid stroke="#f5f5f5" />
				<Line type="monotone" dataKey="count" stroke="#ff7300" />
			</LineChart>
		);
	}
	return (
		<EmptyData
			css={`
				height: ${height}px;
				width: ${width}px;
			`}
		/>
	);
};
SearchVolumeChart.defaultProps = {
	data: PropTypes.array,
	width: PropTypes.number,
	height: PropTypes.number,
};
SearchVolumeChart.propTypes = {
	data: PropTypes.array,
	width: PropTypes.number,
	height: PropTypes.number,
};

export default SearchVolumeChart;
