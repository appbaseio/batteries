import React from 'react';
import { Card } from 'antd';
import { css } from 'react-emotion';
import { BarChart, XAxis, YAxis, Bar, Label, ResponsiveContainer } from 'recharts';
import find from 'lodash/find';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import Filter from '../Filter';
import Loader from '../../../shared/Loader/Spinner';
import EmptyData from '../../../shared/EmptyData';
import { getAppSearchLatency, setFilterValue } from '../../../../modules/actions';
import { getAppSearchLatencyByName } from '../../../../modules/selectors';
import { getUrlParams } from '../../../../../utils/helper';
import { applyFilterParams } from '../../utils';

const getSearchLatencyDummy = (latency = []) => {
	const dummyLatency = latency.map((l) => l);
	let count = 0;
	while (dummyLatency.length < 11) {
		const key = count * 10;
		const isPresent = find(latency, (o) => o.key === key);
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

class SearchLatency extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			width: undefined,
		};
	}

	componentDidMount() {
		const { fetchAppSearchLatency, filterId, selectFilterValue, filters } = this.props;
		this.setState({
			width: this.child.parentNode.clientWidth - 60,
		});
		applyFilterParams({
			filters,
			callback: fetchAppSearchLatency,
			filterId,
			applyFilter: selectFilterValue,
		});
	}

	componentDidUpdate(prevProps) {
		const { filters, fetchAppSearchLatency } = this.props;
		if (filters && JSON.stringify(prevProps.filters) !== JSON.stringify(filters)) {
			fetchAppSearchLatency();
		}
	}

	render() {
		const { searchLatency, isLoading, success, filterId, displayFilter } = this.props;
		const { width } = this.state;
		return (
			<div
				ref={(c) => {
					this.child = c;
				}}
				css="width: 100%"
			>
				{displayFilter && filterId && <Filter filterId={filterId} />}
				<Card title="Search Latency" css={cls}>
					{isLoading ? (
						<Loader />
					) : (
						(success && !searchLatency.length && <EmptyData css="height: 400px" />) || (
							<ResponsiveContainer width="100%" aspect={2.8}>
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
									<Bar dataKey="count" fill="#A4C7FF" />
								</BarChart>
							</ResponsiveContainer>
						)
					)}
				</Card>
			</div>
		);
	}
}

SearchLatency.defaultProps = {
	filterId: undefined,
	filters: undefined,
	displayFilter: true,
};

SearchLatency.propTypes = {
	displayFilter: PropTypes.bool,
	filterId: PropTypes.string,
	filters: PropTypes.object,
	fetchAppSearchLatency: PropTypes.func.isRequired,
	searchLatency: PropTypes.array.isRequired,
	isLoading: PropTypes.bool.isRequired,
	success: PropTypes.bool.isRequired,
};
const mapStateToProps = (state, props) => {
	const searchLatency = getAppSearchLatencyByName(state);
	return {
		searchLatency: get(searchLatency, 'latencies', []),
		isLoading: get(state, '$getAppSearchLatency.isFetching'),
		success: get(state, '$getAppSearchLatency.success'),
		isSearchLatencyPresent: !!searchLatency,
		filters: get(state, `$getSelectedFilters.${props.filterId}`, {}),
	};
};
const mapDispatchToProps = (dispatch, props) => ({
	fetchAppSearchLatency: (appName) => dispatch(getAppSearchLatency(appName, props.filterId)),
	selectFilterValue: (filterId, filterKey, filterValue) =>
		dispatch(setFilterValue(filterId, filterKey, filterValue)),
});
export default connect(mapStateToProps, mapDispatchToProps)(SearchLatency);
