import React from 'react';
import { Card } from 'antd';
import { css } from 'react-emotion';
import {
 BarChart, XAxis, YAxis, Bar, Label, Tooltip,
} from 'recharts';
import find from 'lodash/find';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import Loader from '../../../shared/Loader/Spinner';
import EmptyData from '../../../shared/EmptyData';
import { getAppSearchLatency } from '../../../../modules/actions';
import { getAppSearchLatencyByName, getAppPlanByName } from '../../../../modules/selectors';

const getSearchLatencyDummy = (latency = []) => {
	const dummyLatency = latency.map(l => l);
	let count = 0;
	while (dummyLatency.length < 11) {
		const key = count * 10;
		const isPresent = find(latency, o => o.key === key);
		if (!isPresent) {
			dummyLatency.push({
				key,
				count: 0,
			});
		}
		count += 1;
	}
	return dummyLatency;
};

const cls = css`
	width: 100%;
`;
const labelCls = css`
	font-weight: bold;
	font-size: 12px;
`;

class SearchLatency extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			width: undefined,
		};
	}

	componentDidMount() {
		const { fetchAppSearchLatency } = this.props;
		fetchAppSearchLatency();
		this.setState({
			width: this.child.parentNode.clientWidth - 60,
		});
	}

	render() {
		const {
 searchLatency, isLoading, success, plan,
} = this.props;
		const { width } = this.state;
		return (
			<div
				ref={(c) => {
					this.child = c;
				}}
				css="width: 100%"
			>
				<Card
					title={(
<span>
							Search Latency (
							<span css={labelCls}>{plan === 'growth' ? 'Monthly' : 'Weekly'}</span>)
</span>
)}
					css={cls}
				>
					{isLoading ? (
						<Loader />
					) : (
						(success && !searchLatency.length && <EmptyData css="height: 400px" />) || (
							<BarChart
								margin={{
									top: 20,
									right: 50,
									bottom: 20,
									left: 20,
								}}
								barCategoryGap={0}
								width={width}
								height={400}
								data={getSearchLatencyDummy(searchLatency)}
							>
								<XAxis dataKey="key">
									<Label
										value="Latency (in ms)"
										offset={0}
										position="insideBottom"
									/>
								</XAxis>
								<YAxis
									label={{
										value: 'Search Count',
										angle: -90,
										position: 'insideLeft',
									}}
									allowDecimals={false}
								/>
								<Tooltip labelFormatter={label => `Latency - ${label}ms`} />
								<Bar dataKey="count" fill="#A4C7FF" />
							</BarChart>
						)
					)}
				</Card>
			</div>
		);
	}
}
SearchLatency.propTypes = {
	fetchAppSearchLatency: PropTypes.func.isRequired,
	searchLatency: PropTypes.array.isRequired,
	plan: PropTypes.string.isRequired,
	isLoading: PropTypes.bool.isRequired,
	success: PropTypes.bool.isRequired,
};
const mapStateToProps = (state) => {
	const searchLatency = getAppSearchLatencyByName(state);
	return {
		searchLatency: get(searchLatency, 'latency', []),
		isLoading: get(state, '$getAppSearchLatency.isFetching'),
		success: get(state, '$getAppSearchLatency.success'),
		isSearchLatencyPresent: !!searchLatency,
		plan: get(getAppPlanByName(state), 'plan', 'free'),
	};
};
const mapDispatchToProps = dispatch => ({
	fetchAppSearchLatency: appName => dispatch(getAppSearchLatency(appName)),
});
export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(SearchLatency);
