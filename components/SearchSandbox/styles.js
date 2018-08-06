import { css } from 'react-emotion';

const listItem = css`
	padding: 20px 0;
	font-size: 16px;
	line-height: 30px;
	border-bottom: 1px solid #eee;

	& > div {
		margin-bottom: 4px;
	}

	&:last-child {
		border: 0;
	}
`;

const title = css`
	font-weight: bold;
	color: #424242;
	margin-right: 12px;
`;

const formWrapper = css`
	.ant-form-item-label {
		line-height: 16px;
	}
`;

const deleteStyles = css`
	margin: 0 10px;
	opacity: 0;
`;

const rowStyles = css`
	&:hover .${deleteStyles} {
		opacity: 1;
	}
`;

const componentStyles = css`
	label {
		font-weight: normal;
	}
`;

export {
	listItem,
	title,
	formWrapper,
	rowStyles,
	deleteStyles,
	componentStyles,
};
