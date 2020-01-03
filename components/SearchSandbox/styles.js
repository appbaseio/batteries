import { css } from 'react-emotion';

const listItem = css`
	padding: 20px 0;
	font-size: 16px;
	line-height: 30px;
	border-bottom: 1px solid #eee;

	.icon-on-hover {
		transform: scale(0);
		transition: all ease 0.2s;
	}
	&:hover {
		.icon-on-hover {
			transform: scale(1);
		}
	}

	mark {
		background-color: #f5ff00;
	}

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

const fieldBadge = css`
	margin-left: 10px;
	font-size: 10px;
	background-color: #a2a4aa;
	border-radius: 3px;
	padding: 1px 2px;
	color: #fff;
`;

const label = css`
	font-weight: 700;
	color: rgba(0, 0, 0, 0.85);
	font-size: 14px;
	margin: 20px 0;
`;

const listLabel = css`
	display: flex;
	overflow: hidden;
	align-items: center;
	width: 100%;
	justify-content: space-between;
	div {
		width: 80%;
		font-size: inherit;
		text-overflow: ellipsis;
		overflow: hidden;
		& > * {
			text-overflow: ellipsis;
			white-space: nowrap;
			overflow: hidden;
			margin: 0;
			padding: 0;
		}
	}
`;

const tagContainer = css`
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	.tag {
		justify-content: end;
		margin-right: 10px;
		& * {
			margin: 0 !important;
			padding: 0 !important;
			max-width: 200px;
			white-space: nowrap;
			text-overflow: ellipsis;
			overflow: hidden;
			list-style: none !important;
			display: inline !important;
			line-height: inherit !important;
			font-size: 14px !important;
		}
	}
`;

const componentStyle = css`
	display: flex;
	align-items: center;
	.search.edit {
		margin-right: 0;
	}
	.edit {
		margin-right: auto;
	}
`;

const cardStyle = css`
	.show-on-hover {
		transition: all ease 0.2s;
		transform: scale(0);
		opacity: 0;
	}
	&:hover {
		.show-on-hover {
			transform: scale(1);
			opacity: 1;
		}
	}
`;

const resultItem = css`
	.icon-on-hover {
		transform: scale(0);
		transition: all ease 0.2s;
	}
	&:hover {
		.icon-on-hover {
			transform: scale(1);
		}
	}
`;

export {
	listItem,
	title,
	formWrapper,
	rowStyles,
	deleteStyles,
	listLabel,
	fieldBadge,
	label,
	tagContainer,
	componentStyle,
	resultItem,
	cardStyle,
};
