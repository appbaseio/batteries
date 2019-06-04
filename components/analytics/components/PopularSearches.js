import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { withRouter } from 'react-router-dom';
import Searches from './Searches';
import { getPopularSearches, popularSearchesFull, exportCSVFile } from '../utils';
import { setSearchState } from '../../../modules/actions/app';
import Loader from '../../shared/Loader/Spinner';
import { getAppPlanByName } from '../../../modules/selectors';

const headers = {
	key: 'Search Terms',
	count: 'Total Queries',
	clicks: 'Clicks',
	clickposition: 'Click Position',
	conversionrate: 'Conversion Rate',
};
class PopularSearches extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isFetching: true,
			popularSearches: [],
		};
	}

	componentDidMount() {
		const { appName, plan } = this.props;
		getPopularSearches(appName, plan)
			.then((res) => {
				this.setState({
					popularSearches: res,
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
		const { isFetching, popularSearches } = this.state;
		const { plan, displayReplaySearch } = this.props;
		if (isFetching) {
			return <Loader />;
		}
		return (
			<Searches
				tableProps={{
					scroll: { x: 700 },
				}}
				showViewOption={false}
				columns={popularSearchesFull(plan, displayReplaySearch)}
				dataSource={popularSearches.map(item => ({
					...item,
					handleReplaySearch: this.handleReplaySearch,
				}))}
				title="Popular Searches"
				onClickDownload={() => exportCSVFile(
						headers,
						popularSearches.map(item => ({
							key: item.key,
							count: item.count,
							clicks: item.clicks || '-',
							clickposition: item.clickposition || '-',
							conversionrate: item.conversionrate || '-',
						})),
						'popular_searches',
					)
				}
				pagination={{
					pageSize: 10,
				}}
			/>
		);
	}
}
PopularSearches.defaultProps = {
	handleReplayClick: undefined,
	displayReplaySearch: false,
};
PopularSearches.propTypes = {
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
)(withRouter(PopularSearches));
