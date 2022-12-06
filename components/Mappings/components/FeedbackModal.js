import React from 'react';
import { Modal } from 'antd';

const FeedbackModal = ({ show, onClose, timeTaken }) => (
	<Modal
		open={show}
		title="Re-index in progress"
		onOk={onClose}
		closable={false}
		onCancel={onClose}
		okText="Done"
	>
		<p>Reindexing is still in progress.</p>
	</Modal>
);

export default FeedbackModal;
