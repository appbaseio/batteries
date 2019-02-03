import React from 'react';
import { connect } from 'react-redux';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Card, Select } from 'antd';
import {
 LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend,
} from 'recharts';
import Loader from '../../../shared/Loader/Spinner';
import EmptyData from '../../../shared/EmptyData';
import { displayErrors } from '../../../../utils/heplers';
import { getAppRequestDistribution } from '../../../../modules/actions';
import { getAppRequestDistributionByName, getAppPlanByName } from '../../../../modules/selectors';

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
			ticks: this.calculateTicks().monthlyTicks,
		};
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

	getformatedDate(date) {
		const { ticks } = this.state;
		return ticks.length > 9 ? moment(date).format('MM/DD')
		: moment(date).format('Do ddd');
	}

	handleChange = (value) => {
		const { fetchAppRequestDistribution } = this.props;
		if (value === 'weekly') {
			fetchAppRequestDistribution({
				from: moment()
					.subtract(7, 'days')
					.format('YYYY/MM/DD'),
				to: moment().format('YYYY/MM/DD'),
			});
			this.setState({
				ticks: this.weeklyTicks,
			});
		} else {
			fetchAppRequestDistribution();
			this.setState({
				ticks: this.monthlyTicks,
			});
		}
	};

	calculateTicks() {
		const baseTicks = [
			moment()
				.startOf('day')
				.valueOf(),
			moment()
				.add(1, 'd')
				.startOf('day')
				.valueOf(),
		];
		const monthlyTicks = [
			...[...Array(30)].map((x, i) => moment()
					.subtract(30 - i, 'd')
					.startOf('day')
					.valueOf()),
			...baseTicks,
		];
		const weeklyTicks = [
			...[...Array(7)].map((x, i) => moment()
					.subtract(7 - i, 'd')
					.startOf('day')
					.valueOf()),
			...baseTicks,
		];
		this.weeklyTicks = weeklyTicks;
		this.monthlyTicks = monthlyTicks;
		return {
			weeklyTicks,
			monthlyTicks,
		};
	}

	render() {
		const {
 isLoading, results, success, plan,
} = this.props;
		const { width, ticks } = this.state;
		const data = normalizedData(results);
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
					extra={
						plan === 'growth' ? (
							<Select onChange={this.handleChange} defaultValue="monthly">
								<Select.Option value="monthly" key="monthly">
									Monthly
								</Select.Option>
								<Select.Option value="weekly" key="weekly">
									weekly
								</Select.Option>
							</Select>
						) : (
							undefined
						)
					}
				>
					{isLoading ? (
						<Loader />
					) : (
						(success && !data.length && <EmptyData css="height: 400px" />) || (
							<LineChart
								width={width}
								height={400}
								data={data}
								margin={{
									top: 20,
									right: 50,
									bottom: 20,
									left: 0,
								}}
							>
								<CartesianGrid />
								<XAxis
									tickFormatter={unixTime => this.getformatedDate(unixTime)}
									type="number"
									dataKey="key"
									domain={[ticks[0], ticks[ticks.length - 1]]}
									ticks={ticks}
									tickCount={ticks.length * 2}
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
						)
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
	success: PropTypes.bool.isRequired,
	errors: PropTypes.array.isRequired,
	plan: PropTypes.string.isRequired,
};
const mapStateToProps = state => ({
	isLoading: get(state, '$getAppRequestDistribution.isFetching'),
	errors: [get(state, '$getAppRequestDistribution.error')],
	success: get(state, '$getAppRequestDistribution.success'),
	results: get(getAppRequestDistributionByName(state), 'request_distribution', []),
	plan: get(getAppPlanByName(state), 'plan', 'free'),
});
const mapDispatchToProps = dispatch => ({
	fetchAppRequestDistribution: filters => dispatch(getAppRequestDistribution(null, null, filters)),
});
export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(RequestDistribution);
