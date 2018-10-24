import React, { Component } from 'react';
import {
 Menu, Button, Dropdown, Icon, Modal, Input,
} from 'antd';
import { css } from 'emotion';
import { getParameters } from 'codesandbox/lib/api/define';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { connect } from 'react-redux';

import { getMappingsTree } from '../../utils/mappings';
import { getPreferences, setPreferences } from '../../utils/sandbox';
import { SCALR_API } from '../../utils';
import getSearchTemplate, { getTemplateStyles } from './template';
import { getAppMappings as getMappings } from '../../modules/actions';
import { getRawMappingsByAppName } from '../../modules/selectors';

const wrapper = css`
	padding: 15px;
`;

const NEW_PROFILE = 'SEARCH_SANDBOX_NEW_PROFILE_APPBASE';
const SAVE_AS_NEW_PROFILE = 'SEARCH_SANDBOX_SAVE_NEW_PROFILE_APPBASE';

export const SandboxContext = React.createContext();

class SearchSandbox extends Component {
	constructor(props) {
		super(props);
		const profile = 'default';
		this.profileInput = React.createRef();

		this.state = {
			profile,
			profileList: ['default'],
			configs: [],
			mappings: null,
			filterCount: 0, // Tracks the id of MultiList
			componentProps: {},
			showNewProfileModal: false,
			profileModalError: '',
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

		const { mappings, isFetchingMapping } = this.props;
		if (mappings) {
			const mappingsType = Object.keys(mappings).length > 0 ? Object.keys(mappings)[0] : '';
			this.setState({
				mappings: getMappingsTree(mappings),
				mappingsType,
			});
		} else if (!isFetchingMapping) {
			const { credentials, getAppMappings } = this.props;
			getAppMappings(appName, credentials);
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
	};

	handleProfileChange = (e) => {
		const { key } = e;
		if (key === NEW_PROFILE) {
			this.setState({
				showNewProfileModal: true,
				filterCount: 0,
			});
		} else if (key === SAVE_AS_NEW_PROFILE) {
			const { profile } = this.state;
			this.newComponentProps = this.pref[profile];
			this.setState({
				showNewProfileModal: true,
				filterCount: Object.keys(this.newComponentProps).filter(
					item => item !== 'search' && item !== 'result',
				).length,
			});
		} else {
			const componentProps = this.pref[key] || {};
			this.setState({
				profile: key,
				componentProps,
				filterCount: Object.keys(componentProps).filter(
					item => item !== 'search' && item !== 'result',
				).length,
			});
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

	handleSaveProfile = () => {
		const { value } = this.profileInput.current.input;
		const componentProps = this.newComponentProps || {};
		const { profileList } = this.state;
		if (profileList.includes(value)) {
			this.setState({
				profileModalError: 'A search profile with the same name already exists',
			});
		} else {
			this.setState({
				profileList: [...profileList, value],
				profile: value,
				componentProps,
				showNewProfileModal: false,
				profileModalError: '',
			});
		}
		this.newComponentProps = null;
	};

	handleCancel = () => {
		this.newComponentProps = null;
		this.setState({
			showNewProfileModal: false,
			profileModalError: '',
		});
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
							'@appbaseio/reactivesearch': 'latest',
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

		const menu = (
			<Menu
				onClick={this.handleProfileChange}
				style={{ maxHeight: 300, overflowY: 'scroll' }}
			>
				{profileList.map(item => (
					<Menu.Item key={item}>{item}</Menu.Item>
				))}
				<Menu.Divider />
				<Menu.Item key={NEW_PROFILE}>
					<Icon type="plus" />
					&nbsp; Create a New Profile
				</Menu.Item>
				<Menu.Item key={SAVE_AS_NEW_PROFILE}>
					<Icon type="save" />
					&nbsp; Save as New Profile
				</Menu.Item>
			</Menu>
		);

		const {
			appId,
			appName,
			credentials,
			url,
			customProps,
			isDashboard,
			showCodeSandbox,
			useCategorySearch,
		} = this.props;
		const {
			mappingsType,
			componentProps,
			filterCount,
			profile,
			showNewProfileModal,
			profileModalError,
		} = this.state;
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
		};

		return (
			<SandboxContext.Provider value={contextValue}>
				<div className={wrapper} key={profile}>
					<div
						style={{
							display: 'flex',
							flexDirection: 'row-reverse',
							padding: '10px 20px 0',
						}}
					>
						{isDashboard ? (
							<Dropdown overlay={menu} trigger={['click']}>
								<Button size="large" style={{ marginLeft: 8 }}>
									Search Profile - {profile} <Icon type="down" />
								</Button>
							</Dropdown>
						) : null}
						{
							showCodeSandbox ? (
								<Button onClick={this.openSandbox} size="large" type="primary">
									Open in Codesandbox
								</Button>
							) : null
						}
					</div>
					{React.Children.map(this.props.children, child => (
						<SandboxContext.Consumer>
							{props => React.cloneElement(child, { ...props })}
						</SandboxContext.Consumer>
					))}
				</div>

				<Modal
					title="Create a new Search Profile"
					visible={showNewProfileModal}
					onOk={this.handleSaveProfile}
					onCancel={this.handleCancel}
					destroyOnClose
				>
					<div style={{ margin: '0 0 6px' }} className="ant-form-extra">
						Set search profile name
					</div>
					<Input type="text" ref={this.profileInput} placeholder="Search Profile Name" />
					{profileModalError ? (
						<p style={{ color: 'tomato' }}>{profileModalError}</p>
					) : null}
				</Modal>
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
	customProps: PropTypes.object,
};

SearchSandbox.defaultProps = {
	appId: null,
	attribution: null,
	showCodeSandbox:true,
	isDashboard: false,
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
