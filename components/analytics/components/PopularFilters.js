import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { withRouter } from 'react-router-dom';
import Searches from './Searches';
import { getPopularFilters, popularFiltersFull, exportCSVFile } from '../utils';
import Loader from '../../shared/Loader/Spinner';
import { setSearchState } from '../../../modules/actions/app';

const headers = {
	key: 'Filters',
	count: 'Count',
	// clicks: 'Clicks',
	// source: 'Source',
	// conversionrate: 'Conversion Rate',
};

class PopularFilters extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isFetching: true,
			popularFilters: [],
		};
	}

	componentDidMount() {
		const { appName } = this.props;
		getPopularFilters(appName)
			.then((res) => {
				this.setState({
					popularFilters: res,
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
		const { isFetching, popularFilters } = this.state;
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
				columns={popularFiltersFull(plan, displayReplaySearch)}
				dataSource={popularFilters.map(item => ({
					...item,
					handleReplaySearch: this.handleReplaySearch,
				}))}
				title="Popular Filters"
				pagination={{
					pageSize: 10,
				}}
				onClickDownload={() => exportCSVFile(
						headers,
						popularFilters.map(item => ({
							key: item.key.replace(/,/g, ''),
							count: item.count,
							clicks: item.clicks || '-',
							source: item.source.replace(/,/g, '') || '-',
							conversionrate: item.conversionrate || '-',
						})),
						'popular_results',
					)
				}
			/>
		);
	}
}

PopularFilters.defaultProps = {
	handleReplayClick: undefined,
	displayReplaySearch: false,
};

PopularFilters.propTypes = {
	plan: PropTypes.string.isRequired,
	appName: PropTypes.string.isRequired,
	displayReplaySearch: PropTypes.bool,
	saveState: PropTypes.func.isRequired,
	handleReplayClick: PropTypes.func,
	history: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
	plan: 'growth',
	appName: get(state, '$getCurrentApp.name'),
});

const mapDispatchToProps = dispatch => ({
	saveState: state => dispatch(setSearchState(state)),
});

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(withRouter(PopularFilters));
