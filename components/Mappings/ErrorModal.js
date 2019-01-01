import React from 'react';

import { Modal } from 'antd';
import { ErrorLogger } from './styles';

const ErrorModal = props => (
	<Modal
		visible={props.show}
		onCancel={props.onClose}
		onOk={props.onClose}
		title={
			props.errorLength ? `${props.errorLength} records failed to index` : 'An error occured'
		}
	>
		{props.message ? (
			<p>{props.message}</p>
		) : (
			<p>
				To prevent data loss, we have restored your original mappings. You can fix{' '}
				{props.errorLength ? 'these' : 'this'} and retry.
			</p>
		)}

		{props.error ? <ErrorLogger>{props.error}</ErrorLogger> : null}
	</Modal>
);

ErrorModal.displayName = 'ErrorModal';

export default ErrorModal;
