import React from 'react';
import {
 LineChart, XAxis, Tooltip, CartesianGrid, Line, YAxis,
} from 'recharts';
import { Card, Select } from 'antd';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { css } from 'react-emotion';
import { connect } from 'react-redux';
import { getAppPlanByName } from '../../../modules/selectors';
import EmptyData from '../EmptyData';
import { mediaKey } from '../../../utils/media';

const Option = { Select };

const chart = css`
	width: 100%;
	${mediaKey.small} {
		.ant-card-body {
			padding-left: 0px;
			padding-right: 0px;
		}
	}
`;

const normalizeData = (data = []) => data.map((o) => {
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
			searchVolume: props.data,
			data: props.data,
		};
	}

	static getDerivedStateFromProps(props, state) {
		if (state.searchVolume !== props.data) {
			return { data: props.data };
		}
		return null;
	}

	componentDidMount() {
		const { margin } = this.props;
		this.setState({
			width: this.child.parentNode.clientWidth - (40 + margin),
		});
	}

	handleChange = (value) => {
		const { searchVolume } = this.state;
		const { length } = searchVolume;
		if (value === 'weekly') {
			const data = [];
			for (let i = 1; i <= 7; i += 1) {
				data.unshift(searchVolume[length - i]);
			}
			this.setState({
				data,
			});
		} else {
			this.setState({
				data: searchVolume,
			});
		}
	};

	render() {
		const { height, plan } = this.props;
		const { width, data } = this.state;
		return (
			<Card
				extra={
					plan === 'growth' ? (
						<div>
							<Select onChange={this.handleChange} defaultValue="monthly">
								<Option value="monthly" key="monthly">
									Monthly
								</Option>
								<Option value="weekly" key="weekly">
									weekly
								</Option>
							</Select>
						</div>
					) : (
						undefined
					)
				}
				css={chart}
				title="Daily Search Volume"
			>
				<div
					ref={(c) => {
						this.child = c;
					}}
				>
					{data && data.length ? (
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
	plan: PropTypes.string.isRequired,
	height: PropTypes.number,
	margin: PropTypes.number,
};

const mapStateToProps = (state) => {
	const appPlan = getAppPlanByName(state);
	return {
		plan: get(appPlan, 'plan'),
	};
};
export default connect(mapStateToProps)(SearchVolumeChart);
