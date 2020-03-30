import React from 'react';
import PropTypes from 'prop-types';
import { css } from 'react-emotion';
import Flex from '../../../shared/Flex';

const cardStyle = css`
	margin-bottom: 8px;
	background: rgba(229, 230, 233, 0.21);
	padding: 15px 0;
	p,
	h2 {
		margin: 0;
		text-align: center;
	}

	p {
		font-size: 1em;
		font-weight: bold;
		color: #8c8c8c;
	}

	h2 {
		color: #595959;
		display: flex;
		justify-content: center;
		vertical-align: middle;
	}

	h2 span {
		color: #8c8c8c;
		font-weight: bold;
		margin-left: 5px;
		font-size: 16px;
	}
`;

const SummaryCard = ({ percent, title, count, style, showPercent }) => (
	<Flex alignItems="center" justifyContent="center" style={style} className={cardStyle}>
		{/* {icon && (
			<div>
				<Icon type={icon} style={{ fontSize: '2.5em', marginRight: 15 }} />
			</div>
		)} */}
		<div>
			<p>{title}</p>
			<h2
				style={{
					fontSize: '1.3rem',
					display: 'flex',
					flexDirection: count > 100 ? 'column' : 'row',
				}}
			>
				{typeof count === 'string' ? count : (+count).toLocaleString()}
				{showPercent ? (
					<span style={{ lineHeight: count > 100 ? 1 : 'inherit' }}>
						{`(${percent || '0.00'}%)`}
					</span>
				) : null}
			</h2>
		</div>
	</Flex>
);
SummaryCard.defaultProps = {
	percent: 0,
	count: 0,
	style: {},
	showPercent: false,
};
SummaryCard.propTypes = {
	percent: PropTypes.number,
	style: PropTypes.object,
	showPercent: PropTypes.bool,
	title: PropTypes.string.isRequired,
	count: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default SummaryCard;
