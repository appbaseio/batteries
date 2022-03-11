import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Card, Tooltip, Button } from 'antd';
import get from 'lodash/get';

import { setMonitoringConfig } from '../../modules/actions';
import { CLUSTER_PLANS } from '../../utils';
import Loader from '../shared/Loader/Spinner';
import Summary from './Summary';
import NodeStats from './NodeStats';
import TimeFilter from './TimeFilter';
import Overlay from '../shared/Overlay';
import { messages } from './messages';

const MonitoringContainer = ({
	esURL,
	esUsername,
	esPassword,
	arcURL,
	kibanaURL,
	kibanaUsername,
	kibanaPassword,
	isAppbase,
	setConfig,
	plan,
}) => {
	const [data, setData] = useState({
		isLoading: true,
		hasMetricbeat: false,
	});

	const isClusterPlan = Object.values(CLUSTER_PLANS).includes(plan);

	const [refreshKey, setRefreshKey] = useState(Date.now());

	useEffect(() => {
		let isMounted = true;
		const getData = async () => {
			try {
				const res = await fetch(`${esURL}/metricbeat-*,.ds-metricbeat-*`, {
					headers: {
						Authorization: `Basic ${btoa(
							`${esUsername}:${esPassword}`,
						)}`,
						'Content-Type': 'application/json',
					},
				});
				const json = await res.json();
				if (Object.keys(json).length && isMounted) {
					setConfig({
						esURL,
						esUsername,
						esPassword,
						isAppbase,
						arcURL,
						kibanaUsername,
						kibanaPassword,
						kibanaURL,
					});
					// just to make sure redux store is updated with configs
					setTimeout(() => {
						setData({
							isLoading: false,
							hasMetricbeat: true,
						});
					}, 500);
				} else {
					setData({
						isLoading: false,
						hasMetricbeat: false,
					});
				}
			} catch (error) {
				throw error;
			}
		};

		if (isClusterPlan) {
			getData();
		}
		return () => {
			isMounted = false;
		};
	}, []);

	if (!isClusterPlan) {
		return (
			<div style={{ marginTop: 100 }}>
				<Overlay
					lockSectionStyle={{
						transform: 'translateY(70%)',
					}}
					src="https://www.dropbox.com/s/nwqf21zsyp8lhui/Screenshot%202021-01-08%20at%207.10.35%20PM.png?raw=1"
					alt="Query Rules"
				/>
				<p style={{ textAlign: 'center' }}>
					{get(messages, 'featureUnavailable')}
				</p>
			</div>
		);
	}

	return (
		<div>
			{data.isLoading ? (
				<Loader />
			) : (
				<>
					{data.hasMetricbeat ? (
						<div
							css={{
								width: '100%',
								maxWidth: 1300,
								margin: '0 auto',
								padding: isAppbase ? '40px 20px 20px' : '',
							}}
							key={refreshKey}
						>
							<Card
								title={<b>Cluster Monitoring</b>}
								extra={
									<>
										<Tooltip
											placement="topLeft"
											title="Refresh request logs."
										>
											<Button
												style={{ marginLeft: 8 }}
												onClick={() => {
													setRefreshKey(Date.now());
												}}
												icon="redo"
											/>
										</Tooltip>
										<TimeFilter plan={plan} />
									</>
								}
							>
								<Summary />
								<br />
								<NodeStats />
							</Card>
						</div>
					) : (
						<div style={{ marginTop: 100 }}>
							<Overlay
								lockSectionStyle={{
									transform: 'translateY(70%)',
								}}
								src="https://www.dropbox.com/s/nwqf21zsyp8lhui/Screenshot%202021-01-08%20at%207.10.35%20PM.png?raw=1"
								alt="Query Rules"
							/>
							<p style={{ textAlign: 'center' }}>
								{get(messages, 'monitoringUnavailable')} Please{' '}
								<span
									style={{
										cursor: 'pointer',
										color: 'dodgerblue',
									}}
									onClick={() => window.Intercom('show')}
								>
									contact us
								</span>
								.
							</p>
						</div>
					)}
				</>
			)}
		</div>
	);
};

MonitoringContainer.propTypes = {
	esURL: PropTypes.string.isRequired,
	esUsername: PropTypes.string.isRequired,
	esPassword: PropTypes.string.isRequired,
	setConfig: PropTypes.func.isRequired,
	isAppbase: PropTypes.bool,
	plan: PropTypes.string.isRequired,
	arcURL: PropTypes.string,
	kibanaUsername: PropTypes.string,
	kibanaPassword: PropTypes.string,
	kibanaURL: PropTypes.string,
};

MonitoringContainer.defaultProps = {
	isAppbase: false,
	arcURL: '',
	kibanaURL: '',
	kibanaPassword: '',
	kibanaUsername: '',
};

const mapDispatchToProps = dispatch => {
	return {
		setConfig: data => dispatch(setMonitoringConfig(data)),
	};
};

export default connect(null, mapDispatchToProps)(MonitoringContainer);
