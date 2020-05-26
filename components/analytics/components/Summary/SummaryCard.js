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
	.comp-plus {
		font-size: 14px;
		font-weight: bold;
		line-height: 1.4;
		padding: 7px 10px;
		border-radius: 12px;
		margin-right: 20px;
	}
`;

const positiveComp = {
	color: '#296346',
	backgroundColor: '#cbf4c9',
};

const negativeComp = {
	color: '#820200',
	backgroundColor: '#ffa193',
};

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
		isComparisonPositive = false;
	} else if (comparison < 0) {
		isComparisonPositive = false;
	}
	return (
		<Flex alignItems="center" justifyContent="center" style={style} className={cardStyle}>
			<div>
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
				{showComparisonStats ? (
					<Flex
						style={{
							height: 35,
							...(hidePrevStats
								? {
										marginTop: 10,
										marginBottom: 10,
								  }
								: null),
						}}
						justifyContent="center"
						alignItems="center"
						flexDirection={hidePrevStats ? 'column' : 'row'}
					>
						{comparison && comparisonValue !== 0 ? (
							<div
								className="comp-plus"
								style={{
									...(hidePrevStats
										? {
												marginRight: 0,
												marginBottom: 5,
										  }
										: null),
									...(isComparisonPositive ? positiveComp : negativeComp),
								}}
							>
								+ {Math.abs(comparison).toFixed(2).toString()}%
							</div>
						) : null}
						<div>Previously: {comparisonValue}</div>
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
