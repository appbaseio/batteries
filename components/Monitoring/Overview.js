import React, { useState, useEffect } from 'react';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Badge, Skeleton, Tooltip, Alert } from 'antd';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import get from 'lodash/get';

import Flex from '../shared/Flex';
import { CustomCard, Title } from './MonitoringStyledComponents';
import { fetchOverviewData } from '../../utils/monitoring';
import { messages } from './messages';

const HEALTH_TEXT = {
	green: 'Healthy',
	red: 'Unavailable',
	yellow: 'Unassigned Shards',
};

const Overview = ({ config, timeFilter }) => {
	const [overviewData, setOverviewData] = useState({
		loading: true,
		data: {},
	});
	useEffect(() => {
		let isMounted = true;
		async function getOverviewData() {
			const overviewResponse = await fetchOverviewData(
				config,
				timeFilter,
			);
			if (isMounted) {
				setOverviewData({
					loading: false,
					data: overviewResponse,
				});
			}
		}

		getOverviewData();

		return () => {
			isMounted = false;
		};
	}, [timeFilter]);
	return (
        <CustomCard title="Overview">
			{overviewData.loading ? (
				<Skeleton active />
			) : (
				<>
					<Tooltip title={get(messages, 'tooltips.health')}>
						<Title>
							Health <InfoCircleOutlined />
						</Title>
					</Tooltip>
					<Flex
						justifyContent="space-between"
						style={{ paddingTop: 10 }}
					>
						<div style={{ flex: 1 }}>Elasticsearch</div>
						{get(overviewData, 'data.esStatus') ? (
							<Badge
								color={get(overviewData, 'data.esStatus')}
								text={
									HEALTH_TEXT[
										get(overviewData, 'data.esStatus')
									]
								}
								style={{
									flex: 1,
									textAlign: 'right',
								}}
							/>
						) : (
							<div style={{ flex: 1, textAlign: 'right' }}>
								N/A
							</div>
						)}
					</Flex>
					<Flex justifyContent="space-between">
						<div style={{ flex: 1 }}>Appbase.io</div>
						<Badge
							color={get(overviewData, 'data.arcStatus')}
							text={
								HEALTH_TEXT[get(overviewData, 'data.arcStatus')]
							}
							style={{
								flex: 1,
								textAlign: 'right',
							}}
						/>
					</Flex>

					<Flex justifyContent="space-between">
						<div style={{ flex: 1 }}>Kibana</div>

						{get(overviewData, 'data.kibanaStatus') ? (
							<Badge
								color={get(overviewData, 'data.kibanaStatus')}
								text={
									HEALTH_TEXT[
										get(overviewData, 'data.kibanaStatus')
									]
								}
								style={{
									flex: 1,
									textAlign: 'right',
								}}
							/>
						) : (
							<div
								style={{
									flex: 1,
									textAlign: 'right',
								}}
							>
								N/A
							</div>
						)}
					</Flex>

					<br />
					<Tooltip title={get(messages, 'tooltips.uptime')}>
						<Title>
							Uptime <InfoCircleOutlined />
						</Title>
					</Tooltip>
					{get(overviewData, 'data.uptime').length ? (
						get(overviewData, 'data.uptime').map(item => (
							<Flex
								justifyContent="space-between"
								key={item.node}
							>
								<div style={{ fleX: 1 }}>{item.node}</div>
								<div style={{ flex: 1, textAlign: 'right' }}>
									{item.uptime}
								</div>
							</Flex>
						))
					) : (
						<Alert
							type="warning"
							message="No data available for given time frame"
							showIcon
							size="small"
							style={{
								marginTop: 10,
							}}
						/>
					)}
				</>
			)}
		</CustomCard>
    );
};

Overview.propTypes = {
	config: PropTypes.object.isRequired,
	timeFilter: PropTypes.string.isRequired,
};

const mapStateToProps = state => {
	return {
		config: get(state, '$monitoring.config', {}),
		timeFilter: get(state, '$monitoring.filter.time', ''),
	};
};

export default connect(mapStateToProps)(Overview);
