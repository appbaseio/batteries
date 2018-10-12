import React, { Component } from 'react';
import get from 'lodash/get';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { getAppInfo, setCurrentApp, getAppPlan } from '../../modules/actions';
import { getAppInfoByName, getAppPlanByName } from '../../modules/selectors';
import Loader from '../shared/Loader/Spinner';
import { displayErrors } from '../../utils/heplers';

let previousProps = {};

class BaseContainer extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isLoading: true,
		};
		const { appName, appId, updateCurrentApp } = props;
		if (appName || appId) {
			updateCurrentApp(appName, appId);
		}
	}

	static getDerivedStateFromProps(props) {
		if (previousProps.isLoading && !props.isLoading) {
			previousProps = props;
			return {
				isLoading: false,
			};
		}
		previousProps = props;
		return null;
	}

	componentDidMount() {
		// Fetch some common api calls
		const {
			appId,
			appName,
			fetchAppInfo,
			fetchAppPlan,
			shouldFetchAppInfo,
			shouldFetchAppPlan,
			isAppPlanFetched,
			isAppInfoPresent,
		} = this.props;
		if (shouldFetchAppInfo && !isAppInfoPresent && appId) {
			fetchAppInfo(appId);
		} else if (shouldFetchAppPlan && !isAppPlanFetched) {
			fetchAppPlan(appName);
		} else {
			this.setState({
				isLoading: false,
			});
		}
	}

	componentDidUpdate(prevProps) {
		const { errors } = this.props;
		displayErrors(errors, prevProps.errors);
	}

	render() {
		const { children, component, ...props } = this.props;
		const { isLoading } = this.state;
		if (isLoading) {
			return <Loader />;
		}
		if (component) {
			return (
				<div key={props.appName}>{React.createElement(children || component, props)}</div>
			);
		}

		return <div key={props.appName}>{children}</div>;
	}
}

BaseContainer.defaultProps = {
	isLoading: false,
	errors: [],
	component: undefined,
	children: null,
	shouldFetchAppInfo: true,
	shouldFetchAppPlan: true,
	appId: undefined,
};

BaseContainer.propTypes = {
	appName: PropTypes.string.isRequired,
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
	isLoading: get(state, '$getAppInfo.isFetching') || get(state, '$getAppPlan.isFetching'),
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
