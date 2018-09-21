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
 isLoading, avgClickRate, avgConversionRate, totalSearches,
} = this.props;
		if (isLoading) {
			return <Loader />;
		}
		return (
			<Flex flexDirection="row" css="flex-wrap:wrap">
				<SummaryCard title="Total Searches" count={totalSearches} border="#00f68e" />
				<SummaryCard title="Average Click Rate" count={avgClickRate} border="#1A74FF" />
				<SummaryCard title="Conversion" count={avgConversionRate} border="#C944FF" />
			</Flex>
		);
	}
}
Summary.propTypes = {
	fetchAppAnalyticsSummary: PropTypes.func.isRequired,
	isLoading: PropTypes.bool.isRequired,
	avgClickRate: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
	avgConversionRate: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
	totalSearches: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
	errors: PropTypes.array.isRequired,
};
const mapStateToProps = (state) => {
	const appSummary = getAppAnalyticsSummaryByName(state);
	return {
		avgClickRate: get(appSummary, 'avgClickRate'),
		avgConversionRate: get(appSummary, 'avgConversionRate'),
		totalSearches: get(appSummary, 'totalSearches'),
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
