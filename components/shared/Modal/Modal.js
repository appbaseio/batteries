import React from 'react';
import { Wrapper, Overlay } from './styles';

export default (props) => {
	if (props.show) {
		return (
			<Wrapper>
				<Overlay onClick={props.onClose} />
				<div className="modal-wrapper">
					{props.children}
				</div>
			</Wrapper>
		);
	}
	return null;
};
