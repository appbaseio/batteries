import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Card, Tooltip, Button } from 'antd';

import { setMonitoringConfig } from '../../modules/actions';
import Loader from '../shared/Loader/Spinner';
import Summary from './Summary';

const MonitoringContainer = ({ esURL, esUsername, esPassword, isAppbase, setConfig }) => {
	const [data, setData] = useState({
		isLoading: true,
		hasMetricbeat: false,
	});

	const [refreshKey, setRefreshKey] = useState(Date.now());

	useEffect(() => {
		let isMounted = true;
		const getData = async () => {
			try {
				const res = await fetch(`${esURL}/metricbeat-*`, {
					headers: {
						Authorization: `Basic ${btoa(`${esUsername}:${esPassword}`)}`,
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

		getData();
		return () => {
			isMounted = false;
		};
	}, []);

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
								padding: '40px 20px 20px',
							}}
							key={refreshKey}
						>
							<Card
								title={<b>Monitoring</b>}
								extra={
									<Tooltip placement="topLeft" title="Refresh request logs.">
										<Button
											style={{ marginLeft: 8 }}
											onClick={() => {
												setRefreshKey(Date.now());
											}}
											icon="redo"
										/>
									</Tooltip>
								}
							>
								<Summary />
							</Card>
						</div>
					) : (
						<h1>Monitoring setup not found</h1>
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
};

MonitoringContainer.defaultProps = {
	isAppbase: false,
};

const mapDispatchToProps = (dispatch) => {
	return { setConfig: (data) => dispatch(setMonitoringConfig(data)) };
};

export default connect(null, mapDispatchToProps)(MonitoringContainer);
