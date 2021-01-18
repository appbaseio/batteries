import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { connect } from 'react-redux';
import { Skeleton, Card, Tooltip as AntToolTip, Icon } from 'antd';
import { LineChart, XAxis, YAxis, Tooltip, Line, Legend } from 'recharts';

import { fetchGraphData } from '../../utils/monitoring';
import GraphToolTip from './GraphToolTip';
import Flex from '../shared/Flex';
import { GraphContainer } from './MonitoringStyledComponents';
import { messages } from './messages';

const NodeGraphs = ({ config, timeFilter, nodeKey }) => {
	const [graphData, setGraphData] = useState({
		loading: true,
		data: [],
	});
	useEffect(() => {
		let isMounted = true;
		const getData = async () => {
			const res = await fetchGraphData(config, timeFilter, nodeKey);
			if (isMounted) {
				setGraphData({
					loading: false,
					data: res,
				});
			}
		};

		getData();

		return () => {
			isMounted = false;
		};
	}, [timeFilter]);

	return (
		<div>
			{graphData.loading ? (
				<Skeleton active />
			) : (
				<>
					<Flex>
						<GraphContainer>
							<Card
								title={
									<AntToolTip title={get(messages, 'tooltips.graphCpuUsage')}>
										<span>
											CPU Usage <Icon type="info-circle" />
										</span>
									</AntToolTip>
								}
							>
								<LineChart
									width={450}
									height={250}
									data={graphData.data.cpuUsage}
									margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
								>
									<XAxis dataKey="date" />
									<YAxis dataKey="data" />
									<Tooltip
										content={<GraphToolTip graphLabel="CPU Usage" unit="%" />}
									/>
									<Legend formatter={() => `CPU Usage`} />
									<Line type="monotone" dataKey="data" stroke="#8884d8" />
								</LineChart>
							</Card>
						</GraphContainer>
						<GraphContainer>
							<Card
								title={
									<AntToolTip
										title={get(messages, 'tooltips.graphDiskAvailable')}
									>
										<span>
											Disk Available <Icon type="info-circle" />
										</span>
									</AntToolTip>
								}
							>
								<LineChart
									width={450}
									height={250}
									data={graphData.data.diskAvailable}
									margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
								>
									<XAxis dataKey="date" />
									<YAxis dataKey="data" />
									<Tooltip
										content={<GraphToolTip graphLabel="Disk" unit="GB" />}
									/>
									<Legend formatter={() => `Disk Available (GB)`} />
									<Line type="monotone" dataKey="data" stroke="#8884d8" />
								</LineChart>
							</Card>
						</GraphContainer>
					</Flex>
					<Flex>
						<GraphContainer>
							<Card
								title={
									<AntToolTip title={get(messages, 'tooltips.graphJvmHeap')}>
										<span>
											JVM Heap <Icon type="info-circle" />
										</span>
									</AntToolTip>
								}
							>
								<LineChart
									width={450}
									height={250}
									data={graphData.data.jvmHeap}
									margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
								>
									<XAxis dataKey="date" />
									<YAxis dataKey="data" />
									<Tooltip
										content={<GraphToolTip graphLabel="JVM" unit="GB" />}
									/>
									<Legend formatter={() => `JVM Heap (GB)`} />
									<Line type="monotone" dataKey="data" stroke="#8884d8" />
								</LineChart>
							</Card>
						</GraphContainer>
						<GraphContainer>
							<Card
								title={
									<AntToolTip title={get(messages, 'tooltips.graphMemory')}>
										<span>
											Memory Utilization <Icon type="info-circle" />
										</span>
									</AntToolTip>
								}
							>
								<LineChart
									width={450}
									height={250}
									data={graphData.data.memory}
									margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
								>
									<XAxis dataKey="date" />
									<YAxis dataKey="data" />
									<Tooltip
										content={
											<GraphToolTip
												graphLabel="Memory Utilization"
												unit="GB"
											/>
										}
									/>
									<Legend formatter={() => `Memory Utilization (GB)`} />
									<Line type="monotone" dataKey="data" stroke="#8884d8" />
								</LineChart>
							</Card>
						</GraphContainer>
					</Flex>
					<Flex>
						<GraphContainer>
							<Card
								title={
									<AntToolTip title={get(messages, 'tooltips.graphSegmentCount')}>
										<span>
											Segment Count <Icon type="info-circle" />
										</span>
									</AntToolTip>
								}
							>
								<LineChart
									width={450}
									height={250}
									data={graphData.data.segmentCount}
									margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
								>
									<XAxis dataKey="date" />
									<YAxis dataKey="data" />
									<Tooltip
										content={<GraphToolTip graphLabel="Segment Count" />}
									/>
									<Legend formatter={() => `Segment Count`} />
									<Line type="monotone" dataKey="data" stroke="#8884d8" />
								</LineChart>
							</Card>
						</GraphContainer>
					</Flex>
				</>
			)}
		</div>
	);
};

NodeGraphs.propTypes = {
	nodeKey: PropTypes.string.isRequired,
	config: PropTypes.object.isRequired,
	timeFilter: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => {
	return {
		config: get(state, '$monitoring.config', {}),
		timeFilter: get(state, '$monitoring.filter.time', ''),
	};
};

export default connect(mapStateToProps)(NodeGraphs);
