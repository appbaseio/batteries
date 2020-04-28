import React from 'react';
import PropTypes from 'prop-types';
import { css } from 'react-emotion';
import { Statistic, Icon } from 'antd';
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
	.stats {
		align-items: center;
		justify-content: center;
	}
	.prev-stats {
		margin-left: 10px;
		font-size: 12px;
	}
	.ant-statistic-content-value-decimal {
		font-size: 14px;
	}
`;

const getComparisonValue = (value, prevValue) => {
	if (value === undefined || value === null || prevValue === undefined || prevValue === null) {
		return null;
	}
	if (prevValue === 0) {
		// divide by zero exception
		return value;
	}
	return ((value - prevValue) / prevValue) * 100;
};

const SummaryCard = ({
	percent,
	title,
	label,
	comparisonValue,
	value,
	style,
	showPercent,
	showComparisonStats,
	hidePrevStats,
}) => {
	const comparison = getComparisonValue(value, comparisonValue);
	return (
		<Flex alignItems="center" justifyContent="center" style={style} className={cardStyle}>
			{/* {icon && (
				<div>
					<Icon type={icon} style={{ fontSize: '2.5em', marginRight: 15 }} />
				</div>
			)} */}
			<div style={{ height: 96 }}>
				<p>{title}</p>
				<h2
					style={{
						fontSize: '1.3rem',
						display: 'flex',
						flexDirection: label > 1000 ? 'column' : 'row',
					}}
				>
					{typeof label === 'string' ? label : (+label).toLocaleString()}
					{showPercent ? (
						<span style={{ lineHeight: label > 1000 ? 1 : 'inherit' }}>
							{`(${percent || '0.00'}%)`}
						</span>
					) : null}
				</h2>
				{showComparisonStats && comparison ? (
					<Flex className="stats">
						<Statistic
							value={Math.abs(comparison)}
							precision={2}
							valueStyle={{
								...(comparison > 0 ? { color: '#3f8600' } : { color: '#cf1322' }),
								fontSize: 18,
							}}
							prefix={
								comparison > 0 ? (
									<Icon type="arrow-up" />
								) : (
									<Icon type="arrow-down" />
								)
							}
							formatter={comparisonValue === 0 ? () => '' : undefined}
							suffix={comparisonValue !== 0 ? '%' : ''}
						/>
						{!hidePrevStats && (
							<span className="prev-stats">Previously: {comparisonValue}</span>
						)}
					</Flex>
				) : null}
			</div>
		</Flex>
	);
};
SummaryCard.defaultProps = {
	percent: 0,
	label: 0,
	style: {},
	showPercent: false,
	showComparisonStats: false,
	hidePrevStats: false,
	comparisonValue: undefined,
	value: 0,
};
SummaryCard.propTypes = {
	percent: PropTypes.number,
	style: PropTypes.object,
	showPercent: PropTypes.bool,
	showComparisonStats: PropTypes.bool,
	hidePrevStats: PropTypes.bool,
	title: PropTypes.string.isRequired,
	label: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	comparisonValue: PropTypes.number,
	value: PropTypes.number,
};

export default SummaryCard;
