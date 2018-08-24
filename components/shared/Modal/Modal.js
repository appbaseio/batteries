import React from 'react';
import { Wrapper, Overlay } from './styles';

const Modal = (props) => {
	if (props.show) {
		return (
			<Wrapper>
				<Overlay onClick={props.onClose} />
				<div className="modal-wrapper">{props.children}</div>
			</Wrapper>
		);
	}
	return null;
};

export default Modal;
