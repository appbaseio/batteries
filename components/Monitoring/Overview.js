import React, { useState, useEffect } from 'react';
import { Badge, Skeleton, Tooltip, Icon, Alert } from 'antd';
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
			const overviewResponse = await fetchOverviewData(config, timeFilter);
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
							Health <Icon type="info-circle" />
						</Title>
					</Tooltip>
					<Flex justifyContent="space-between" style={{ paddingTop: 10 }}>
						<span>Elasticsearch</span>
						{get(overviewData, 'data.esState') ? (
							<Badge
								color={get(overviewData, 'data.esStatus')}
								text={HEALTH_TEXT[get(overviewData, 'data.esStatus')]}
							/>
						) : (
							<span>N/A</span>
						)}
					</Flex>
					<Flex justifyContent="space-between">
						<span>Appbase.io</span>
						<Badge
							color={get(overviewData, 'data.arcStatus')}
							text={HEALTH_TEXT[get(overviewData, 'data.arcStatus')]}
						/>
					</Flex>

					<Flex justifyContent="space-between">
						<span>Kibana</span>

						{get(overviewData, 'data.kibanaStatus') ? (
							<Badge
								color={get(overviewData, 'data.kibanaStatus')}
								text={HEALTH_TEXT[get(overviewData, 'data.kibanaStatus')]}
							/>
						) : (
							<span>N/A</span>
						)}
					</Flex>

					<br />
					<Tooltip title={get(messages, 'tooltips.uptime')}>
						<Title>
							Uptime <Icon type="info-circle" />
						</Title>
					</Tooltip>
					{get(overviewData, 'data.uptime').length ? (
						get(overviewData, 'data.uptime').map((item) => (
							<Flex justifyContent="space-between" key={item.node}>
								<span>{item.node}</span>
								<span>{item.uptime} hrs</span>
							</Flex>
						))
					) : (
						<Alert
							type="warning"
							message="No Data available for given time frame"
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

const mapStateToProps = (state) => {
	return {
		config: get(state, '$monitoring.config', {}),
		timeFilter: get(state, '$monitoring.filter.time', ''),
	};
};

export default connect(mapStateToProps)(Overview);
