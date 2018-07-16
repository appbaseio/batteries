import React, { Component } from 'react';
import { Menu, Button, Dropdown, Icon } from 'antd';
import { Link } from 'react-router';
import { css } from 'emotion';
// import { getPrefrences } from '../../utils';

const nav = css`
	position: fixed;
	top: 100px;
	width: calc(100% - 120px);
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
			currentRoute: 'editor',
		};
	}

	componentDidMount() {
		if (this.props.isDashboard) {
			// getPreferences()
		}
	}

	getActiveConfig = () => this.state.configs.find(config => config.profile === this.state.profile)

	setConfig = (config) => {
		console.log(config);
	}

	handleClick = (e) => {
		const currentRoute = navLinks.find(item => item.link === e.key);

		if (currentRoute) {
			this.setState({
				currentRoute: currentRoute.link,
			});
		}
	}

	handleProfileChange = (e) => {
		this.setState({
			profile: e.key,
		});
	}

	render() {
		const menu = (
			<Menu onClick={this.handleProfileChange}>
				<Menu.Item key="default">default</Menu.Item>
				<Menu.Item key="Alpha">Alpha</Menu.Item>
				<Menu.Item key="Beta">Beta</Menu.Item>
				<Menu.Item key="Gamma">Gamma</Menu.Item>
			</Menu>
		);

		const contextValue = {
			profile: this.state.profile,
			config: this.getActiveConfig(),
			setConfig: this.setConfig,
		};

		return (
			<SandboxContext.Provider value={contextValue}>
				<Menu
					onClick={this.handleClick}
					selectedKeys={[this.state.currentRoute]}
					mode="horizontal"
					className={`search-sandbox-navbar ${nav}`}
					// search-sandbox-navbar class is added here
					// to support modifications outside dashboard
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
				<div className={wrapper}>
					{this.props.children}
				</div>
			</SandboxContext.Provider>
		);
	}
}

SearchSandbox.defaultProps = {
	isDashboard: true,
};
