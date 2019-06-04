import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import get from 'lodash/get';
import Searches from './Searches';
import { getPopularResults, popularResultsFull, exportCSVFile } from '../utils';
import Loader from '../../shared/Loader/Spinner';
import { getAppPlanByName } from '../../../modules/selectors';
import { setSearchState } from '../../../modules/actions/app';

const headers = {
	key: 'Results',
	count: 'Impressions',
	source: 'Source',
	clicks: 'Clicks',
	clickposition: 'Click Position',
	conversionrate: 'Conversion Rate',
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
		const { appName, plan } = this.props;
		getPopularResults(appName, plan)
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
		const { isFetching, popularResults } = this.state;
		const { plan, displayReplaySearch } = this.props;
		if (isFetching) {
			return <Loader />;
		}
		return (
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
		);
	}
}

PopularResults.defaultProps = {
	handleReplayClick: undefined,
	displayReplaySearch: false,
};

PopularResults.propTypes = {
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
		plan: get(appPlan, 'plan'),
		appName: get(state, '$getCurrentApp.name'),
	};
};
const mapDispatchToProps = dispatch => ({
	saveState: state => dispatch(setSearchState(state)),
});
export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(withRouter(PopularResults));
