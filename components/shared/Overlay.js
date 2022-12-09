import React from 'react';
import { css } from 'react-emotion';
import PropTypes from 'prop-types';
import { LockOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { media } from '../../utils/media';

const overlay = css`
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	margin: 20px;
	background-color: rgba(255, 255, 255, 0.3);
	z-index: 9999;
	color: black;
`;
const upgradePlan = css`
	margin-top: 30%;
	font-size: 16px;
	font-weight: 500;
	text-align: center;
`;
const imgCls = css`
	width: 100%;
	height: auto;
`;
const imgContainer = css`
	max-width: 550px;
	margin: 0 auto;
	padding: 20px;
	position: relative;
`;
const icon = css`
	font-size: 40px;
	${media.small(css`
		font-size: 20px;
	`)};
`;
const Overlay = ({ src, alt, renderContent, lockSectionStyle, children, ...props }) => (
	<div css={imgContainer} {...props}>
		<div css={overlay}>
			<div css={upgradePlan} style={lockSectionStyle}>
				<div>
					<LockOutlined css={icon} />
				</div>
				{children}
			</div>
		</div>
		{renderContent ? renderContent() : <img alt={alt} css={imgCls} src={src} />}
	</div>
);
Overlay.defaultProps = {
	alt: '',
	lockSectionStyle: {},
	renderContent: null,
	children: null,
};
Overlay.propTypes = {
	src: PropTypes.string.isRequired,
	alt: PropTypes.string,
	lockSectionStyle: PropTypes.object,
	renderContent: PropTypes.func,
	children: PropTypes.node,
};

export default Overlay;
