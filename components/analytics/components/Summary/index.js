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
		} = this.props;

		return (
			<React.Fragment>
				{isLoading ? (
					<Loader />
				) : (
					<Flex flexDirection="row" css="flex-wrap:wrap">
						<SummaryCard
							title="Total Searches"
							count={totalSearches}
							border="#00f68e"
						/>
						<SummaryCard
							title="Average Click Rate"
							count={avgClickRate}
							border="#1A74FF"
						/>
						<SummaryCard
							title="Conversion"
							count={avgConversionRate}
							border="#C944FF"
						/>
					</Flex>
				)}
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
	avgClickRate: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
	avgConversionRate: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
	totalSearches: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
	errors: PropTypes.array.isRequired,
	// eslint-disable-next-line
	filterId: PropTypes.string,
	filters: PropTypes.object,
};
const mapStateToProps = (state, props) => {
	const appSummary = getAppAnalyticsSummaryByName(state);
	return {
		avgClickRate: get(appSummary, 'summary.avg_click_rate', 0),
		avgConversionRate: get(appSummary, 'summary.avg_conversion_rate', 0),
		totalSearches: get(appSummary, 'summary.total_searches', 0),
		isLoading: get(state, '$getAppAnalyticsSummary.isFetching'),
		errors: [get(state, '$getAppAnalyticsSummary.error')],
		filters: get(state, `$getSelectedFilters.${props.filterId}`, {}),
	};
};
const mapDispatchToProps = (dispatch, props) => ({
	fetchAppAnalyticsSummary: appName => dispatch(getAppAnalyticsSummary(appName, props.filterId)),
});
export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(Summary);
