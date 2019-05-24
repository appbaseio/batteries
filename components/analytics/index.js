import React from 'react';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Analytics from './components/Analytics';
import { getAppAnalytics } from '../../modules/actions';
import Loader from '../shared/Loader/Spinner';
import { getAppPlanByName, getAppAnalyticsByName } from '../../modules/selectors';
import RequestLogs from './components/RequestLogs';

let prevProps = {};
class Main extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isLoading: props.isPaid,
		};
	}

	static getDerivedStateFromProps(props) {
		if (prevProps.isFetching && !props.isFetching) {
			prevProps = props;
			return {
				isLoading: false,
			};
		}
		prevProps = props;
		return null;
	}

	componentDidMount() {
		// Comment out the below code to test paid user
		const { fetchAppAnalytics, isPaid } = this.props;
		if (isPaid) {
			fetchAppAnalytics();
		}
	}

	render() {
		const { isLoading } = this.state;
		const {
			noResults,
			popularSearches,
			searchVolume,
			popularResults,
			popularFilters,
			onClickViewAll,
			toolTipMessages,
		} = this.props;
		const { appName, chartWidth, plan } = this.props;
		if (isLoading) {
			return <Loader />;
		}
		return (
			<React.Fragment>
				<Analytics
					toolTipMessages={toolTipMessages}
					noResults={noResults}
					chartWidth={chartWidth}
					plan={plan}
					popularSearches={popularSearches}
					popularFilters={popularFilters}
					popularResults={popularResults}
					searchVolume={searchVolume}
					onClickViewAll={onClickViewAll}
				/>
				<div css="margin-top: 20px">
					<RequestLogs size={100} appName={appName} />
				</div>
			</React.Fragment>
		);
	}
}
Main.defaultProps = {
	chartWidth: undefined,
	onClickViewAll: null,
};
Main.propTypes = {
	appName: PropTypes.string.isRequired,
	onClickViewAll: PropTypes.object,
	chartWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	plan: PropTypes.string.isRequired,
	isPaid: PropTypes.bool.isRequired,
	fetchAppAnalytics: PropTypes.func.isRequired,
	popularSearches: PropTypes.array.isRequired,
	popularResults: PropTypes.array.isRequired,
	popularFilters: PropTypes.array.isRequired,
	searchVolume: PropTypes.array.isRequired,
	noResults: PropTypes.array.isRequired,
	isFetching: PropTypes.bool.isRequired, //eslint-disable-line
};
const mapStateToProps = (state) => {
	const appPlan = getAppPlanByName(state);
	const appAnalytics = getAppAnalyticsByName(state);
	return {
		plan: get(appPlan, 'plan', 'free'),
		isPaid: get(appPlan, 'isPaid', false),
		appName: get(state, '$getCurrentApp.name'),
		popularSearches: get(appAnalytics, 'popularSearches', []),
		popularResults: get(appAnalytics, 'popularResults', []),
		popularFilters: get(appAnalytics, 'popularFilters', []),
		searchVolume: get(appAnalytics, 'searchVolume', []),
		noResults: get(appAnalytics, 'noResultSearches', []),
		isFetching: get(state, '$getAppAnalytics.isFetching'),
	};
};
const mapDispatchToProps = dispatch => ({
	fetchAppAnalytics: (appName, plan) => dispatch(getAppAnalytics(appName, plan)),
});
export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(Main);
