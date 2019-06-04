import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { withRouter } from 'react-router-dom';
import Searches from './Searches';
import { getNoResultSearches, exportCSVFile, noResultsFull } from '../utils';
import Loader from '../../shared/Loader/Spinner';
import { getAppPlanByName } from '../../../modules/selectors';
import { setSearchState } from '../../../modules/actions/app';

const headers = {
	key: 'Search Terms',
	count: 'Total Queries',
};
class NoResultsSearch extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isFetching: true,
			noResults: [],
		};
	}

	componentDidMount() {
		const { appName, plan } = this.props;
		getNoResultSearches(appName, plan)
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
	}

	handleReplaySearch = (searchState) => {
		const {
 saveState, history, appName, handleReplayClick,
} = this.props;
		saveState(searchState);
		if (handleReplayClick) {
			handleReplayClick(appName);
		} else {
			history.push(`/app/${appName}/search-preview`);
		}
	};

	render() {
		const { isFetching, noResults } = this.state;
		const { displayReplaySearch, plan } = this.props;
		if (isFetching) {
			return <Loader />;
		}
		return (
			<Searches
				tableProps={{
					scroll: { x: 700 },
				}}
				showViewOption={false}
				dataSource={noResults.map(item => ({
					...item,
					handleReplaySearch: this.handleReplaySearch,
				}))}
				columns={noResultsFull(plan, displayReplaySearch)}
				title="No Results Searches"
				pagination={{
					pageSize: 10,
				}}
				onClickDownload={() => exportCSVFile(
						headers,
						noResults.map(item => ({
							key: item.key,
							count: item.count,
						})),
						'no_results_searches',
					)
				}
			/>
		);
	}
}
NoResultsSearch.defaultProps = {
	handleReplayClick: undefined,
	displayReplaySearch: false,
};

NoResultsSearch.propTypes = {
	plan: PropTypes.string.isRequired,
	appName: PropTypes.string.isRequired,
	displayReplaySearch: PropTypes.bool,
	saveState: PropTypes.func.isRequired,
	handleReplayClick: PropTypes.func,
	history: PropTypes.object.isRequired,
};
const mapStateToProps = (state) => {
	const appPlan = getAppPlanByName(state);
	return {
		plan: get(appPlan, 'plan', 'free'),
		appName: get(state, '$getCurrentApp.name'),
	};
};

const mapDispatchToProps = dispatch => ({
	saveState: state => dispatch(setSearchState(state)),
});

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(withRouter(NoResultsSearch));
