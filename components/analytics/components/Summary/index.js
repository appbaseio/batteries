import React from 'react';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { Row, Col } from 'antd';
import PropTypes from 'prop-types';
import { css } from 'emotion';
import { getAppAnalyticsSummaryByName } from '../../../../modules/selectors';
import { getAppAnalyticsSummary } from '../../../../modules/actions';
import Loader from '../../../shared/Loader/Spinner';
import { isValidPlan } from '../../../../utils';
import { displayErrors } from '../../../../utils/heplers';
import SummaryCard from './SummaryCard';
import { parseTimeDuration } from '../../utils';

const cardContainer = css`
	padding: 10px;
`;

class Summary extends React.Component {
	componentDidMount() {
		const { fetchAppAnalyticsSummary } = this.props;
		fetchAppAnalyticsSummary();
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
			totalResults,
			noResultsRate,
			totalUsers,
			totalConversions,
			totalResultClicks,
			totalClicks,
			noResultSearch,
			totalSuggestionClicks,
			totalUserSessions,
			avgSessionDuration,
			bounceRate,
			tier,
		} = this.props;

		if (isLoading) {
			return <Loader />;
		}
		const formattedTime = parseTimeDuration(avgSessionDuration);

		return (
			<React.Fragment>
				{isValidPlan(tier, false) ? (
					<Row gutter={8}>
						<Col sm={24} xs={24} xl={6}>
							<SummaryCard
								style={{
									borderTop: '2px solid #000',
								}}
								title="Total Users"
								count={totalUsers}
							/>
						</Col>
						<Col sm={24} xs={24} xl={6}>
							<SummaryCard
								style={{
									borderTop: '2px solid #000',
								}}
								title="Total Sessions"
								count={totalUserSessions}
							/>
						</Col>
						<Col sm={24} xs={24} xl={6}>
							<SummaryCard
								style={{
									borderTop: '2px solid #000',
								}}
								title="Bounce Rate"
								count={bounceRate}
							/>
						</Col>
						<Col sm={24} xs={24} xl={6}>
							<SummaryCard
								style={{
									borderTop: '2px solid #000',
								}}
								title="Session Duration"
								count={`${formattedTime.time} ${formattedTime.formattedUnit}`}
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
									count={totalSearches}
								/>
							</Col>
							<Col sm={24} xs={24} xl={12}>
								<SummaryCard
									title="Impressions"
									count={totalResults}
									style={{ background: '#f0f5ff' }}
								/>
							</Col>
							<Col sm={24} xs={24} xl={12}>
								<SummaryCard
									title="No Results"
									count={noResultSearch}
									showPercent
									percent={noResultsRate}
									style={{ background: '#f0f5ff' }}
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
									count={totalClicks}
									showPercent
									percent={avgClickRate}
								/>
							</Col>
							<Col sm={24} xs={24} xl={12}>
								<SummaryCard
									title="Suggestion Clicks"
									style={{ background: '#fff0f6' }}
									count={totalSuggestionClicks}
								/>
							</Col>
							<Col sm={24} xs={24} xl={12}>
								<SummaryCard
									title="Result Clicks"
									style={{ background: '#fff0f6' }}
									count={totalResultClicks}
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
									count={totalConversions}
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
};

Summary.propTypes = {
	fetchAppAnalyticsSummary: PropTypes.func.isRequired,
	isLoading: PropTypes.bool.isRequired,
	errors: PropTypes.array.isRequired,
	avgConversionRate: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
	totalConversions: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
	totalClicks: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
	totalResultClicks: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
	avgClickRate: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
	// avgSuggestionClicks: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
	totalSuggestionClicks: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
	noResultsRate: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
	noResultSearch: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
	totalSearches: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
	totalUsers: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
	totalResults: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
	totalUserSessions: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
	bounceRate: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
	avgSessionDuration: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
	// eslint-disable-next-line
	filterId: PropTypes.string,
	filters: PropTypes.object,
	tier: PropTypes.string.isRequired,
};
const mapStateToProps = (state, props) => {
	const appSummary = getAppAnalyticsSummaryByName(state);
	return {
		avgConversionRate: get(appSummary, 'summary.avg_conversion_rate', 0),
		totalConversions: get(appSummary, 'summary.total_conversions', 0),
		totalClicks: get(appSummary, 'summary.total_clicks', 0),
		totalResultClicks: get(appSummary, 'summary.total_results_clicks', 0),
		avgClickRate: get(appSummary, 'summary.avg_click_rate', 0),
		avgSuggestionClicks: get(appSummary, 'summary.avg_suggestions_click_rate', 0),
		totalSuggestionClicks: get(appSummary, 'summary.total_suggestions_clicks', 0),
		noResultsRate: get(appSummary, 'summary.no_results_rate', 0),
		noResultSearch: get(appSummary, 'summary.total_no_results_searches', 0),
		totalSearches: get(appSummary, 'summary.total_searches', 0),
		totalUsers: get(appSummary, 'summary.total_users', 0),
		totalUserSessions: get(appSummary, 'summary.total_user_sessions', 0),
		bounceRate: get(appSummary, 'summary.avg_bounce_rate', 0),
		avgSessionDuration: get(appSummary, 'summary.avg_user_session_duration', 0),
		totalResults: get(appSummary, 'summary.total_results_count', 0),
		isLoading: get(state, '$getAppAnalyticsSummary.isFetching'),
		tier: get(state, '$getAppPlan.results.tier'),
		errors: [get(state, '$getAppAnalyticsSummary.error')],
		filters: get(state, `$getSelectedFilters.${props.filterId}`, {}),
	};
};
const mapDispatchToProps = (dispatch, props) => ({
	fetchAppAnalyticsSummary: appName => dispatch(getAppAnalyticsSummary(appName, props.filterId)),
});
export default connect(mapStateToProps, mapDispatchToProps)(Summary);
