import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { withRouter } from 'react-router-dom';
import Searches from './Searches';
import Filter from './Filter';
import ViewSource from './ViewSource';
import { exportCSVFile, recentResultsFull, applyFilterParams } from '../utils';
import { displayErrors } from '../../../utils/helpers';
import Loader from '../../shared/Loader/Spinner';
import { getAppRecentResults, setFilterValue } from '../../../modules/actions';
import { withErrorToaster } from '../../shared/ErrorToaster/ErrorToaster';

const headers = {
	key: 'Results',
	count: 'Impressions',
};
class RecentResults extends React.Component {
	componentDidMount() {
		const { filterId, filters, selectFilterValue } = this.props;
		applyFilterParams({
			filters,
			filterId,
			callback: this.fetchRecentResults,
			applyFilter: selectFilterValue,
		});
	}

	componentDidUpdate(prevProps) {
		const { filters, errors } = this.props;
		displayErrors(errors, prevProps.errors);
		if (filters && prevProps.filters !== filters) {
			this.fetchRecentResults();
		}
	}

	fetchRecentResults = () => {
		const { appName, fetchRecentResults } = this.props;
		fetchRecentResults(appName);
	};

	getResults = () => {
		const { appName, recentResults } = this.props;
		if (recentResults && recentResults[appName]) {
			return recentResults[appName];
		}
		if (recentResults && recentResults.default) {
			return recentResults.default;
		}
		return [];
	};

	render() {
		const { filterId, isFetching, recentResults } = this.props;

		if (isFetching) {
			return <Loader />;
		}
		return (
			<React.Fragment>
				{filterId && <Filter filterId={filterId} />}
				<Searches
					tableProps={{
						scroll: { x: 700 },
					}}
					showViewOption={false}
					dataSource={this.getResults().map((item) => item)}
					breakWord
					columns={recentResultsFull(ViewSource)}
					title="Recent Results"
					pagination={{
						pageSize: 10,
					}}
					onClickDownload={() =>
						exportCSVFile(
							headers,
							(recentResults || []).map((item) => ({
								key: item.key,
								count: item.count,
							})),
							'recent_results',
						)
					}
				/>
			</React.Fragment>
		);
	}
}
RecentResults.defaultProps = {
	appName: undefined,
	filterId: undefined,
	filters: undefined,
	isFetching: false,
	recentResults: undefined,
};

RecentResults.propTypes = {
	filterId: PropTypes.string,
	filters: PropTypes.object,
	appName: PropTypes.string,
	selectFilterValue: PropTypes.func.isRequired,
	fetchRecentResults: PropTypes.func.isRequired,
	isFetching: PropTypes.bool,
	recentResults: PropTypes.object,
	errors: PropTypes.array.isRequired,
};
const mapStateToProps = (state, props) => ({
	appName: get(state, '$getCurrentApp.name'),
	filters: get(state, `$getSelectedFilters.${props.filterId}`),
	isFetching: get(state, '$getAppRecentResults.isFetching'),
	recentResults: get(state, '$getAppRecentResults.results'),
	errors: [get(state, '$getAppRecentResults.error')],
});

const mapDispatchToProps = (dispatch, props) => ({
	fetchRecentResults: (appName) => dispatch(getAppRecentResults(appName, props.filterId)),
	selectFilterValue: (filterId, filterKey, filterValue) =>
		dispatch(setFilterValue(filterId, filterKey, filterValue)),
});

export default withErrorToaster(
	connect(mapStateToProps, mapDispatchToProps)(withRouter(RecentResults)),
);
