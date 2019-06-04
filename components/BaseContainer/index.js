import React, { Component } from 'react';
import get from 'lodash/get';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { getAppInfo, setCurrentApp, getAppPlan } from '../../modules/actions';
import { getAppInfoByName, getAppPlanByName } from '../../modules/selectors';
import Loader from '../shared/Loader/Spinner';
import { displayErrors } from '../../utils/heplers';

let prevProps;

class BaseContainer extends Component {
	constructor(props) {
		super(props);
		let isLoading = true;
		const {
			appName,
			appId,
			updateCurrentApp,
			fetchAppInfo,
			fetchAppPlan,
			shouldFetchAppInfo,
			shouldFetchAppPlan,
			isAppPlanFetched,
			isAppInfoPresent,
		} = props;
		if (appName || appId) {
			updateCurrentApp(appName, appId);
		}
		const shouldFetchApp = shouldFetchAppInfo && !isAppInfoPresent && appId;
		const shouldFetchPlan = shouldFetchAppPlan && !isAppPlanFetched;
		if (shouldFetchApp) {
			fetchAppInfo(appId);
		}
		if (shouldFetchPlan) {
			fetchAppPlan(appName);
		}
		if(!shouldFetchApp && !shouldFetchPlan) {
			isLoading = false;
		}
		this.state = {
			isLoading,
		};
	}

	static getDerivedStateFromProps(props, state) {
		// Only call after first update
		if (prevProps && state.isLoading && !props.isLoading) {
			return {
				isLoading: false,
			};
		}
		return null;
	}

	componentDidUpdate(props) {
		const { errors } = this.props;
		displayErrors(errors, props.errors);
		prevProps = this.props;
	}

	render() {
		const { children, component, loader, ...props } = this.props;
		const { isLoading } = this.state;
		if (isLoading) {
			return loader || <Loader />;
		}
		if (component) {
			return <div key={props.appName}>{React.createElement(component, props)}</div>;
		}

		return <div key={props.appName}>{children}</div>;
	}
}

BaseContainer.defaultProps = {
	isLoading: false,
	errors: [],
	loader: undefined,
	component: undefined,
	children: null,
	shouldFetchAppInfo: true,
	shouldFetchAppPlan: true,
	appId: undefined,
};

BaseContainer.propTypes = {
	appName: PropTypes.string.isRequired,
	loader: PropTypes.node,
	appId: PropTypes.string,
	isLoading: PropTypes.bool,
	errors: PropTypes.array,
	shouldFetchAppPlan: PropTypes.bool,
	shouldFetchAppInfo: PropTypes.bool,
	children: PropTypes.oneOfType([PropTypes.element, PropTypes.node, PropTypes.func]),
	fetchAppInfo: PropTypes.func.isRequired,
	fetchAppPlan: PropTypes.func.isRequired,
	updateCurrentApp: PropTypes.func.isRequired,
	component: PropTypes.func,
	isAppPlanFetched: PropTypes.bool.isRequired,
	isAppInfoPresent: PropTypes.bool.isRequired,
};

const mapStateToProps = (state, ownProps) => ({
	isLoading:
		ownProps.shouldFetchAppInfo && ownProps.shouldFetchAppPlan
			? get(state, '$getAppInfo.isFetching') && get(state, '$getAppPlan.isFetching')
			: get(state, '$getAppInfo.isFetching') || get(state, '$getAppPlan.isFetching'),
	isAppPlanFetched: !!getAppPlanByName(state),
	isAppInfoPresent: !!getAppInfoByName(state),
	errors: [
		ownProps.shouldFetchAppInfo !== false && get(state, '$getAppInfo.error'),
		ownProps.shouldFetchAppPlan !== false && get(state, '$getAppPlan.error'),
	],
});

const mapDispatchToProps = dispatch => ({
	fetchAppInfo: appId => dispatch(getAppInfo(appId)),
	fetchAppPlan: appName => dispatch(getAppPlan(appName)),
	updateCurrentApp: (appName, appId) => dispatch(setCurrentApp(appName, appId)),
});

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(BaseContainer);
