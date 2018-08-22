import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from 'antd';
import { css } from 'react-emotion';
import Flex from './../shared/Flex';

const formLabel = css`
	font-weight: 500;
	color: black;
	font-size: 14px;
`;
const Grid = ({ label, component, toolTipMessage }) => (
	<Flex css="margin-top: 30px">
		<Flex css="flex: 25%">
			<div>
				<span css={formLabel}>
					{label}
					{toolTipMessage && (
						<Tooltip
							css="margin-left: 5px;color:#898989"
							overlay={toolTipMessage}
							mouseLeaveDelay={0}
						>
							<i className="fas fa-info-circle" />
						</Tooltip>
					)}
				</span>
			</div>
		</Flex>
		<Flex css="flex: 75%; margin-left: 20px">{component}</Flex>
	</Flex>
);

Grid.propTypes = {
	label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
	component: PropTypes.node,
	toolTipMessage: PropTypes.any,
};

export default Grid;
