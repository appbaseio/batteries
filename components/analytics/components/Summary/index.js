import React from 'react';
import { connect } from 'react-redux';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import { getAppAnalyticsSummaryByName } from '../../../../modules/selectors';
import { getAppAnalyticsSummary } from '../../../../modules/actions';
import Loader from '../../../shared/Loader/Spinner';
import { displayErrors } from '../../../../utils/heplers';
import SummaryCard from './SummaryCard';
import Flex from '../../../shared/Flex';

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
			isLoading,
			avgClickRate,
			avgConversionRate,
			totalSearches,
			toolTipMessages,
		} = this.props;
		if (isLoading) {
			return <Loader />;
		}
		return (
			<Flex flexDirection="row" css="flex-wrap:wrap">
				<SummaryCard
					title="Total Searches"
					toolTipMessage={toolTipMessages.totalSearches}
					count={totalSearches}
					border="#00f68e"
				/>
				<SummaryCard
					title="Average Click Rate"
					toolTipMessage={toolTipMessages.averageClickRate}
					count={avgClickRate}
					border="#1A74FF"
					formatValue={value => `${value}%`}
				/>
				<SummaryCard
					title="Average Conversion Rate"
					toolTipMessage={toolTipMessages.conversion}
					count={avgConversionRate}
					border="#C944FF"
					formatValue={value => `${value}%`}
				/>
			</Flex>
		);
	}
}
Summary.defaultProps = {
	toolTipMessages: {},
};
Summary.propTypes = {
	fetchAppAnalyticsSummary: PropTypes.func.isRequired,
	isLoading: PropTypes.bool.isRequired,
	avgClickRate: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
	avgConversionRate: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
	totalSearches: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
	errors: PropTypes.array.isRequired,
	toolTipMessages: PropTypes.object,
};
const mapStateToProps = (state) => {
	const appSummary = getAppAnalyticsSummaryByName(state);
	return {
		avgClickRate: get(appSummary, 'avgClickRate', 0),
		avgConversionRate: get(appSummary, 'avgConversionRate', 0),
		totalSearches: get(appSummary, 'totalSearches', 0),
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
