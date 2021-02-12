import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { withRouter } from 'react-router-dom';
import Searches from './Searches';
import Filter from './Filter';
import ViewSource from './ViewSource';
import { getRecentResults, exportCSVFile, recentResultsFull, applyFilterParams } from '../utils';
import Loader from '../../shared/Loader/Spinner';
import { setSearchState } from '../../../modules/actions/app';
import { setFilterValue } from '../../../modules/actions';
import { withErrorToaster } from '../../shared/ErrorToaster/ErrorToaster';

const headers = {
	key: 'Results',
	count: 'Impressions',
};
class RecentResults extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isFetching: false,
			recentResults: null,
		};
	}

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
		const { filters } = this.props;
		if (filters && prevProps.filters !== filters) {
			this.fetchRecentResults();
		}
	}

	fetchRecentResults = () => {
		const { appName, filters } = this.props;
		this.setState({
			isFetching: true,
		});
		getRecentResults(appName, undefined, filters)
			.then((res) => {
				this.setState({
					recentResults: res,
					isFetching: false,
				});
			})
			.catch(() => {
				this.setState({
					isFetching: false,
				});
			});
	};

	render() {
		const { isFetching, recentResults } = this.state;
		const { plan, filterId } = this.props;

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
					dataSource={(recentResults || []).map((item) => item)}
					breakWord
					columns={recentResultsFull(plan, ViewSource)}
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
};

RecentResults.propTypes = {
	plan: PropTypes.string.isRequired,
	filterId: PropTypes.string,
	filters: PropTypes.object,
	appName: PropTypes.string,
	selectFilterValue: PropTypes.func.isRequired,
};
const mapStateToProps = (state, props) => ({
	plan: 'growth',
	appName: get(state, '$getCurrentApp.name'),
	filters: get(state, `$getSelectedFilters.${props.filterId}`),
});

const mapDispatchToProps = (dispatch) => ({
	saveState: (state) => dispatch(setSearchState(state)),
	selectFilterValue: (filterId, filterKey, filterValue) =>
		dispatch(setFilterValue(filterId, filterKey, filterValue)),
});

export default withErrorToaster(
	connect(mapStateToProps, mapDispatchToProps)(withRouter(RecentResults)),
);
