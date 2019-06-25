import React, { Component } from 'react';
import { css } from 'emotion';
import { message } from 'antd';
import { getParameters } from 'codesandbox/lib/api/define';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { connect } from 'react-redux';

import Header from './components/Header';
import Walkthrough from '../shared/Walkthrough';
import { getMappingsTree } from '../../utils/mappings';
import { getPreferences, setPreferences } from '../../utils/sandbox';
import { SCALR_API } from '../../utils';
import getSearchTemplate, { getTemplateStyles } from './template';
import { getAppMappings as getMappings } from '../../modules/actions';
import { getRawMappingsByAppName } from '../../modules/selectors';
import joyrideSteps from './utils/joyrideSteps';

const wrapper = css`
	padding: 15px;
`;

export const SandboxContext = React.createContext();

class SearchSandbox extends Component {
	constructor(props) {
		super(props);

		const profile = 'default';
		this.state = {
			profile,
			profileList: ['default'],
			configs: [],
			mappings: null,
			filterCount: 0, // Tracks the id of MultiList
			componentProps: {},
			loading: true,
		};
	}

	static getDerivedStateFromProps(props, state) {
		const { mappings } = props;
		if (!state.mappings && mappings) {
			const mappingsType = Object.keys(mappings).length > 0 ? Object.keys(mappings)[0] : '';
			return {
				mappings: getMappingsTree(mappings),
				mappingsType,
			};
		}

		return null;
	}

	componentDidMount() {
		const { appName, isDashboard } = this.props;
		const { profileList: profileListState, profile } = this.state;
		if (isDashboard) {
			getPreferences(appName)
				.then((pref) => {
					this.pref = pref || {};
					const profileList = Array.from(
						new Set([...profileListState, ...Object.keys(this.pref)]),
					);
					const componentProps = this.pref[profile] || {};
					this.setState({
						componentProps,
						profileList,
						loading: false,
						filterCount: Object.keys(componentProps).filter(
							item => item !== 'search' && item !== 'result',
						).length,
					});
				})
				.catch(() => this.getLocalPref());
		} else {
			this.getLocalPref();
		}

		const { mappings, isFetchingMapping, url } = this.props;
		if (mappings) {
			const mappingsType = Object.keys(mappings).length > 0 ? Object.keys(mappings)[0] : '';
			this.setState({
				mappings: getMappingsTree(mappings),
				mappingsType,
			});
		} else if (!isFetchingMapping) {
			const { credentials, getAppMappings } = this.props;
			getAppMappings(appName, credentials, url);
		}
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

	savePreferences = () => {
		const { isDashboard, appName } = this.props;
		const { profile, componentProps } = this.state;
		this.pref = {
			...this.pref,
			[profile]: componentProps,
		};

		if (isDashboard) {
			setPreferences(appName, this.pref).catch(() => this.setLocalPref(this.pref));
		} else {
			this.setLocalPref(this.pref);
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
			const { profile: currentProfile } = this.state;
			const componentProps = this.pref[currentProfile];

			this.setState(
				{
					profile,
					profileList: [...profileList, profile],
					filterCount: Object.keys(componentProps).filter(
						item => item !== 'search' && item !== 'result',
					).length,
					componentProps,
				},
				this.savePreferences,
			);
		}
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
		const { componentProps, mappings } = this.state;
		const config = {
			appId: appId || null,
			appName: appName || null,
			url,
			credentials: credentials || null,
			componentProps,
			mappings,
			attribution: attribution || null,
			customProps,
		};
		const code = getSearchTemplate(config);
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
			showProfileOption,
			useCategorySearch,
			customJoyrideSteps,
			hideWalkthroughButtons,
			showTutorial,
			isShopify
		} = this.props;
		const {
			mappingsType, componentProps, filterCount, profile,
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
			isShopify,
		};

		return (
			<SandboxContext.Provider value={contextValue}>
				<div className={wrapper} key={profile}>
					<Header
						isDashboard={isDashboard}
						showCodeSandbox={showCodeSandbox}
						showProfileOption={showProfileOption}
						profileList={profileList}
						defaultProfile={profile}
						setProfile={this.setProfile}
						deleteProfile={this.deleteProfile}
						onNewProfile={this.onNewProfile}
						openSandbox={this.openSandbox}
					/>
					<Walkthrough
						id="SearchPreview"
						joyrideSteps={customJoyrideSteps || joyrideSteps}
						hideButtons={hideWalkthroughButtons}
						showTutorial={showTutorial}
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
	isFetchingMapping: PropTypes.bool.isRequired,
	customJoyrideSteps: PropTypes.array,
	customProps: PropTypes.object,
	showCodePreview: PropTypes.bool,
	hideWalkthroughButtons: PropTypes.bool,
	showProfileOption: PropTypes.bool,
	showCustomList: PropTypes.bool,
	showTutorial: PropTypes.bool,
	isShopify: PropTypes.bool,
};

SearchSandbox.defaultProps = {
	appId: null,
	attribution: null,
	showCodeSandbox: true,
	showTutorial: false,
	hideWalkthroughButtons: false,
	showCodePreview: true,
	showProfileOption: true,
	showCustomList: true,
	isDashboard: false,
	isShopify: false,
	url: SCALR_API,
	useCategorySearch: false,
	customProps: {},
};

const mapStateToProps = state => ({
	appId: get(state, '$getCurrentApp.id'),
	appName: get(state, '$getCurrentApp.name'),
	mappings: getRawMappingsByAppName(state) || null,
	isFetchingMapping: get(state, '$getAppMappings.isFetching'),
});

const mapDispatchToProps = dispatch => ({
	getAppMappings: (appName, credentials, url) => {
		dispatch(getMappings(appName, credentials, url));
	},
});

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(SearchSandbox);
