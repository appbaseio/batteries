import React from 'react';
import {
	LineChart,
	XAxis,
	Tooltip,
	CartesianGrid,
	Line,
	YAxis,
	ResponsiveContainer,
} from 'recharts';
import { Card } from 'antd';
import PropTypes from 'prop-types';
import { css } from 'react-emotion';
import EmptyData from '../EmptyData';
import { mediaKey } from '../../../utils/media';

const chart = css`
	width: 100%;
	${mediaKey.small} {
		.ant-card-body {
			padding-left: 0px;
			padding-right: 0px;
		}
	}
`;

const normalizeData = (data = []) =>
	data.map((o) => {
		const newData = o;
		const date = new Date(o.key_as_string);
		newData.formatDate = `${date.getMonth() + 1}/${date.getDate()}`;
		return newData;
	});
class SearchVolumeChart extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			width: props.width,
		};
	}

	componentDidMount() {
		const { margin } = this.props;
		this.setState({
			width: this.child.parentNode.clientWidth - (40 + margin),
		});
	}

	render() {
		const { height, data } = this.props;
		const { width } = this.state;
		return (
			<Card css={chart} title="Daily Search Volume">
				<div
					ref={(c) => {
						this.child = c;
					}}
				>
					{data && data.length ? (
						<ResponsiveContainer width="100%" aspect={2.5}>
							<LineChart
								width={width}
								height={height}
								data={normalizeData(data)}
								margin={{
									top: 5,
									bottom: 5,
									right: 10,
								}}
							>
								<XAxis dataKey="formatDate" />
								<YAxis dataKey="count" />
								<Tooltip />
								<CartesianGrid stroke="#f5f5f5" />
								<Line type="monotone" dataKey="count" stroke="#ff7300" />
							</LineChart>
						</ResponsiveContainer>
					) : (
						<EmptyData
							css={`
								height: ${height}px;
								width: ${width}px;
							`}
						/>
					)}
				</div>
			</Card>
		);
	}
}
SearchVolumeChart.defaultProps = {
	data: [],
	width: undefined,
	height: undefined,
	margin: 0,
};
SearchVolumeChart.propTypes = {
	data: PropTypes.array,
	width: PropTypes.number,
	height: PropTypes.number,
	margin: PropTypes.number,
};

export default SearchVolumeChart;
