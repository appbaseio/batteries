import React from 'react';
import { Row, Col, Card } from 'antd';
import PropTypes from 'prop-types';
import { css } from 'emotion';
import SummaryCard from './SummaryCard';
import { withErrorToaster } from '../../../shared/ErrorToaster/ErrorToaster';
import VersionController from '../../../shared/VersionController';

const cardContainer = css`
	padding: 10px;
`;

const SummaryStats = ({ summaryConfig, style }) => {
	return (
		<Card
			extra={
				<a href="https://docs.reactivesearch.io/docs/analytics/Overview/">
					Read More about these stats
				</a>
			}
			css="margin-bottom: 20px"
			title="Summary"
			style={style}
		>
			<VersionController version="7.31.0">
				<div>
					{[...Array(Math.ceil(summaryConfig.length / 6))].map((_, rowIndex) => {
						return (
							<Row
								// eslint-disable-next-line
								key={rowIndex}
								gutter={8}
								className={cardContainer}
							>
								{[...Array(6)].map((__, colIndex) => {
									const summary = summaryConfig[6 * rowIndex + colIndex];
									return summary ? (
										<Col
											key={summary.label + summary.value}
											sm={24}
											xs={24}
											xl={4}
										>
											<SummaryCard
												style={{
													borderTop:
														summary.borderTop || '2px solid #000',
												}}
												key={summary.label + summary.value}
												title={summary.label}
												label={summary.value}
												showComparisonStats={false}
											/>
										</Col>
									) : null;
								})}
							</Row>
						);
					})}
				</div>
			</VersionController>
		</Card>
	);
};

SummaryStats.defaultProps = {
	summaryConfig: [],
	style: null,
};

SummaryStats.propTypes = {
	summaryConfig: PropTypes.arrayOf(
		PropTypes.shape({
			label: PropTypes.string,
			value: PropTypes.any,
			borderTop: PropTypes.string,
		}),
	),
	style: PropTypes.object,
};

export default withErrorToaster(SummaryStats);
