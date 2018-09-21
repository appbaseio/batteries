import styled from 'react-emotion';

const green = '#b6ef7e';
const greenHover = '#c3f295';
const grey = '#efefef';
const greyHover = '#fafafa';
const danger = '#FF696C';
const dangerText = '#5C0507';

const getBgColor = (props) => {
	if (props.danger) {
		return danger;
	}
	if (props.ghost) {
		return grey;
	}
	return green;
};
const getBgHoverColor = (props) => {
	if (props.danger) {
		return danger;
	}
	if (props.ghost) {
		return greyHover;
	}
	return greenHover;
};
export default styled('a')`
	display: inline-flex;
	height: 42px;
	padding: 0 20px;
	justify-content: center;
	align-items: center;
	color: ${props => (props.danger ? dangerText : '#53683b')};
	font-weight: 600;
	background-color: ${getBgColor};
	text-transform: uppercase;
	box-shadow: 0 3px 3px 0 rgba(0, 0, 0, 0.1);
	cursor: pointer;
	margin-left: 12px;

	&:hover,
	&:focus {
		background-color: ${getBgHoverColor};
		box-shadow: 0 5px 5px 0 rgba(0, 0, 0, 0.1);
		text-decoration: none;
		color: ${props => (props.danger ? '#8c0101' : undefined)};
	}
`;
