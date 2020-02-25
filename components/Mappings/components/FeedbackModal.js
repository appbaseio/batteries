import React from 'react';
import { Modal } from 'antd';

const FeedbackModal = ({ show, onClose, timeTaken }) => (
	<Modal
		visible={show}
		title="Re-index successful"
		onOk={onClose}
		closable={false}
		onCancel={onClose}
		okText="Done"
	>
		<p>The mappings have been updated and the data has been successfully re-indexed.</p>
	</Modal>
);

export default FeedbackModal;
