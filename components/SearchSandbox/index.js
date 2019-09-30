import React, { Component } from 'react';
import { css } from 'emotion';
import { message } from 'antd';
import { getParameters } from 'codesandbox/lib/api/define';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { connect } from 'react-redux';

import Header from './components/Header';
import Walkthrough from '../shared/Walkthrough';
import { getMappingsTree, getESVersion } from '../../utils/mappings';
import { getPreferences, setPreferences } from '../../utils/sandbox';
import getSearchTemplate, { getTemplateStyles } from './template';
import { getAppMappings as getMappings, clearSearchState } from '../../modules/actions';
import { getRawMappingsByAppName } from '../../modules/selectors';
import { getURL } from '../../../constants/config';
import joyrideSteps from './utils/joyrideSteps';

const wrapper = css`
	padding: 15px;
`;

export const SandboxContext = React.createContext();

class SearchSandbox extends Component {
	constructor(props) {
		super(props);
		const profile = 'default';
		const componentProps = props.searchState || {};
		this.state = {
			profile,
			profileList: [profile],
			configs: [],
			mappings: null,
			componentProps,
			filterCount: Object.keys(componentProps).filter(
				item => item !== 'search' && item !== 'result',
			).length,
			loading: true,
			version: null,
			analytics: true,
		};
	}

	static getDerivedStateFromProps(props, state) {
		const { mappings } = props;
		if (!state.mappings && mappings && state.version) {
			const mappingsType = Object.keys(mappings).length > 0 ? Object.keys(mappings)[0] : '';
			return {
				mappings: getMappingsTree(mappings, state.version),
				mappingsType,
			};
		}

		return null;
	}

	async componentDidMount() {
		const {
 appName, isDashboard, credentials, searchState, url,
} = this.props;
		const { profileList: profileListState, profile } = this.state;
		if (isDashboard) {
			getPreferences(appName, credentials)
				.then((pref) => {
					this.pref = pref || {};
					const profileList = Array.from(
						new Set([...profileListState, ...Object.keys(this.pref)]),
					);
					const componentProps = this.pref[profile] || {};
					if (searchState) {
						this.setState({
							profileList,
							loading: false,
							analytics: this.pref.analytics === undefined ? true : this.pref.analytics,
						});
					} else {
						this.setState({
							componentProps,
							profileList,
							loading: false,
							filterCount: Object.keys(componentProps).filter(
								item => item !== 'search' && item !== 'result',
							).length,
							analytics: this.pref.analytics === undefined ? true : this.pref.analytics,
						});
					}
				})
				.catch(() => this.getLocalPref());
		} else {
			this.getLocalPref();
		}

		const { getAppMappings } = this.props;
		const version = await getESVersion(appName, credentials);
		this.setState({
			version,
		});
		getAppMappings(appName, credentials, url);
	}

	componentWillUnmount() {
		const { clearProfile } = this.props;
		clearProfile();
	}

	getLocalPref = () => {
		const { appName } = this.props;
		const { profileList: profileListState, profile } = this.state;
		let pref = localStorage.getItem(appName);
		if (pref) pref = JSON.parse(pref);
		this.pref = pref || {};
		const profileList = Array.from(new Set([...profileListState, ...Object.keys(this.pref)]));
		const componentProps = this.pref[profile] || {};
		this.setState({
			componentProps,
			profileList,
			loading: false,
			filterCount: Object.keys(componentProps).filter(
				item => item !== 'search' && item !== 'result',
			).length,
			analytics: this.pref.analytics === undefined ? true : this.pref.analytics,
		});
	};

	setLocalPref = (pref = {}) => {
		const { appName } = this.props;
		const value = JSON.stringify(pref);
		localStorage.setItem(appName, value);
	};

	getActiveConfig = () => {
		const { configs, profile } = this.state;
		return configs.find(config => config.profile === profile);
	};

	setFilterCount = (filterCount) => {
		this.setState({
			filterCount,
		});
	};

	get isUnsaved() {
		const { searchState } = this.props;
		return !!searchState;
	}

	toggleAnalytics = () => {
		this.setState(
			prevState => ({
				analytics: !prevState.analytics,
			}),
			this.savePreferences,
		);
	};

	savePreferences = (forceUpdate) => {
		// prettier-ignore
		const {
			isDashboard,
			appName,
			clearProfile,
			credentials,
		} = this.props;
		const { profile, componentProps, analytics } = this.state;
		const filteredProps = {};
		Object.keys(componentProps).forEach((item) => {
			const { defaultValue, value, ...state } = componentProps[item];
			filteredProps[item] = state;
		});
		this.pref = {
			...this.pref,
			[profile]: filteredProps,
			analytics,
		};

		if (isDashboard && (forceUpdate || !this.isUnsaved)) {
			setPreferences(appName, credentials, this.pref)
				.then(() => {
					// clear saved profile after save
					clearProfile();
				})
				.catch(() => this.setLocalPref(this.pref));
		} else {
			this.setLocalPref(this.pref);
		}

		this.setLocalPref(this.pref);
	};

	deleteProfile = (profile) => {
		const { profileList } = this.state;
		const filteredProfile = profileList.filter(item => item !== profile);
		const componentProps = this.pref[filteredProfile[0]];
		try {
			delete this.pref[profile];
			this.setState(
				{
					profile: filteredProfile[0],
					profileList: filteredProfile,
					filterCount: Object.keys(componentProps).filter(
						item => item !== 'search' && item !== 'result',
					).length,
					componentProps,
				},
				this.savePreferences,
			);
			message.success(`Successfully deleted ${profile}`);
		} catch (e) {
			message.error('Something went wrong while deleting profile. Please try again.');
		}
	};

	deleteComponent = (id) => {
		const { componentProps } = this.state;
		const { [id]: del, ...remProps } = componentProps;
		this.setState(
			{
				componentProps: remProps,
			},
			this.savePreferences,
		);
		message.error('Filter Deleted');
	};

	setProfile = (profile) => {
		const { clearProfile } = this.props;
		// clear the saved profile when profile changes
		clearProfile();
		const componentProps = this.pref[profile] || {};
		this.setState({
			profile,
			componentProps,
			filterCount: Object.keys(componentProps).filter(
				item => item !== 'search' && item !== 'result',
			).length,
		});
	};

	onNewProfile = (profile, createEmpty) => {
		const { profileList } = this.state;

		if (createEmpty) {
			const { clearProfile } = this.props;
			// clear when new profile being created
			clearProfile();
			this.setState(
				{
					profile,
					profileList: [...profileList, profile],
					filterCount: 0,
					componentProps: {},
				},
				this.savePreferences,
			);
		} else {
			const { componentProps } = this.state;
			this.setState(
				{
					profile,
					profileList: [...profileList, profile],
					filterCount: Object.keys(componentProps).filter(
						item => item !== 'search' && item !== 'result',
					).length,
					componentProps,
				},
				() => this.savePreferences(true),
			);
		}
	};

	handleComponentPropChange = (component, newProps) => {
		// strip out onData prop from result component
		const { onData, ...validProps } = newProps;
		this.setState(
			state => ({
				...state,
				componentProps: {
					...state.componentProps,
					[component]: {
						...state.componentProps[component],
						...validProps,
					},
				},
			}),
			this.savePreferences,
		);
	};

	openSandbox = () => {
		const {
			appId, appName, url, credentials, attribution, customProps,
		} = this.props; // prettier-ignore
		// prettier-ignore
		const {
			componentProps,
			mappings,
			version,
			analytics,
		} = this.state;
		const config = {
			appId: appId || null,
			appName: appName || null,
			url,
			credentials: credentials || null,
			componentProps,
			mappings,
			attribution: attribution || null,
			customProps,
			analytics,
		};
		const code = getSearchTemplate(config, version);
		const html = '<div id="root"></div>';
		const styles = getTemplateStyles();

		const parameters = getParameters({
			files: {
				'index.js': {
					content: code,
				},
				'package.json': {
					content: {
						dependencies: {
							react: '16.3.2',
							'react-dom': '16.3.2',
							antd: '^3.6.6',
							'@appbaseio/reactivesearch': '3.0.0-rc.12',
							'react-expand-collapse': 'latest',
						},
					},
				},
				'index.html': {
					content: html,
				},
				'styles.css': {
					content: styles,
				},
			},
		});

		window.open(
			`https://codesandbox.io/api/v1/sandboxes/define?parameters=${parameters}`,
			'_blank',
		);
	};

	render() {
		const vcenter = {
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			justifyContent: 'center',
			padding: 20,
			height: 300,
			fontSize: 16,
			lineHeight: 26,
		};

		const { mappings, profileList, loading } = this.state;
		if (!mappings) {
			return <div style={vcenter}>Loading...</div>;
		}
		if (loading) {
			return <div style={vcenter}>Fetching search preferences...</div>;
		}
		if (!Object.keys(mappings).length) {
			return <div style={vcenter}>No data found. Please insert data to use this feature</div>;
		}

		const {
			appId,
			appName,
			credentials,
			url,
			customProps,
			isDashboard,
			showCodeSandbox,
			showCodePreview,
			showCustomList,
			useCategorySearch,
			customJoyrideSteps,
		} = this.props;
		const {
			mappingsType, componentProps, filterCount, profile, version, analytics,
		} = this.state; // prettier-ignore
		const contextValue = {
			appId: appId || null,
			appName: appName || null,
			url,
			credentials: credentials || null,
			profile,
			config: this.getActiveConfig(),
			mappings,
			customProps,
			mappingsType,
			useCategorySearch,
			componentProps,
			onPropChange: this.handleComponentPropChange,
			filterCount,
			showCodeSandbox,
			setFilterCount: this.setFilterCount,
			deleteComponent: this.deleteComponent,
			showCodePreview,
			showCustomList,
			version,
			analytics,
		};

		return (
			<SandboxContext.Provider value={contextValue}>
				<div className={wrapper} key={profile}>
					<Header
						isUnsaved={this.isUnsaved}
						isDashboard={isDashboard}
						showCodeSandbox={showCodeSandbox}
						showProfileOption
						profileList={profileList}
						defaultProfile={profile}
						setProfile={this.setProfile}
						onNewProfile={this.onNewProfile}
						deleteProfile={this.deleteProfile}
						openSandbox={this.openSandbox}
						analytics={analytics}
						toggleAnalytics={this.toggleAnalytics}
					/>
					<Walkthrough
						id="SearchPreview"
						joyrideSteps={customJoyrideSteps || joyrideSteps}
					/>
					{React.Children.map(this.props.children, child => (
						<SandboxContext.Consumer>
							{props => React.cloneElement(child, { ...props })}
						</SandboxContext.Consumer>
					))}
				</div>
			</SandboxContext.Provider>
		);
	}
}

SearchSandbox.propTypes = {
	appId: PropTypes.string,
	appName: PropTypes.string.isRequired,
	attribution: PropTypes.object,
	credentials: PropTypes.string.isRequired,
	isDashboard: PropTypes.bool,
	showCodeSandbox: PropTypes.bool,
	url: PropTypes.string,
	useCategorySearch: PropTypes.bool,
	getAppMappings: PropTypes.func.isRequired,
	clearProfile: PropTypes.func.isRequired,
	searchState: PropTypes.object,
	customJoyrideSteps: PropTypes.array,
	customProps: PropTypes.object,
	showCodePreview: PropTypes.bool,
	showCustomList: PropTypes.bool,
};

SearchSandbox.defaultProps = {
	appId: null,
	attribution: null,
	showCodeSandbox: true,
	showCodePreview: true,
	showCustomList: true,
	isDashboard: false,
	url: getURL(),
	searchState: undefined,
	useCategorySearch: false,
	customJoyrideSteps: undefined,
	customProps: {},
};

const mapStateToProps = state => ({
	appId: get(state, '$getCurrentApp.id'),
	appName: get(state, '$getCurrentApp.name'),
	mappings: getRawMappingsByAppName(state) || null,
	isFetchingMapping: get(state, '$getAppMappings.isFetching'),
	searchState: get(state, '$getSearchState.parsedSearchState'),
});

const mapDispatchToProps = dispatch => ({
	getAppMappings: (appName, credentials, url) => {
		dispatch(getMappings(appName, credentials, url));
	},
	clearProfile: () => dispatch(clearSearchState()),
});

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(SearchSandbox);
