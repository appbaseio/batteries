import React from 'react';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { Row, Col } from 'antd';
import PropTypes from 'prop-types';
import { css } from 'emotion';
import { getAppAnalyticsSummaryByName } from '../../../../modules/selectors';
import { getAppAnalyticsSummary, setFilterValue } from '../../../../modules/actions';
import Loader from '../../../shared/Loader/Spinner';
import { isValidPlan } from '../../../../utils';
import { displayErrors } from '../../../../utils/heplers';
import SummaryCard from './SummaryCard';
import { parseTimeDuration, applyFilterParams } from '../../utils';

const cardContainer = css`
	padding: 10px;
`;

class Summary extends React.Component {
	componentDidMount() {
		const { fetchAppAnalyticsSummary, filterId, selectFilterValue, filters } = this.props;
		applyFilterParams({
			filters,
			callback: fetchAppAnalyticsSummary,
			filterId,
			applyFilter: selectFilterValue,
		});
	}

	componentDidUpdate(prevProps) {
		const { errors, filters } = this.props;
		displayErrors(errors, prevProps.errors);
		if (filters && JSON.stringify(prevProps.filters) !== JSON.stringify(filters)) {
			const { fetchAppAnalyticsSummary } = this.props;
			fetchAppAnalyticsSummary();
		}
	}

	render() {
		const {
			// prettier-ignore
			isLoading,
			avgClickRate,
			avgConversionRate,
			totalSearches,
			compTotalSearches,
			totalResults,
			compTotalResults,
			noResultsRate,
			totalUsers,
			compTotalUsers,
			totalConversions,
			compTotalConversions,
			totalResultClicks,
			compTotalResultClicks,
			totalClicks,
			compTotalClicks,
			noResultSearch,
			compNoResultSearch,
			totalSuggestionClicks,
			compTotalSuggestionClicks,
			totalUserSessions,
			compTotalUserSessions,
			avgSessionDuration,
			compAvgSessionDuration,
			avgClickPosition,
			compAvgClickPosition,
			bounceRate,
			compBounceRate,
			tier,
			featureCustomEvents,
		} = this.props;

		if (isLoading) {
			return <Loader />;
		}
		const formattedTime = parseTimeDuration(avgSessionDuration);
		const isEnterpriseUser = isValidPlan(tier, featureCustomEvents);

		return (
			<React.Fragment>
				{isEnterpriseUser ? (
					<Row gutter={8} className={cardContainer}>
						<Col sm={24} xs={24} xl={6}>
							<SummaryCard
								style={{
									borderTop: '2px solid #000',
								}}
								title="Total Users"
								label={totalUsers}
								value={totalUsers}
								comparisonValue={compTotalUsers}
								showComparisonStats={isEnterpriseUser}
							/>
						</Col>
						<Col sm={24} xs={24} xl={6}>
							<SummaryCard
								style={{
									borderTop: '2px solid #000',
								}}
								title="Total Sessions"
								label={totalUserSessions}
								value={totalUserSessions}
								comparisonValue={compTotalUserSessions}
								showComparisonStats={isEnterpriseUser}
							/>
						</Col>
						<Col sm={24} xs={24} xl={6}>
							<SummaryCard
								style={{
									borderTop: '2px solid #000',
								}}
								title="Bounce Rate"
								label={`${bounceRate}%`}
								value={bounceRate}
								comparisonValue={compBounceRate}
								showComparisonStats={isEnterpriseUser}
							/>
						</Col>
						<Col sm={24} xs={24} xl={6}>
							<SummaryCard
								style={{
									borderTop: '2px solid #000',
								}}
								title="Avg Session Duration"
								label={`${formattedTime.time} ${formattedTime.formattedUnit || ''}`}
								value={avgSessionDuration}
								comparisonValue={compAvgSessionDuration}
								showComparisonStats={isEnterpriseUser}
							/>
						</Col>
					</Row>
				) : null}
				<Row>
					<Col xl={8} md={12}>
						<Row gutter={8} className={cardContainer}>
							<Col span={24}>
								<SummaryCard
									style={{
										borderTop: '2px solid #2f54eb',
										background: '#f0f5ff',
									}}
									title="Total Searches"
									label={totalSearches}
									value={totalSearches}
									comparisonValue={compTotalSearches}
									showComparisonStats={isEnterpriseUser}
								/>
							</Col>
							<Col sm={24} xs={24} xl={12}>
								<SummaryCard
									title="Impressions"
									label={totalResults}
									value={totalResults}
									comparisonValue={compTotalResults}
									style={{ background: '#f0f5ff' }}
									showComparisonStats={isEnterpriseUser}
									hidePrevStats
								/>
							</Col>
							<Col sm={24} xs={24} xl={12}>
								<SummaryCard
									title="No Results"
									label={noResultSearch}
									value={noResultSearch}
									comparisonValue={compNoResultSearch}
									showPercent
									percent={noResultsRate}
									style={{ background: '#f0f5ff' }}
									showComparisonStats={isEnterpriseUser}
									hidePrevStats
								/>
							</Col>
						</Row>
					</Col>
					<Col xl={8} md={12}>
						<Row gutter={8} className={cardContainer}>
							<Col span={24}>
								<SummaryCard
									title="Clicks"
									style={{
										borderTop: '2px solid #eb2f96',
										background: '#fff0f6',
									}}
									label={totalClicks}
									value={totalClicks}
									comparisonValue={compTotalClicks}
									showPercent
									percent={avgClickRate}
									showComparisonStats={isEnterpriseUser}
								/>
							</Col>
							<Col sm={24} xs={24} xl={12}>
								<SummaryCard
									title="Suggestion Clicks"
									style={{ background: '#fff0f6' }}
									label={totalSuggestionClicks}
									showComparisonStats={isEnterpriseUser}
									value={totalSuggestionClicks}
									comparisonValue={compTotalSuggestionClicks}
									hidePrevStats
								/>
							</Col>
							<Col sm={24} xs={24} xl={12}>
								<SummaryCard
									title="Result Clicks"
									style={{ background: '#fff0f6' }}
									label={totalResultClicks}
									showComparisonStats={isEnterpriseUser}
									value={totalResultClicks}
									comparisonValue={compTotalResultClicks}
									hidePrevStats
								/>
							</Col>
						</Row>
					</Col>
					<Col xl={8}>
						<Row gutter={8} className={cardContainer}>
							<Col span={24}>
								<SummaryCard
									style={{
										background: '#f6ffed',
										borderTop: '2px solid #52c41a',
									}}
									title="Conversions"
									showPercent
									percent={avgConversionRate}
									label={totalConversions}
									showComparisonStats={isEnterpriseUser}
									value={totalConversions}
									comparisonValue={compTotalConversions}
								/>
							</Col>
							<Col span={24}>
								<SummaryCard
									style={{
										borderTop: '2px solid #eb2f96',
										background: '#fff0f6',
									}}
									title="Avg Click Position"
									label={avgClickPosition}
									showComparisonStats={isEnterpriseUser}
									value={avgClickPosition}
									comparisonValue={compAvgClickPosition}
								/>
							</Col>
						</Row>
					</Col>
				</Row>
			</React.Fragment>
		);
	}
}

Summary.defaultProps = {
	filterId: undefined,
	filters: undefined,
	compTotalConversions: 0,
	compTotalClicks: 0,
	compTotalResultClicks: 0,
	compTotalSuggestionClicks: 0,
	compNoResultSearch: 0,
	compTotalSearches: 0,
	compTotalUsers: 0,
	compTotalResults: 0,
	compTotalUserSessions: 0,
	compBounceRate: 0,
	compAvgSessionDuration: 0,
	compAvgClickPosition: 0,
};

Summary.propTypes = {
	fetchAppAnalyticsSummary: PropTypes.func.isRequired,
	isLoading: PropTypes.bool.isRequired,
	errors: PropTypes.array.isRequired,
	avgConversionRate: PropTypes.number.isRequired,
	totalConversions: PropTypes.number.isRequired,
	totalClicks: PropTypes.number.isRequired,
	totalResultClicks: PropTypes.number.isRequired,
	avgClickRate: PropTypes.number.isRequired,
	// avgSuggestionClicks: PropTypes.string.isRequired,
	totalSuggestionClicks: PropTypes.number.isRequired,
	noResultsRate: PropTypes.number.isRequired,
	noResultSearch: PropTypes.number.isRequired,
	totalSearches: PropTypes.number.isRequired,
	totalUsers: PropTypes.number.isRequired,
	totalResults: PropTypes.number.isRequired,
	totalUserSessions: PropTypes.number.isRequired,
	bounceRate: PropTypes.number.isRequired,
	avgSessionDuration: PropTypes.number.isRequired,
	avgClickPosition: PropTypes.number.isRequired,
	// comparison
	compTotalConversions: PropTypes.number,
	compTotalClicks: PropTypes.number,
	compTotalResultClicks: PropTypes.number,
	compTotalSuggestionClicks: PropTypes.number,
	compNoResultSearch: PropTypes.number,
	compTotalSearches: PropTypes.number,
	compTotalUsers: PropTypes.number,
	compTotalResults: PropTypes.number,
	compTotalUserSessions: PropTypes.number,
	compBounceRate: PropTypes.number,
	compAvgSessionDuration: PropTypes.number,
	compAvgClickPosition: PropTypes.number,
	// eslint-disable-next-line
	filterId: PropTypes.string,
	filters: PropTypes.object,
	tier: PropTypes.string.isRequired,
	featureCustomEvents: PropTypes.bool.isRequired,
};
const mapStateToProps = (state, props) => {
	const appSummary = getAppAnalyticsSummaryByName(state);
	return {
		avgConversionRate: get(appSummary, 'summary.avg_conversion_rate', 0),
		totalConversions: get(appSummary, 'summary.total_conversions', 0),
		compTotalConversions: get(appSummary, 'compare_timeframe.total_conversions', 0),
		totalClicks: get(appSummary, 'summary.total_clicks', 0),
		compTotalClicks: get(appSummary, 'compare_timeframe.total_clicks', 0),
		totalResultClicks: get(appSummary, 'summary.total_results_clicks', 0),
		compTotalResultClicks: get(appSummary, 'compare_timeframe.total_results_clicks', 0),
		avgClickRate: get(appSummary, 'summary.avg_click_rate', 0),
		avgSuggestionClicks: get(appSummary, 'summary.avg_suggestions_click_rate', 0),
		compAvgSuggestionClicks: get(appSummary, 'compare_timeframe.avg_suggestions_click_rate', 0),
		totalSuggestionClicks: get(appSummary, 'summary.total_suggestions_clicks', 0),
		compTotalSuggestionClicks: get(appSummary, 'compare_timeframe.total_suggestions_clicks', 0),
		noResultsRate: get(appSummary, 'summary.no_results_rate', 0),
		noResultSearch: get(appSummary, 'summary.total_no_results_searches', 0),
		compNoResultSearch: get(appSummary, 'compare_timeframe.total_no_results_searches', 0),
		totalSearches: get(appSummary, 'summary.total_searches', 0),
		compTotalSearches: get(appSummary, 'compare_timeframe.total_searches', 0),
		totalUsers: get(appSummary, 'summary.total_users', 0),
		compTotalUsers: get(appSummary, 'compare_timeframe.total_users', 0),
		totalUserSessions: get(appSummary, 'summary.total_user_sessions', 0),
		compTotalUserSessions: get(appSummary, 'compare_timeframe.total_user_sessions', 0),
		bounceRate: get(appSummary, 'summary.avg_bounce_rate', 0),
		compBounceRate: get(appSummary, 'compare_timeframe.avg_bounce_rate', 0),
		avgSessionDuration: get(appSummary, 'summary.avg_user_session_duration', 0),
		compAvgSessionDuration: get(appSummary, 'compare_timeframe.avg_user_session_duration', 0),
		avgClickPosition: get(appSummary, 'summary.avg_click_position', 0),
		compAvgClickPosition: get(appSummary, 'compare_timeframe.avg_click_position', 0),
		totalResults: get(appSummary, 'summary.total_results_count', 0),
		compTotalResults: get(appSummary, 'compare_timeframe.total_results_count', 0),
		isLoading: get(state, '$getAppAnalyticsSummary.isFetching'),
		tier: get(state, '$getAppPlan.results.tier'),
		errors: [get(state, '$getAppAnalyticsSummary.error')],
		filters: get(state, `$getSelectedFilters.${props.filterId}`, {}),
		featureCustomEvents: get(state, '$getAppPlan.results.feature_custom_events', false),
	};
};
const mapDispatchToProps = (dispatch, props) => ({
	fetchAppAnalyticsSummary: (appName) =>
		dispatch(getAppAnalyticsSummary(appName, props.filterId)),
	selectFilterValue: (filterId, filterKey, filterValue) =>
		dispatch(setFilterValue(filterId, filterKey, filterValue)),
});
export default connect(mapStateToProps, mapDispatchToProps)(Summary);
