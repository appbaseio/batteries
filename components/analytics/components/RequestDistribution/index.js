import React from 'react';
import { connect } from 'react-redux';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Card } from 'antd';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import Filter from '../Filter';
import Loader from '../../../shared/Loader/Spinner';
import EmptyData from '../../../shared/EmptyData';
import { displayErrors } from '../../../../utils/helpers';
import { getAppRequestDistribution, setFilterValue } from '../../../../modules/actions';
import { getAppRequestDistributionByName } from '../../../../modules/selectors';
import { applyFilterParams } from '../../utils';
import { withErrorToaster } from '../../../shared/ErrorToaster/ErrorToaster';
import SummaryStats from '../Summary/SummaryStats';

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
		const { fetchAppRequestDistribution, filterId, selectFilterValue, filters } = this.props;
		this.setState({
			width: this.child.parentNode.clientWidth - 60,
		});

		applyFilterParams({
			filters,
			callback: fetchAppRequestDistribution,
			filterId,
			applyFilter: selectFilterValue,
		});
	}

	componentDidUpdate(prevProps) {
		const { errors, filters, fetchAppRequestDistribution } = this.props;
		displayErrors(errors, prevProps.errors);

		if (filters && JSON.stringify(prevProps.filters) !== JSON.stringify(filters)) {
			fetchAppRequestDistribution();
			if (get(filters, 'from') && get(filters, 'to')) {
				const a = moment(get(filters, 'from'));
				const b = moment(get(filters, 'to'));
				if (b.diff(a, 'days') <= 7) {
					// eslint-disable-next-line
					this.setState({
						ticks: this.weeklyTicks,
					});
				} else {
					// eslint-disable-next-line
					this.setState({
						ticks: this.monthlyTicks,
					});
				}
			}
		}
	}

	getformatedDate(date) {
		const { ticks } = this.state;
		return ticks.length > 9 ? moment(date).format('MM/DD') : moment(date).format('Do ddd');
	}

	calculateTicks() {
		const baseTicks = [
			moment().startOf('day').valueOf(),
			moment().add(1, 'd').startOf('day').valueOf(),
		];
		const monthlyTicks = [
			...[...Array(30)].map((x, i) =>
				moment()
					.subtract(30 - i, 'd')
					.startOf('day')
					.valueOf(),
			),
			...baseTicks,
		];
		const weeklyTicks = [
			...[...Array(7)].map((x, i) =>
				moment()
					.subtract(7 - i, 'd')
					.startOf('day')
					.valueOf(),
			),
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
			isLoading,
			results,
			success,
			filterId,
			displayFilter,
			displaySummaryStats,
			totalRequests,
			total200,
			total201,
			total400,
			total401,
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
				{displayFilter && filterId && <Filter filterId={filterId} />}
				{!isLoading && displaySummaryStats ? (
					<SummaryStats
						summaryConfig={[
							{
								label: 'Total Requests',
								value: totalRequests,
							},
							{
								label: '200 Requests',
								value: total200,
							},
							{
								label: '201 Requests',
								value: total201,
							},
							{
								label: '400 Requests',
								value: total400,
							},
							{
								label: '401 Requests',
								value: total401,
							},
						]}
					/>
				) : null}
				<Card
					title="Request Distribution"
					style={{
						width: '100%',
					}}
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
									tickFormatter={(unixTime) => this.getformatedDate(unixTime)}
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
									labelFormatter={(unixTime) =>
										moment(unixTime).format('MMMM Do YYYY, HH:MM:SS')
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
RequestDistribution.defaultProps = {
	displayFilter: true,
	filterId: undefined,
	filters: {},
	displaySummaryStats: false,
	totalRequests: 0,
	total200: 0,
	total201: 0,
	total400: 0,
	total401: 0,
};

RequestDistribution.propTypes = {
	displayFilter: PropTypes.bool,
	filterId: PropTypes.string,
	filters: PropTypes.object,
	fetchAppRequestDistribution: PropTypes.func.isRequired,
	isLoading: PropTypes.bool.isRequired,
	results: PropTypes.array.isRequired,
	success: PropTypes.bool.isRequired,
	errors: PropTypes.array.isRequired,
	selectFilterValue: PropTypes.func.isRequired,
	displaySummaryStats: PropTypes.bool,
	totalRequests: PropTypes.number,
	total200: PropTypes.number,
	total201: PropTypes.number,
	total400: PropTypes.number,
	total401: PropTypes.number,
};
const mapStateToProps = (state, props) => {
	const requestDistributionRaw = getAppRequestDistributionByName(state);
	return {
		isLoading: get(state, '$getAppRequestDistribution.isFetching'),
		errors: [get(state, '$getAppRequestDistribution.error')],
		success: get(state, '$getAppRequestDistribution.success'),
		results: get(requestDistributionRaw, 'request_distribution', []),
		totalRequests: get(requestDistributionRaw, 'total_requests', []),
		total200: get(requestDistributionRaw, 'total_200', []),
		total201: get(requestDistributionRaw, 'total_201', []),
		total400: get(requestDistributionRaw, 'total_400', []),
		total401: get(requestDistributionRaw, 'total_401', []),
		filters: get(state, `$getSelectedFilters.${props.filterId}`),
	};
};
const mapDispatchToProps = (dispatch, props) => ({
	fetchAppRequestDistribution: () => dispatch(getAppRequestDistribution(null, props.filterId)),
	selectFilterValue: (filterId, filterKey, filterValue) =>
		dispatch(setFilterValue(filterId, filterKey, filterValue)),
});
export default withErrorToaster(connect(mapStateToProps, mapDispatchToProps)(RequestDistribution));
