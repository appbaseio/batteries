import React from 'react';
import { connect } from 'react-redux';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Card } from 'antd';
import {
 LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend,
} from 'recharts';
import Loader from '../../../shared/Loader/Spinner';
import { displayErrors } from '../../../../utils/heplers';
import { getAppRequestDistribution } from '../../../../modules/actions';
import { getAppRequestDistributionByName } from '../../../../modules/selectors';

const normalizedData = (data = []) => {
	const dataTobeReturned = [];
	data.forEach((item) => {
		const modifiedItem = item;
		if (item.buckets) {
			item.buckets.forEach((bucket) => {
				modifiedItem[bucket.key] = bucket.count;
			});
		}
		dataTobeReturned.push(modifiedItem);
	});
	return dataTobeReturned;
};

class RequestDistribution extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			width: undefined,
		};
		this.ticks = [
			moment()
				.subtract(5, 'd')
				.startOf('day')
				.valueOf(),
			moment()
				.subtract(4, 'd')
				.startOf('day')
				.valueOf(),
			moment()
				.subtract(3, 'd')
				.startOf('day')
				.valueOf(),
			moment()
				.subtract(2, 'd')
				.startOf('day')
				.valueOf(),
			moment()
				.subtract(1, 'd')
				.startOf('day')
				.valueOf(),
			moment().startOf('day').valueOf(),
			moment()
				.add(1, 'd')
				.startOf('day')
				.valueOf(),
		];
	}

	componentDidMount() {
		const { fetchAppRequestDistribution } = this.props;
		fetchAppRequestDistribution();
		this.setState({
			width: this.child.parentNode.clientWidth - 60,
		});
	}

	componentDidUpdate(prevProps) {
		const { errors } = this.props;
		displayErrors(errors, prevProps.errors);
	}

	render() {
		const { isLoading, results } = this.props;
		const { width } = this.state;
		console.log('THESE ARE THE THINGS', this.ticks, normalizedData(results));
		return (
			<div
				ref={(c) => {
					this.child = c;
				}}
				css="width: 100%"
			>
				<Card
					title="Request Distribution"
					style={{
						width: '100%',
					}}
				>
					{isLoading ? (
						<Loader />
					) : (
						<LineChart
							width={width}
							height={400}
							data={normalizedData(results)}
							margin={{
								top: 20,
								right: 50,
								bottom: 20,
								left: 0,
							}}
						>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis
								tickFormatter={unixTime => moment(unixTime).format('Do ddd')}
								type="number"
								dataKey="key"
								domain={[this.ticks[0], this.ticks[6]]}
								ticks={this.ticks}
								tickCount={7}
							/>
							<YAxis
								allowDecimals={false}
								label={{
									value: 'rpm',
									angle: -90,
									position: 'insideLeft',
								}}
							/>
							<Tooltip
								labelFormatter={unixTime => moment(unixTime).format('MMMM Do YYYY, HH:MM:SS')
								}
							/>
							<Legend />
							<Line
								connectNulls
								name="200 OK"
								type="monotone"
								dataKey="200"
								stroke="#2eaa49"
							/>
							<Line
								connectNulls
								name="201 Created"
								type="monotone"
								dataKey="201"
								stroke="#1c72f6"
							/>
							<Line
								connectNulls
								name="400 Bad Request"
								type="monotone"
								dataKey="400"
								stroke="#ead533"
							/>
							<Line
								connectNulls
								name="401 Unauthorized"
								type="monotone"
								dataKey="401"
								stroke="#e82055"
							/>
						</LineChart>
					)}
				</Card>
			</div>
		);
	}
}
RequestDistribution.propTypes = {
	fetchAppRequestDistribution: PropTypes.func.isRequired,
	isLoading: PropTypes.bool.isRequired,
	results: PropTypes.array.isRequired,
	errors: PropTypes.array.isRequired,
};
const mapStateToProps = state => ({
	isLoading: get(state, '$getAppRequestDistribution.isFetching'),
	errors: [get(state, '$getAppRequestDistribution.error')],
	results: get(getAppRequestDistributionByName(state), 'request_distribution', []),
});
const mapDispatchToProps = dispatch => ({
	fetchAppRequestDistribution: appName => dispatch(getAppRequestDistribution(appName)),
});
export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(RequestDistribution);
