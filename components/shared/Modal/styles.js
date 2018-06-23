import styled from 'react-emotion';

export const Wrapper = styled('div')`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	z-index: 999;
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;

	.modal-wrapper {
		width: 100%;
		max-width: 800px;
		height: auto;
		background-color: #fff;
		border-radius: 3px;
		padding: 25px 30px;
		position: relative;
		z-index: 1;

		h3 {
			font-size: 20px;
			font-weight: 600;
			margin: 12px 0 20px;
		}
	}
`;

export const Overlay = styled('div')`
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(0,0,0,0.7);
`;
