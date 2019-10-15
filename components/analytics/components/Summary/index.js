import React from 'react';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { Row, Col } from 'antd';
import PropTypes from 'prop-types';
import { css } from 'emotion';
import { getAppAnalyticsSummaryByName } from '../../../../modules/selectors';
import { getAppAnalyticsSummary } from '../../../../modules/actions';
import Loader from '../../../shared/Loader/Spinner';
import { displayErrors } from '../../../../utils/heplers';
import SummaryCard from './SummaryCard';

const cardContainer = css`
	padding: 10px;
`;

class Summary extends React.Component {
	componentDidMount() {
		const { fetchAppAnalyticsSummary } = this.props;
		fetchAppAnalyticsSummary();
	}

	componentDidUpdate(prevProps) {
		const { errors } = this.props;
		displayErrors(errors, prevProps.errors);
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
			avgSuggestionClicks,
			totalConversions,
			totalResultClicks,
			totalClicks,
			noResultSearch,
			totalSuggestionClicks,
		} = this.props;
		if (isLoading) {
			return <Loader />;
		}
		return (
			<Row>
				<Col xl={8} md={12}>
					<Row gutter={8} className={cardContainer}>
						<Col span={24}>
							<SummaryCard
								style={{ borderTop: '2px solid #2f54eb', background: '#f0f5ff' }}
								title="Total Searches"
								count={totalSearches}
							/>
						</Col>
						<Col sm={24} xs={24} xl={8}>
							<SummaryCard
								title="Total Users"
								style={{ background: '#f0f5ff' }}
								count={totalUsers}
							/>
						</Col>
						<Col sm={24} xs={24} xl={8}>
							<SummaryCard
								title="Impressions"
								count={totalResults}
								style={{ background: '#f0f5ff' }}
							/>
						</Col>
						<Col sm={24} xs={24} xl={8}>
							<SummaryCard
								title="No Results"
								count={noResultSearch}
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
								style={{ borderTop: '2px solid #eb2f96', background: '#fff0f6' }}
								count={totalClicks}
								percent={avgClickRate}
							/>
						</Col>
						<Col sm={24} xs={24} xl={12}>
							<SummaryCard
								title="Suggestion Clicks"
								style={{ background: '#fff0f6' }}
								count={totalSuggestionClicks}
								percent={avgSuggestionClicks}
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
								style={{ background: '#f6ffed', borderTop: '2px solid #52c41a' }}
								title="Conversions"
								percent={avgConversionRate}
								count={totalConversions}
							/>
						</Col>
					</Row>
				</Col>
			</Row>
		);
	}
}
Summary.propTypes = {
	fetchAppAnalyticsSummary: PropTypes.func.isRequired,
	isLoading: PropTypes.bool.isRequired,
	errors: PropTypes.array.isRequired,
	avgConversionRate: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
	totalConversions: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
	totalClicks: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
	totalResultClicks: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
	avgClickRate: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
	avgSuggestionClicks: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
	totalSuggestionClicks: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
	noResultsRate: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
	noResultSearch: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
	totalSearches: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
	totalUsers: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
	totalResults: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};
const mapStateToProps = (state) => {
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
		totalResults: get(appSummary, 'summary.total_results_count', 0),
		isLoading: get(state, '$getAppAnalyticsSummary.isFetching'),
		errors: [get(state, '$getAppAnalyticsSummary.error')],
	};
};
const mapDispatchToProps = dispatch => ({
	fetchAppAnalyticsSummary: appName => dispatch(getAppAnalyticsSummary(appName)),
});
export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(Summary);
