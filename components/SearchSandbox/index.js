import React, { Component } from 'react';
import { Menu, Button, Dropdown, Icon } from 'antd';
import { Link } from 'react-router';
import { css } from 'emotion';
import { getMappings, getMappingsTree } from '../../utils/mappings';
import { getPreferences, setPreferences } from '../../utils/sandbox';

const nav = css`
	position: fixed;
	top: 100px;
	width: calc(100% - 120px);
	z-index: 10;
`;

const wrapper = css`
	padding: 60px 15px 15px;
`;

export const SandboxContext = React.createContext();

const navLinks = [
	{
		label: 'Editor',
		link: 'editor',
	},
	{
		label: 'UI Demos',
		link: 'ui-demos',
	},
];

export default class SearchSandbox extends Component {
	constructor(props) {
		super(props);
		const profile = 'default';

		this.state = {
			profile,
			configs: [],
			mappings: null,
			currentRoute: 'editor',
			filterCount: 0,
			componentProps: {},
		};
	}

	componentDidMount() {
		if (this.props.isDashboard) {
			getPreferences(this.props.appId)
				.then((pref) => {
					this.pref = pref || {};
					this.setState({
						componentProps: this.pref[this.state.profile] || {},
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
		});
	}

	handleClick = (e) => {
		const currentRoute = navLinks.find(item => item.link === e.key);

		if (currentRoute) {
			this.setState({
				currentRoute: currentRoute.link,
			});
		}
	};

	handleProfileChange = (e) => {
		this.setState({
			profile: e.key,
			componentProps: this.pref[e.key] || {},
		});
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

	render() {
		if (!this.state.mappings) return 'Loading...';

		const menu = (
			<Menu onClick={this.handleProfileChange}>
				<Menu.Item key="default">default</Menu.Item>
				<Menu.Item key="Alpha">Alpha</Menu.Item>
				<Menu.Item key="Beta">Beta</Menu.Item>
				<Menu.Item key="Gamma">Gamma</Menu.Item>
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
				<Menu
					onClick={this.handleClick}
					selectedKeys={[this.state.currentRoute]}
					mode="horizontal"
					// search-sandbox-navbar class is added here
					// to support styling modifications outside dashboard
					className={`search-sandbox-navbar ${nav}`}
				>
					{
						navLinks.map(item => (
							<Menu.Item key={item.link}>
								<Link
									activeClassName="active"
									to={`/search-sandbox/${this.props.appName}/${item.link}`}
								>
									{item.label}
								</Link>
							</Menu.Item>
						))
					}
					<div style={{ float: 'right', paddingRight: 10 }}>
						<Dropdown overlay={menu}>
							<Button style={{ marginLeft: 8 }}>
								Search Profile - {this.state.profile} <Icon type="down" />
							</Button>
						</Dropdown>
					</div>
				</Menu>
				<div className={wrapper} key={this.state.profile}>
					{
						React.Children.map(this.props.children, child => (
							<SandboxContext.Consumer>
								{props => React.cloneElement(child, { ...props })}
							</SandboxContext.Consumer>
						))
					}
				</div>
			</SandboxContext.Provider>
		);
	}
}

SearchSandbox.defaultProps = {
	isDashboard: false,
};
