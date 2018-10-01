import React from 'react';
import { Card } from 'antd';
import { css } from 'react-emotion';
import {
 BarChart, XAxis, YAxis, Bar,
} from 'recharts';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import Loader from '../../../shared/Loader/Spinner';
import EmptyData from '../../../shared/EmptyData';
import { getAppSearchLatency } from '../../../../modules/actions';
import { getAppSearchLatencyByName } from '../../../../modules/selectors';

const cls = css`
	width: 100%;
	.recharts-label {
		transform: translate(-50px, 15px);
	}
`;

class SearchLatency extends React.Component {
	componentDidMount() {
		const { fetchAppSearchLatency } = this.props;
		fetchAppSearchLatency();
	}

	render() {
		const { searchLatency, isLoading, success } = this.props;
		return (
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
							width={window.innerWidth - 400}
							height={400}
							data={searchLatency}
						>
							<XAxis label="Latency (in ms)" dataKey="key" />
							<YAxis allowDecimals={false} label="Search Count" />
							<Bar dataKey="count" fill="#A4C7FF" />
						</BarChart>
					)
				)}
			</Card>
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
		searchLatency: get(searchLatency, 'latency', []),
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
