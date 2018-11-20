import React from 'react';
import { Card } from 'antd';
import { css } from 'react-emotion';
import {
 BarChart, XAxis, YAxis, Bar,
} from 'recharts';
import find from 'lodash/find';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import Loader from '../../../shared/Loader/Spinner';
import EmptyData from '../../../shared/EmptyData';
import { getAppSearchLatency } from '../../../../modules/actions';
import { getAppSearchLatencyByName } from '../../../../modules/selectors';

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
	.recharts-label {
		transform: translate(-50px, 15px);
	}
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
		const { searchLatency, isLoading, success } = this.props;
		const { width } = this.state;
		return (
			<div
				ref={(c) => {
					this.child = c;
				}}
				css="width: 100%"
			>
				<Card title="Search Latency" css={cls}>
					{isLoading ? (
						<Loader />
					) : (
						(success && !searchLatency.length && <EmptyData css="height: 400px" />) || (
							<BarChart
								margin={{
									top: 20,
									right: 20,
									bottom: 20,
									left: 70,
								}}
								barCategoryGap={0}
								width={width}
								height={400}
								data={getSearchLatencyDummy(searchLatency)}
							>
								<XAxis label="Latency (in ms)" dataKey="key" />
								<YAxis allowDecimals={false} label="Search Count" />
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
	isLoading: PropTypes.bool.isRequired,
	success: PropTypes.bool.isRequired,
};
const mapStateToProps = (state) => {
	const searchLatency = getAppSearchLatencyByName(state);
	return {
		searchLatency: get(searchLatency, 'latencies', []),
		isLoading: get(state, '$getAppSearchLatency.isFetching'),
		success: get(state, '$getAppSearchLatency.success'),
		isSearchLatencyPresent: !!searchLatency,
	};
};
const mapDispatchToProps = dispatch => ({
	fetchAppSearchLatency: appName => dispatch(getAppSearchLatency(appName)),
});
export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(SearchLatency);
