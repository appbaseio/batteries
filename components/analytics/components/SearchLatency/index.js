import React from 'react';
import { Card } from 'antd';
import { css } from 'react-emotion';
import {
 BarChart, XAxis, YAxis, Tooltip, Bar,
} from 'recharts';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { getAppSearchLatency } from '../../../../modules/actions';
import { getAppSearchLatencyByName } from '../../../../modules/selectors';

const cls = css`
	width: 100%;
	.recharts-text {
		transform: translate(-50px, 0px);
	}
	.recharts-text1 {
		.recharts-text {
			transform: translate(100px, 100px);
		}
	}
`;

class SearchLatency extends React.Component {
	componentDidMount() {
		const { fetchAppSearchLatency } = this.props;
		fetchAppSearchLatency();
	}

	render() {
		const { searchLatency } = this.props;
		return (
			<Card css={cls} title="Search Performance">
				<BarChart
					margin={{
						top: 20,
						right: 20,
						bottom: 20,
						left: 20,
					}}
					width={window.innerWidth - 380}
					height={400}
					data={searchLatency}
				>
					<XAxis className="recharts-text1" dataKey="key" />
					<YAxis />
					<Tooltip />
					<Bar dataKey="count" fill="#A4C7FF" />
				</BarChart>
			</Card>
		);
	}
}
SearchLatency.propTypes = {
	fetchAppSearchLatency: PropTypes.func.isRequired,
	searchLatency: PropTypes.array.isRequired,
};
const mapStateToProps = (state) => {
	const searchLatency = getAppSearchLatencyByName(state);
	return {
		searchLatency: get(searchLatency, 'latency', []),
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
