import React from 'react';
import { DeleteOutlined } from '@ant-design/icons';
import { Popconfirm, Button, notification } from 'antd';

class DeleteJSON extends React.Component {
	handleDeleteJSON = (id) => {
		let responseMessage = {
			message: 'Delete JSON',
			description: 'You have successfully deleted JSON.',
			duration: 4,
		};
		const { mappingsType, appbaseRef, setRenderKey } = this.props;
		appbaseRef
			.delete({
				type: mappingsType,
				id,
			})
			.then((res) => {
				setRenderKey(res._timestamp);
				notification.open(responseMessage);
			})
			.catch(() => {
				responseMessage = {
					message: 'Delete JSON',
					description: 'There were error in Deleting JSON. Try again Later.',
					duration: 2,
				};
				notification.open(responseMessage);
			});
	};

	render() {
		const { res } = this.props;
		return (
            <Popconfirm
				title="Are you sure you want to delete this JSON?"
				placement="bottomRight"
				onConfirm={() => this.handleDeleteJSON(res._id)}
				okText="Yes"
			>
				<Button shape="circle" icon={<DeleteOutlined />} style={{ marginRight: '5px' }} />
			</Popconfirm>
        );
	}
}

export default DeleteJSON;
