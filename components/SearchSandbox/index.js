import React, { Component } from 'react';
import { Menu, Button, Dropdown, Icon, Modal, Input } from 'antd';
import { css } from 'emotion';
import { getMappings, getMappingsTree } from '../../utils/mappings';
import { getPreferences, setPreferences } from '../../utils/sandbox';

const wrapper = css`
	padding: 15px;
`;

const NEW_PROFILE = 'SEARCH_SANDBOX_NEW_PROFILE_APPBASE';

export const SandboxContext = React.createContext();

export default class SearchSandbox extends Component {
	constructor(props) {
		super(props);
		const profile = 'default';
		this.profileInput = React.createRef();

		this.state = {
			profile,
			profileList: ['default'],
			configs: [],
			mappings: null,
			filterCount: 0,
			componentProps: {},
			showNewProfileModal: false,
			profileModalError: '',
		};
	}

	componentDidMount() {
		if (this.props.isDashboard) {
			getPreferences(this.props.appId)
				.then((pref) => {
					this.pref = pref || {};
					const profileList = Array.from(new Set([
						...this.state.profileList,
						...Object.keys(this.pref)]));
					this.setState({
						componentProps: this.pref[this.state.profile] || {},
						profileList,
					});
				})
				.catch(() => this.getLocalPref());
		} else {
			this.getLocalPref();
		}

		getMappings(this.props.appName, this.props.credentials, this.props.url)
			.then((res) => {
				this.setState({
					mappings: getMappingsTree(res),
				});
			});
	}

	getLocalPref = () => {
		let pref = localStorage.getItem(this.props.appName);
		if (pref) pref = JSON.parse(pref);
		this.pref = pref;
	};

	setLocalPref = (pref = {}) => {
		const value = JSON.stringify(pref);
		localStorage.setItem(this.props.appName, value);
	};

	getActiveConfig = () => this.state.configs.find(config => config.profile === this.state.profile);

	setFilterCount = (filterCount) => {
		this.setState({
			filterCount,
		});
	};

	savePreferences = () => {
		this.pref = {
			...this.pref,
			[this.state.profile]: this.state.componentProps,
		};

		if (this.props.isDashboard) {
			setPreferences(this.props.appId, this.pref)
				.catch(() => this.setLocalPref(this.pref));
		} else {
			this.setLocalPref(this.pref);
		}
	}

	deleteComponent = (id) => {
		const { componentProps } = this.state;
		const { [id]: del, ...remProps } = componentProps;
		this.setState({
			componentProps: remProps,
		}, this.savePreferences);
	}

	handleProfileChange = (e) => {
		const { key } = e;
		if (key === NEW_PROFILE) {
			this.setState({
				showNewProfileModal: true,
			});
		} else {
			this.setState({
				profile: key,
				componentProps: this.pref[key] || {},
			});
		}
	};

	handleComponentPropChange = (component, newProps) => {
		this.setState({
			componentProps: {
				...this.state.componentProps,
				[component]: {
					...this.state.componentProps[component],
					...newProps,
				},
			},
		}, this.savePreferences);
	};

	handleSaveProfile = () => {
		const { value } = this.profileInput.current.input;
		if (this.state.profileList.includes(value)) {
			this.setState({
				profileModalError: 'A search profile with the same name already exists',
			});
		} else {
			this.setState({
				profileList: [...this.state.profileList, value],
				profile: value,
				componentProps: {},
				showNewProfileModal: false,
				profileModalError: '',
			});
		}
	};

	handleCancel = () => {
		this.setState({
			showNewProfileModal: false,
			profileModalError: '',
		});
	};

	render() {
		if (!this.state.mappings) return 'Loading...';

		const menu = (
			<Menu onClick={this.handleProfileChange}>
				{
					this.state.profileList.map(item => (
						<Menu.Item key={item}>{item}</Menu.Item>
					))
				}
				<Menu.Item key={NEW_PROFILE}>Create a New Profile</Menu.Item>
			</Menu>
		);

		const contextValue = {
			appId: this.props.appId || null,
			appName: this.props.appName || null,
			credentials: this.props.credentials || null,
			profile: this.state.profile,
			config: this.getActiveConfig(),
			mappings: this.state.mappings,
			componentProps: this.state.componentProps,
			onPropChange: this.handleComponentPropChange,
			filterCount: this.state.filterCount,
			setFilterCount: this.setFilterCount,
			deleteComponent: this.deleteComponent,
		};

		return (
			<SandboxContext.Provider value={contextValue}>
				<div className={wrapper} key={this.state.profile}>
					<div style={{ display: 'flex', flexDirection: 'row-reverse', padding: '10px 20px 0' }}>
						<Dropdown overlay={menu}>
							<Button size="large" style={{ marginLeft: 8 }}>
								Search Profile - {this.state.profile} <Icon type="down" />
							</Button>
						</Dropdown>
					</div>
					{
						React.Children.map(this.props.children, child => (
							<SandboxContext.Consumer>
								{props => React.cloneElement(child, { ...props })}
							</SandboxContext.Consumer>
						))
					}
				</div>

				<Modal
					title="Create a new Search Profile"
					visible={this.state.showNewProfileModal}
					onOk={this.handleSaveProfile}
					onCancel={this.handleCancel}
				>
					<div
						style={{ margin: '0 0 6px' }}
						className="ant-form-extra"
					>
						Set search profile name
					</div>
					<Input
						type="text"
						ref={this.profileInput}
						placeholder="Search Profile Name"
					/>
					{
						this.state.profileModalError
							? (<p style={{ color: 'tomato' }}>{this.state.profileModalError}</p>)
							: null
					}
				</Modal>
			</SandboxContext.Provider>
		);
	}
}

SearchSandbox.defaultProps = {
	isDashboard: false,
};
