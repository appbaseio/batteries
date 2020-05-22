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
	.ant-statistic-content-suffix {
		font-size: 14px;
	}
	.ant-statistic-content {
		font-size: 14px;
	}
	.prefix-icon {
		font-size: 12px;
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
	isLowerBetter,
}) => {
	const comparison = getComparisonValue(value, comparisonValue);
	let isComparisonPositive = true;
	if (isLowerBetter && comparison > 0) {
			isComparisonPositive = false
	} else if(comparison < 0) {
		isComparisonPositive = false
	}
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
					<Flex flexDirection="column">
						<Flex className="stats">
							<Statistic
								value={Math.abs(comparison)}
								precision={2}
								valueStyle={{
									...(isComparisonPositive ? { color: '#3f8600' } : { color: '#cf1322' }),
								}}
								prefix={
									comparison > 0 ? (
										<Icon type="plus" className="prefix-icon" />
									) : (
										<Icon type="minus" className="prefix-icon" />
									)
								}
								formatter={comparisonValue === 0 ? () => '' : undefined}
								suffix={comparisonValue !== 0 ? '%' : ''}
							/>
							{!hidePrevStats && (
								<span className="prev-stats">Previously: {comparisonValue}</span>
							)}
						</Flex>
						{
							hidePrevStats && (
								<Flex justifyContent="center" alignItems="center">
									<span className="prev-stats">Previously: {comparisonValue}</span>
								</Flex>
							)
						}
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
	isLowerBetter: false,
	hidePrevStats: false,
	comparisonValue: undefined,
	value: 0,
};
SummaryCard.propTypes = {
	percent: PropTypes.number,
	style: PropTypes.object,
	showPercent: PropTypes.bool,
	isLowerBetter: PropTypes.bool,
	showComparisonStats: PropTypes.bool,
	hidePrevStats: PropTypes.bool,
	title: PropTypes.string.isRequired,
	label: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	comparisonValue: PropTypes.number,
	value: PropTypes.number,
};

export default SummaryCard;
