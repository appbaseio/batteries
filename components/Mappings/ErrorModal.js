import React from 'react';
import Modal from '../shared/Modal';
import { Button, ErrorLogger } from './styles';

const ErrorModal = props => (
	<Modal show={props.show} onClose={props.onClose}>
		<h3>
			{props.errorLength
				? `${props.errorLength} records failed to index`
				: 'An error occured'}
		</h3>

		{props.message ? (
			<p>{props.message}</p>
		) : (
			<p>
				To prevent data loss, we have restored your original mappings. You can fix{' '}
				{props.errorLength ? 'these' : 'this'} and retry.
			</p>
		)}

		{props.error ? <ErrorLogger>{props.error}</ErrorLogger> : null}

		<div style={{ display: 'flex', flexDirection: 'row-reverse', margin: '10px 0' }}>
			<Button ghost onClick={props.onClose}>
				Close
			</Button>
		</div>
	</Modal>
);

ErrorModal.displayName = 'ErrorModal';

export default ErrorModal;
