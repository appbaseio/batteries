import React from 'react';
import styled from 'react-emotion';

const LoadingOverlay = styled('div')`
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(0, 0, 0, 0.7);
	z-index: 999;
	color: #fff;
	display: flex;
	padding: 20px;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	font-size: 16px;
	letter-spacing: 0.04rem;
	font-weight: 300;
`;

const Loader = (props) => {
	if (props.show) {
		return (
			<LoadingOverlay>
				<p>{props.message || 'Loading...'}</p>
			</LoadingOverlay>
		);
	}
	return null;
};

export default Loader;
