import React, { Component } from 'react';
import {
 Menu, Button, Dropdown, Icon, Modal, Input, message,
} from 'antd';
import {
 bool, arrayOf, string, func,
} from 'prop-types';

const CREATE_NEW_PROFILE = 'SEARCH_SANDBOX_CREATE_NEW_PROFILE_APPBASE';
const SAVE_AS_NEW_PROFILE = 'SEARCH_SANDBOX_SAVE_AS_NEW_PROFILE_APPBASE';

export default class Header extends Component {
	constructor(props) {
		super(props);

		this.profileInput = React.createRef();
		this.state = {
			profile: '',
			saveStatus: CREATE_NEW_PROFILE,
			showNewProfileModal: false,
			modalError: '',
		};
	}

	static getDerivedStateFromProps(props, state) {
		const { defaultProfile } = props;
		if (defaultProfile && !state.profile) {
			return {
				profile: defaultProfile,
			};
		}

		return null;
	}

	handleProfileChange = (e) => {
		const { key } = e;
		const { setProfile } = this.props;

		if (key === CREATE_NEW_PROFILE) {
			this.setState({
				showNewProfileModal: true,
				saveStatus: CREATE_NEW_PROFILE,
			});
		} else if (key === SAVE_AS_NEW_PROFILE) {
			this.setState({
				showNewProfileModal: true,
				saveStatus: SAVE_AS_NEW_PROFILE,
			});
		} else {
			this.setState(
				{
					profile: key,
				},
				() => {
					setProfile(key);
				},
			);
			message.success(`Profile switched to ${key}`);
		}
	};

	handleDeleteProfileModal = () => {
		const { profile } = this.state;
		const { deleteProfile } = this.props;
		Modal.confirm({
			title: 'Delete Profile',
			content: (
				<React.Fragment>
					Are you sure you want to delete <strong>{profile}</strong> profile?
				</React.Fragment>
			),
			okText: 'Delete',
			cancelText: 'Cancel',
			okType: 'danger',
			icon: <Icon type="delete" />,
			onOk: () => deleteProfile(profile),
		});
	};

	handleSaveProfile = () => {
		const { value } = this.profileInput.current.input;
		const { profileList, onNewProfile } = this.props;
		const { saveStatus } = this.state;

		if (profileList.includes(value)) {
			this.setState({
				modalError: 'A search profile with the same name already exists',
			});
		} else {
			this.setState(
				{
					profile: value,
					showNewProfileModal: false,
					modalError: '',
				},
				() => {
					onNewProfile(value, saveStatus === CREATE_NEW_PROFILE);
				},
			);
			message.success(`New Profile ${value} created`);
		}
	};

	handleCancel = () => {
		this.setState({
			showNewProfileModal: false,
			modalError: '',
		});
	};

	render() {
		const {
			// prettier-ignore
			isDashboard,
			showCodeSandbox,
			showProfileOption,
			profileList,
			openSandbox,
		} = this.props;

		const { profile, showNewProfileModal, modalError } = this.state;

		const menu = (
			<Menu
				onClick={this.handleProfileChange}
				style={{ maxHeight: 300, overflowY: 'scroll' }}
			>
				{profileList.map(item => (
					<Menu.Item key={item}>{item}</Menu.Item>
				))}
				<Menu.Divider />
				<Menu.Item key={CREATE_NEW_PROFILE}>
					<Icon type="plus" />
					&nbsp; Create a New Profile
				</Menu.Item>
				<Menu.Item key={SAVE_AS_NEW_PROFILE}>
					<Icon type="save" />
					&nbsp; Save as New Profile
				</Menu.Item>
			</Menu>
		);

		let showHeader = true;

		if (!showCodeSandbox && !showProfileOption) {
			showHeader = false;
		}

		return showHeader ? (
			<div
				style={{
					display: 'flex',
					flexDirection: 'row-reverse',
					padding: '10px 20px 0',
				}}
			>
				{profile !== 'default' ? (
					<Button
						type="danger"
						size="large"
						style={{ marginLeft: 8 }}
						onClick={this.handleDeleteProfileModal}
					>
						Delete Profile
						<Icon type="delete" />
					</Button>
				) : null}
				{isDashboard && showProfileOption ? (
					<Dropdown overlay={menu} trigger={['click']}>
						<Button size="large" style={{ marginLeft: 8 }}>
							{`Search Profile - ${profile}`} <Icon type="down" />
						</Button>
					</Dropdown>
				) : null}
				{showCodeSandbox ? (
					<Button onClick={openSandbox} size="large" type="primary">
						Open in Codesandbox
					</Button>
				) : null}

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
					{modalError ? <p style={{ color: 'tomato' }}>{modalError}</p> : null}
				</Modal>
			</div>
		) : null;
	}
}

Header.propTypes = {
	isDashboard: bool.isRequired,
	showCodeSandbox: bool.isRequired,
	showProfileOption: bool.isRequired,
	profileList: arrayOf(string).isRequired,
	defaultProfile: string.isRequired, // eslint-disable-line
	setProfile: func.isRequired,
	openSandbox: func.isRequired,
};
