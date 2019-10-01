import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import get from 'lodash/get';
import Filter from './Filter';
import Searches from './Searches';
import { getPopularResults, popularResultsFull, exportCSVFile } from '../utils';
import Loader from '../../shared/Loader/Spinner';
import { setSearchState } from '../../../modules/actions/app';

const headers = {
	key: 'Results',
	count: 'Impressions',
	// source: 'Source',
	// clicks: 'Clicks',
	// clickposition: 'Click Position',
	// conversionrate: 'Conversion Rate',
};

class PopularResults extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isFetching: true,
			popularResults: [],
		};
	}

	componentDidMount() {
		this.fetchPopularResults();
	}

	componentDidUpdate(prevProps) {
		const { filters } = this.props;
		if (filters && JSON.stringify(prevProps.filters) !== JSON.stringify(filters)) {
			this.fetchPopularResults();
		}
	}

	fetchPopularResults = () => {
		const { appName, filters } = this.props;
		getPopularResults(appName, undefined, undefined, filters)
			.then((res) => {
				this.setState({
					popularResults: res,
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
		const { isFetching, popularResults } = this.state;
		const { plan, displayReplaySearch, filterId } = this.props;
		if (isFetching) {
			return <Loader />;
		}
		return (
			<React.Fragment>
				{filterId && <Filter filterId={filterId} />}
				<Searches
					tableProps={{
						scroll: { x: 1000 },
					}}
					showViewOption={false}
					columns={popularResultsFull(plan, displayReplaySearch)}
					dataSource={popularResults.map(item => ({
						...item,
						handleReplaySearch: this.handleReplaySearch,
					}))}
					title="Popular Results"
					pagination={{
						pageSize: 10,
					}}
					onClickDownload={() => exportCSVFile(
							headers,
							popularResults.map(item => ({
								key: item.key,
								count: item.count,
								source: item.source && item.source.replace(/,/g, ''),
								clicks: item.clicks || '-',
								clickposition: item.clickposition || '-',
								conversionrate: item.conversionrate || '-',
							})),
							'popular_results',
						)
					}
				/>
			</React.Fragment>
		);
	}
}

PopularResults.defaultProps = {
	handleReplayClick: undefined,
	displayReplaySearch: false,
	filterId: undefined,
	filters: undefined,
};

PopularResults.propTypes = {
	filterId: PropTypes.string,
	filters: PropTypes.object,
	plan: PropTypes.string.isRequired,
	appName: PropTypes.string.isRequired,
	displayReplaySearch: PropTypes.bool,
	saveState: PropTypes.func.isRequired,
	handleReplayClick: PropTypes.func,
	history: PropTypes.object.isRequired,
};

const mapStateToProps = (state, props) => ({
	plan: 'growth',
	appName: get(state, '$getCurrentApp.name'),
	filters: get(state, `$getSelectedFilters.${props.filterId}`, {}),
});
const mapDispatchToProps = dispatch => ({
	saveState: state => dispatch(setSearchState(state)),
});
export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(withRouter(PopularResults));
