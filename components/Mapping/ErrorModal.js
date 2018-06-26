import React from 'react';
import Modal from '../shared/Modal';
import { Button } from './styles';

const ErrorModal = props => (
	<Modal show={props.show} onClose={props.onClose}>
		<h3>Some error occured</h3>

		<p>{props.error}</p>

		<div style={{ display: 'flex', flexDirection: 'row-reverse', margin: '10px 0' }}>
			<Button ghost onClick={props.onClose}>
				Close
			</Button>
		</div>
	</Modal>
);

ErrorModal.displayName = 'ErrorModal';

export default ErrorModal;
