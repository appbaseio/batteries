import React, { Component } from 'react';
import { DeleteOutlined, DownOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { Menu, Button, Dropdown, Modal, Input, message, Switch, Tooltip } from 'antd';
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
			icon: <DeleteOutlined />,
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
			isUnsaved,
			analytics,
			toggleAnalytics,
		} = this.props;

		const { profile, showNewProfileModal, modalError } = this.state;

		const menu = (
			<Menu
				onClick={this.handleProfileChange}
				style={{ maxHeight: 300, overflowY: 'scroll' }}
			>
				<Menu.Item key={SAVE_AS_NEW_PROFILE}>
					<SaveOutlined />
					&nbsp; Save as ...
				</Menu.Item>
				<Menu.Item key={CREATE_NEW_PROFILE}>
					<PlusOutlined />
					&nbsp; Create a New Profile
				</Menu.Item>
				<Menu.Divider />
				{profileList.map(item => (
					<Menu.Item key={item}>{item}</Menu.Item>
				))}
			</Menu>
		);

		let showHeader = true;

		if (!showCodeSandbox && !showProfileOption) {
			showHeader = false;
		}

		return showHeader ? (
			<div
				style={{ display: 'flex', padding: '10px 20px 0', justifyContent: 'space-between' }}
			>
				<div style={{ marginTop: 8, marginRight: 8 }}>
					<Tooltip
						placement="right"
						title="Switch for whether to record analytics based on the search and click requests made from the Search Preview view. It's enabled by default."
					>
						<Switch checked={analytics} onChange={toggleAnalytics} /> Record Analytics
					</Tooltip>
				</div>
				<div
					style={{
						display: 'flex',
						flexDirection: 'row-reverse',
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
							<DeleteOutlined />
						</Button>
					) : null}
					{isDashboard && showProfileOption ? (
						<Dropdown overlay={menu} trigger={['click']}>
							<Button size="large" style={{ marginLeft: 8 }}>
								{`Search Profile - ${isUnsaved ? 'unsaved' : profile}`}{' '}
								<DownOutlined />
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
						<Input
							type="text"
							ref={this.profileInput}
							placeholder="Search Profile Name"
						/>
						{modalError ? <p style={{ color: 'tomato' }}>{modalError}</p> : null}
					</Modal>
				</div>
			</div>
		) : null;
	}
}

Header.propTypes = {
	isUnsaved: bool.isRequired,
	isDashboard: bool.isRequired,
	showCodeSandbox: bool.isRequired,
	showProfileOption: bool.isRequired,
	profileList: arrayOf(string).isRequired,
	defaultProfile: string.isRequired, // eslint-disable-line
	setProfile: func.isRequired,
	openSandbox: func.isRequired,
	analytics: bool.isRequired,
	toggleAnalytics: func.isRequired,
};
