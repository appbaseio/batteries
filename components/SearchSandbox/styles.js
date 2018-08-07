import { css } from 'react-emotion';

const listItem = css`
	padding: 20px 0;
	font-size: 16px;
	line-height: 30px;
	border-bottom: 1px solid #eee;

	li {
		word-wrap: break-word;
		width: 100%;
		overflow: hidden;
	}

	& > div {
		margin-bottom: 4px;
	}

	&:last-child {
		border: 0;
	}

	.react-expand-collapse__content {
		position: relative;
		overflow: hidden;
	}

	.react-expand-collapse__body {
		display: inline;
	}

	/* expand-collapse button */
	.react-expand-collapse__button {
		color: #22a7f0;
		position: absolute;
		bottom: 0;
		right: 0;
		background-color: #fff;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
	}

	.react-expand-collapse__button:before {
		content: '';
		position: absolute;
		top: 0;
		left: -20px;
		width: 20px;
		height: 100%;
		background: linear-gradient(to right, transparent 0, #fff 100%);
	}

	/* expanded state */
	.react-expand-collapse--expanded .react-expand-collapse__button {
		padding-left: 5px;
		position: relative;
		bottom: auto;
		right: auto;
	}

	.react-expand-collapse--expanded .react-expand-collapse__button:before {
		content: none;
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

export { listItem, title, formWrapper, rowStyles, deleteStyles, componentStyles };
