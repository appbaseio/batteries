import React from 'react';
import { connect } from 'react-redux';
import get from 'lodash/get';
import filter from 'lodash/filter';
import { RedoOutlined } from '@ant-design/icons';
import { Card, Tabs, Table, notification, Button, Tooltip } from 'antd';
import PropTypes from 'prop-types';
import Parser from 'partial-json-parser';
import {
	getPipelineLogs,
	getRequestLogs,
	getRequestLogsColumns,
	getTimeDuration,
	requestLogsDateRanges,
} from '../../utils';
import Flex from '../../../shared/Flex';
import DateFilter from '../Filter/DateFilter';
import { getUrlParams } from '../../../../utils/helpers';
import { withErrorToaster } from '../../../shared/ErrorToaster/ErrorToaster';

const { TabPane } = Tabs;

const normalizeData = (data, isPipeMode = false) =>
	data.map((i) => {
		const timeDuration = getTimeDuration(get(i, 'timestamp'));
		const timeTaken =
			timeDuration.time > 0
				? `${timeDuration.time} ${timeDuration.formattedUnit} ago`
				: 'some time ago';

		let took = get(i, 'response.took');
		const id = get(i, 'id') || get(i, '_id');
		const operation = { method: get(i, 'request.method'), uri: get(i, 'request.uri') };
		if (isPipeMode) {
			took = get(i, 'took');
			operation.route = get(i, 'route');
		}
		return {
			id,
			operation,
			classifier: get(i, 'category', '').toUpperCase(),
			timeTaken,
			status: get(i, 'response.code'),
			took,
			isIdMissing: !get(i, 'id'),
		};
	});

export const parseData = (data = '') => {
	try {
		return JSON.parse(data);
	} catch (e) {
		try {
			try {
				const partiallyParsed = Parser(data);
				const hits = get(partiallyParsed, 'responses[0].hits.hits');
				if (hits) {
					partiallyParsed.responses[0].hits.hits.pop();
				}
				return partiallyParsed;
			} catch (err) {
				const removeBackslash = data.split('\n');
				const formatted = filter(removeBackslash, (o) => o !== '');
				if (formatted.length) {
					return (
						<div>
							{formatted.map((i, index) => (
								// eslint-disable-next-line
								<pre key={index}>{JSON.stringify(JSON.parse(i), 0, 2)}</pre>
							))}
						</div>
					);
				}
			}
			throw Error;
		} catch (error) {
			return data;
		}
	}
};
class RequestLogs extends React.Component {
	constructor(props) {
		super(props);
		this.tabKeys = ['all', 'search', 'suggestion', 'index', 'delete', 'error'];
		const { tab } = this.props;
		const defaultTabState = {
			currentPage: 0,
			0: {
				hits: [],
				isLoading: false,
			},
			total: 0,
		};
		const state = {
			activeTabKey: this.tabKeys.includes(tab) ? props.tab : this.tabKeys[0],
			logs: [],
			selectedDate: 'Last 30 days',
			isDateVisible: false,
		};
		this.tabKeys.forEach((tabKey) => {
			state[tabKey] = defaultTabState;
		});
		this.state = state;
	}

	componentDidMount() {
		const urlParams = getUrlParams(window.location.search);
		const { selectedDate } = this.state;
		const currentSelectedDateRange = requestLogsDateRanges[selectedDate];
		if (
			urlParams &&
			urlParams.from &&
			urlParams.to &&
			(currentSelectedDateRange.from !== urlParams.from ||
				currentSelectedDateRange.to !== urlParams.to)
		) {
			const selectedDateRange = Object.keys(requestLogsDateRanges).find(
				(dateRange) =>
					get(requestLogsDateRanges, `${dateRange}.from`) === urlParams.from &&
					get(requestLogsDateRanges, `${dateRange}.to`) === urlParams.to,
			);
			this.handleDate(selectedDateRange);
			return;
		}
		this.fetchRequestLogs();
	}

	componentDidUpdate(prevProps) {
		const { startLatency, endLatency, startDate, endDate } = this.props;
		if (
			startLatency !== prevProps.startLatency ||
			endLatency !== prevProps.endLatency ||
			startDate !== prevProps.startDate ||
			endDate !== prevProps.endDate
		) {
			this.fetchRequestLogs(undefined, undefined, undefined, startDate, endDate);
		}
	}

	changeActiveTabKey = (tab) => {
		this.setState(
			{
				activeTabKey: tab,
			},
			() => {
				this.redirectTo(tab);
				this.fetchRequestLogs(0, 0, tab);
			},
		);
	};

	redirectTo = (tab) => {
		const { changeUrlOnTabChange, appName, onTabChange } = this.props;
		if (changeUrlOnTabChange) {
			if (onTabChange) {
				onTabChange(tab);
			} else {
				window.history.pushState(
					null,
					null,
					`${window.location.origin}/app/${appName}/analytics/request-logs/${tab}`,
				);
			}
		}
	};

	handleLogClick = (record) => {
		try {
			const { pipelineLogsMode, appName } = this.props;

			if (pipelineLogsMode) {
				window.location.href = `logs/${record.id}`;
			} else {
				window.location.href = appName
					? `/app/${appName}/request-logs/${record.id}`
					: `request-logs/${String(record.id)}`;
			}
		} catch (e) {
			console.log('Error', e);
		}
	};

	handlePageChange = (page) => {
		const { pageSize } = this.props;
		this.fetchRequestLogs(pageSize * (page - 1), page);
	};

	// eslint-disable-next-line
	fetchRequestLogs = (
		from = 0,
		currentPage = 0,
		tab = this.state.activeTabKey, // eslint-disable-line
		startDate = get(requestLogsDateRanges, `${this.state.selectedDate}.from`), // eslint-disable-line
		endDate = get(requestLogsDateRanges, `${this.state.selectedDate}.to`), // eslint-disable-line
	) => {
		const {
			appName,
			pageSize,
			displaySearchLogs,
			startLatency,
			endLatency,
			arcVersion,
			pipelineLogsMode,
			pipelineId,
		} = this.props;
		// Clear interval
		if (this.intervalId) {
			clearInterval(this.intervalId);
		}
		// Set loading to true
		this.setState(
			{
				[tab]: {
					...this.state[tab], // eslint-disable-line
					isLoading: true,
				},
			},
			() => {
				let requestPromise;
				if (pipelineLogsMode) {
					requestPromise = getPipelineLogs(
						pipelineId,
						{
							size: pageSize,
							from,
							startDate,
							endDate,
							category: tab,
						},
						arcVersion,
					);
				} else {
					requestPromise = getRequestLogs(
						appName,
						{
							size: pageSize,
							from,
							filter: tab,
							startDate,
							endDate,
							startLatency,
							endLatency,
						},
						displaySearchLogs,
						arcVersion,
					);
				}

				requestPromise
					.then((res) => {
						const { logs } = this.state;
						const hits = res.logs.map((item, index) => ({
							_id: `${index}-${new Date().getTime()}`,
							...item,
						}));
						this.setState({
							logs: [...hits, ...logs],
							[tab]: {
								isLoading: false,
								currentPage,
								total: res.total,
								[currentPage]: {
									...this.state[tab][currentPage], // eslint-disable-line
									hits: normalizeData(hits, pipelineLogsMode),
								},
							},
						});
						// Update the request time locally
						this.intervalId = setInterval(() => {
							this.setState((prevState) => ({
								[tab]: {
									...prevState[tab], // eslint-disable-line
									[currentPage]: {
										...prevState[tab][currentPage], // eslint-disable-line
										hits: normalizeData(hits, pipelineLogsMode),
									},
								},
							}));
						}, 60000);
					})
					.catch((e) => {
						notification.error({
							message: 'Error',
							description: get(e, 'responseJSON.message', 'Unable to fetch logs.'),
						});
						this.setState({
							[tab]: {
								...this.state[tab], // eslint-disable-line
								isLoading: false,
							},
						});
					});
			},
		);
	};

	handleDate = (filterValue = '') => {
		this.setState(
			{
				isDateVisible: false,
				selectedDate: filterValue,
			},
			() => this.fetchRequestLogs(),
		);
	};

	toggleDatePopover = () => {
		this.setState((state) => ({
			isDateVisible: !state.isDateVisible,
		}));
	};

	renderTable = (tab) => {
		const { pageSize, displaySearchLogs, pipelineLogsMode } = this.props;
		const { currentPage, total, isLoading } = this.state[tab]; // eslint-disable-line
		const { hits } = this.state[tab][currentPage]; // eslint-disable-line

		return (
			<Table
				css=".ant-table-row { cursor: pointer }"
				rowKey={(record) => record.id}
				dataSource={hits}
				columns={getRequestLogsColumns(displaySearchLogs, pipelineLogsMode)}
				pagination={{
					pageSize,
					total,
					current: currentPage,
					onChange: this.handlePageChange,
					showSizeChanger: false,
				}}
				scroll={{ x: 700 }}
				onRow={(record) => ({
					onClick: () => this.handleLogClick(record),
				})}
				loading={isLoading}
			/>
		);
	};

	render() {
		const { activeTabKey, isDateVisible, selectedDate } = this.state;
		const { displayFilter, title, displaySearchLogs, hideRefreshButton, pipelineLogsMode } =
			this.props;
		return (
			<Card
				title={title}
				extra={
					<Flex>
						{displayFilter ? (
							<DateFilter
								onChange={this.handleDate}
								toggleVisible={this.toggleDatePopover}
								label={selectedDate}
								dateRanges={requestLogsDateRanges}
								visible={isDateVisible}
								columnItems={5}
							/>
						) : null}
						{!hideRefreshButton ? (
							<Tooltip
								placement="topLeft"
								title={`Refresh ${pipelineLogsMode ? 'pipeline' : 'request'} logs.`}
							>
								<Button
									style={{ marginLeft: 8 }}
									onClick={() => {
										this.fetchRequestLogs();
									}}
									icon={<RedoOutlined />}
								/>
							</Tooltip>
						) : null}
					</Flex>
				}
			>
				<React.Fragment>
					{!displaySearchLogs ? (
						<Tabs
							animated={false}
							onTabClick={this.changeActiveTabKey}
							activeKey={activeTabKey}
						>
							<TabPane tab="ALL" key={this.tabKeys[0]}>
								{this.renderTable(this.tabKeys[0])}
							</TabPane>
							<TabPane tab="SEARCH" key={this.tabKeys[1]}>
								{this.renderTable(this.tabKeys[1])}
							</TabPane>
							<TabPane tab="SUGGESTION" key={this.tabKeys[2]}>
								{this.renderTable(this.tabKeys[2])}
							</TabPane>
							<TabPane tab="INDEX" key={this.tabKeys[3]}>
								{this.renderTable(this.tabKeys[3])}
							</TabPane>
							{/* <TabPane tab="SUCCESS" key={this.tabKeys[2]}>
								{this.renderTable(this.tabKeys[2])}
							</TabPane> */}
							<TabPane tab="DELETE" key={this.tabKeys[4]}>
								{this.renderTable(this.tabKeys[4])}
							</TabPane>
							<TabPane tab="ERROR" key={this.tabKeys[5]}>
								{this.renderTable(this.tabKeys[5])}
							</TabPane>
						</Tabs>
					) : (
						this.renderTable(this.tabKeys[0])
					)}
				</React.Fragment>
			</Card>
		);
	}
}
RequestLogs.defaultProps = {
	changeUrlOnTabChange: false,
	onTabChange: undefined, // Use this to override the default redirect logic on tab change
	tab: 'all',
	title: 'Latest Operations',
	pageSize: 10,
	appName: undefined,
	displayFilter: true,
	displaySearchLogs: false,
	startLatency: undefined,
	endLatency: undefined,
	startDate: undefined,
	endDate: undefined,
	hideRefreshButton: false,
	pipelineLogsMode: false,
	pipelineId: '',
};
RequestLogs.propTypes = {
	tab: PropTypes.string,
	title: PropTypes.any,
	onTabChange: PropTypes.func,
	appName: PropTypes.string,
	displaySearchLogs: PropTypes.bool,
	hideRefreshButton: PropTypes.bool,
	changeUrlOnTabChange: PropTypes.bool,
	displayFilter: PropTypes.bool,
	pageSize: PropTypes.number,
	arcVersion: PropTypes.string.isRequired,
	startLatency: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	endLatency: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	startDate: PropTypes.string,
	endDate: PropTypes.string,
	pipelineLogsMode: PropTypes.bool,
	pipelineId: PropTypes.string,
};

const mapStateToProps = (state) => ({
	appName: get(state, '$getCurrentApp.name'),
	arcVersion: get(state, '$getAppPlan.results.version'),
});
export default withErrorToaster(connect(mapStateToProps)(RequestLogs));
