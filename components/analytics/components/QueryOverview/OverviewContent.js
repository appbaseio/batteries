import React from 'react';
import { connect } from 'react-redux';
import { Card, Tooltip, Icon } from 'antd';
import { css } from 'react-emotion';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { withErrorToaster } from '../../../shared/ErrorToaster/ErrorToaster';
import { getAppQueryOverview, setFilterValue } from '../../../../modules/actions';
import Loader from '../../../shared/Loader/Spinner';
import { getAppQueryOverviewByName } from '../../../../modules/selectors';
import SearchVolumeChart from '../../../shared/Chart/SearchVolume';
import Flex from '../../../shared/Flex';
import { mediaKey } from '../../../../utils/media';
import ViewSource from '../ViewSource';
import Searches from '../Searches';
import Filter from '../Filter';
import { topClicksColumns, topResultsColumns, applyFilterParams } from '../../utils';

const results = css`
	width: 100%;
	margin-top: 20px;
	${mediaKey.medium} {
		flex-direction: column;
	}
`;
const searchCls = css`
	flex: 50%;
	margin-right: 10px;
	${mediaKey.medium} {
		margin-right: 0;
	}
`;
const noResultsCls = css`
	flex: 50%;
	margin-left: 10px;
	${mediaKey.medium} {
		margin-left: 0;
		margin-top: 20px;
	}
`;

class OverviewContent extends React.Component {
	componentDidMount() {
		const { fetchAppQueryOverview, filterId, selectFilterValue, filters } = this.props;
		applyFilterParams({
			filters,
			callback: fetchAppQueryOverview,
			filterId,
			applyFilter: selectFilterValue,
		});
	}

	componentDidUpdate(prevProps) {
		const { filters, fetchAppQueryOverview } = this.props;
		if (filters && prevProps.filters !== filters) {
			fetchAppQueryOverview();
		}
	}

	render() {
		const {
			isLoading,
			histogram,
			topClicks,
			topResults,
			filterId,
			query,
			displayFilter,
		} = this.props;
		return (
			<div>
				{isLoading ? (
					<Loader />
				) : (
					<div>
						{displayFilter && filterId && (
							<Filter hideInsightsButton filterId={filterId} />
						)}
						<Card
							style={{
								marginBottom: 20,
							}}
							title={
								<span>
									Queries for <b>{query === '' ? '<empty_query>' : query}</b>
								</span>
							}
						>
							<h2
								style={{
									fontSize: '1.3rem',
								}}
							>
								{(histogram || []).reduce(
									(acc, crr = 0) => acc + get(crr, 'count', 0),
									0,
								)}
							</h2>
						</Card>
						<SearchVolumeChart height={300} data={histogram} />
						<Flex css={results}>
							<div css={searchCls}>
								<Searches
									dataSource={topClicks}
									columns={topClicksColumns(ViewSource)}
									title={
										<span>
											Top Result Clicks
											<Tooltip title="In the drilldown view, only result clicks are shown. The summary stat includes suggestion clicks as well.">
												<Icon
													style={{
														marginLeft: 8,
													}}
													type="info-circle"
												/>
											</Tooltip>
										</span>
									}
									css="height: 100%"
									breakWord
									tableProps={{
										pagination: {
											pageSize: 5,
										},
										rowKey: (record) => record.key + record.click_type,
									}}
								/>
							</div>
							<div css={noResultsCls}>
								<Searches
									dataSource={topResults}
									pagination
									columns={topResultsColumns(ViewSource)}
									title="Top Results"
									css="height: 100%"
									breakWord
									tableProps={{
										pagination: {
											pageSize: 5,
										},
										rowKey: (record) => record.key + record.click_type,
									}}
								/>
							</div>
						</Flex>
					</div>
				)}
			</div>
		);
	}
}

OverviewContent.defaultProps = {
	isLoading: false,
	displayFilter: false,
	histogram: [],
	topClicks: [],
	topResults: [],
	filters: undefined,
};
OverviewContent.propTypes = {
	filterId: PropTypes.string.isRequired,
	query: PropTypes.string.isRequired,
	selectFilterValue: PropTypes.func.isRequired,
	displayFilter: PropTypes.bool,
	isLoading: PropTypes.bool,
	fetchAppQueryOverview: PropTypes.func.isRequired,
	histogram: PropTypes.array,
	topClicks: PropTypes.array,
	topResults: PropTypes.array,
	filters: PropTypes.object,
};

const mapStateToProps = (state, props) => {
	const queryOverview = getAppQueryOverviewByName(state);
	return {
		histogram: get(queryOverview, 'histogram'),
		topClicks: get(queryOverview, 'top_clicks'),
		topResults: get(queryOverview, 'top_results'),
		isLoading: get(state, '$getAppQueryOverview.isFetching'),
		filters: get(state, `$getSelectedFilters.${props.filterId}`),
	};
};
const mapDispatchToProps = (dispatch, props) => ({
	fetchAppQueryOverview: (appName) =>
		dispatch(getAppQueryOverview(appName, props.filterId, props.query)),
	selectFilterValue: (filterId, filterKey, filterValue) =>
		dispatch(setFilterValue(filterId, filterKey, filterValue)),
});

export default withErrorToaster(connect(mapStateToProps, mapDispatchToProps)(OverviewContent));
