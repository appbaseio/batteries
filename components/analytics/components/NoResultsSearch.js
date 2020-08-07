import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { withRouter } from 'react-router-dom';
import Searches from './Searches';
import Filter from './Filter';
import { getNoResultSearches, exportCSVFile, noResultsFull, applyFilterParams } from '../utils';
import Loader from '../../shared/Loader/Spinner';
import { setSearchState } from '../../../modules/actions/app';
import { setFilterValue } from '../../../modules/actions';
import { withErrorToaster } from '../../shared/ErrorToaster/ErrorToaster';

const headers = {
	key: 'Search Terms',
	count: 'Total Queries',
};
class NoResultsSearch extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isFetching: false,
			noResults: [],
		};
	}

	componentDidMount() {
		const { filterId, filters, selectFilterValue } = this.props;
		applyFilterParams({
			filters,
			filterId,
			callback: this.fetchNoResults,
			applyFilter: selectFilterValue,
		});
	}

	componentDidUpdate(prevProps) {
		const { filters } = this.props;
		if (filters && JSON.stringify(prevProps.filters) !== JSON.stringify(filters)) {
			this.fetchNoResults();
		}
	}

	fetchNoResults = () => {
		const { appName, filters } = this.props;
		this.setState({
			isFetching: true,
		});
		getNoResultSearches(appName, undefined, filters)
			.then((res) => {
				this.setState({
					noResults: res,
					isFetching: false,
				});
			})
			.catch(() => {
				this.setState({
					isFetching: false,
				});
			});
	};

	handleReplaySearch = (searchState) => {
		const { saveState, history, appName, handleReplayClick } = this.props;
		saveState(searchState);
		if (handleReplayClick) {
			handleReplayClick(appName);
		} else {
			history.push(`/app/${appName}/search-preview`);
		}
	};

	render() {
		const { isFetching, noResults } = this.state;
		const { displayReplaySearch, plan, filterId } = this.props;

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
					dataSource={noResults.map((item) => ({
						...item,
						handleReplaySearch: this.handleReplaySearch,
						handleQueryRule: this.handleQueryRule,
					}))}
					columns={noResultsFull(plan, displayReplaySearch)}
					title="No Results Searches"
					pagination={{
						pageSize: 10,
					}}
					onClickDownload={() =>
						exportCSVFile(
							headers,
							noResults.map((item) => ({
								key: item.key,
								count: item.count,
							})),
							'no_results_searches',
						)
					}
				/>
			</React.Fragment>
		);
	}
}
NoResultsSearch.defaultProps = {
	handleReplayClick: undefined,
	displayReplaySearch: false,
	filterId: undefined,
	filters: {},
};

NoResultsSearch.propTypes = {
	plan: PropTypes.string.isRequired,
	filterId: PropTypes.string,
	filters: PropTypes.object,
	appName: PropTypes.string.isRequired,
	displayReplaySearch: PropTypes.bool,
	saveState: PropTypes.func.isRequired,
	handleReplayClick: PropTypes.func,
	history: PropTypes.object.isRequired,
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
	connect(mapStateToProps, mapDispatchToProps)(withRouter(NoResultsSearch)),
);
