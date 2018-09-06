import styled from 'react-emotion';

const green = '#b6ef7e';
const greenHover = '#c3f295';
const grey = '#efefef';
const greyHover = '#fafafa';

export default styled('a')`
	display: inline-flex;
	height: 42px;
	padding: 0 20px;
	justify-content: center;
	align-items: center;
	color: #53683b;
	font-weight: 600;
	background-color: ${props => (props.ghost ? grey : green)};
	text-transform: uppercase;
	box-shadow: 0 3px 3px 0 rgba(0, 0, 0, 0.1);
	cursor: pointer;
	margin-left: 12px;

	&:hover,
	&:focus {
		background-color: ${props => (props.ghost ? greyHover : greenHover)};
		box-shadow: 0 5px 5px 0 rgba(0, 0, 0, 0.1);
		text-decoration: none;
	}
`;
