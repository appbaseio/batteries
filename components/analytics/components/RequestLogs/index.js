import React from 'react';
import find from 'lodash/find';
import { connect } from 'react-redux';
import get from 'lodash/get';
import filter from 'lodash/filter';
import { Card, Tabs, Table, notification, Button, Tooltip } from 'antd';
import PropTypes from 'prop-types';
import Parser from 'partial-json-parser';
import {
	getRequestLogs,
	getRequestLogsColumns,
	getTimeDuration,
	requestLogsDateRanges,
} from '../../utils';
import RequestDetails from './RequestDetails';
import Loader from '../../../shared/Loader/Spinner';
import Flex from '../../../shared/Flex';
import DateFilter from '../Filter/DateFilter';
import { getUrlParams } from '../../../../utils/helpers';
import { withErrorToaster } from '../../../shared/ErrorToaster/ErrorToaster';

const { TabPane } = Tabs;

const normalizeData = (data) =>
	data.map((i) => {
		const timeDuration = getTimeDuration(get(i, 'timestamp'));
		const timeTaken =
			timeDuration.time > 0
				? `${timeDuration.time} ${timeDuration.formattedUnit} ago`
				: 'some time ago';
		return {
			id: get(i, '_id'),
			operation: {
				method: get(i, 'request.method'),
				uri: get(i, 'request.uri'),
			},
			classifier: get(i, 'category', '').toUpperCase(),
			timeTaken,
			status: get(i, 'response.code'),
			took: get(i, 'response.took'),
		};
	});

const parseData = (data = '') => {
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
				throw Error;
			}
		} catch (error) {
			return data;
		}
	}
};
class RequestLogs extends React.Component {
	constructor(props) {
		super(props);
		this.tabKeys = ['all', 'search', 'success', 'delete', 'error'];
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
			showDetails: false,
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
		const { logs } = this.state;
		this.currentRequest = logs && find(logs, (o) => get(o, '_id') === record.id);
		this.setState({
			showDetails: true,
		});
	};

	handleCancel = () => {
		this.setState({
			showDetails: false,
		});
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
		} = this.props;
		// Set loading to true
		this.setState(
			{
				[tab]: {
					...this.state[tab], // eslint-disable-line
					isLoading: true,
				},
			},
			() => {
				getRequestLogs(
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
				)
					.then((res) => {
						const { logs } = this.state;
						const hits = res.logs.map((item, index) => ({
							_id: `${index}-${new Date().toISOString()}`,
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
									hits: normalizeData(hits),
								},
							},
						});
						// Update the request time locally
						setInterval(() => {
							this.setState({
								[tab]: {
								...this.state[tab], // eslint-disable-line
									[currentPage]: {
									...this.state[tab][currentPage], // eslint-disable-line
										hits: normalizeData(hits),
									},
								},
							});
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
		const { pageSize, displaySearchLogs } = this.props;
		const { currentPage, total, isLoading  } = this.state[tab]; // eslint-disable-line
		const { hits } = this.state[tab][currentPage]; // eslint-disable-line

		return (
			<Table
				css=".ant-table-row { cursor: pointer }"
				rowKey={(record) => record.id}
				dataSource={hits}
				columns={getRequestLogsColumns(displaySearchLogs)}
				pagination={{
					pageSize,
					total,
					onChange: this.handlePageChange,
				}}
				scroll={{ x: 700 }}
				onRow={(record) => ({
					onClick: () => this.handleLogClick(record),
				})}
				loading={{
					spinning: isLoading,
					indicator: <Loader />,
				}}
			/>
		);
	};

	render() {
		const { activeTabKey, showDetails, isDateVisible, selectedDate } = this.state;
		const { displayFilter, title, displaySearchLogs, hideRefreshButton } = this.props;
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
							<Tooltip placement="topLeft" title="Refresh request logs.">
								<Button
									style={{ marginLeft: 8 }}
									onClick={() => {
										this.fetchRequestLogs();
									}}
									icon="redo"
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
							<TabPane tab="SUCCESS" key={this.tabKeys[2]}>
								{this.renderTable(this.tabKeys[2])}
							</TabPane>
							<TabPane tab="DELETE" key={this.tabKeys[3]}>
								{this.renderTable(this.tabKeys[3])}
							</TabPane>
							<TabPane tab="ERROR" key={this.tabKeys[4]}>
								{this.renderTable(this.tabKeys[4])}
							</TabPane>
						</Tabs>
					) : (
						this.renderTable(this.tabKeys[0])
					)}
					{showDetails && this.currentRequest && (
						<RequestDetails
							show={showDetails}
							handleCancel={this.handleCancel}
							headers={get(this.currentRequest, 'request.header', {})}
							request={parseData(get(this.currentRequest, 'request.body')) || {}}
							response={parseData(get(this.currentRequest, 'response.body')) || {}}
							time={get(this.currentRequest, 'timestamp', '')}
							method={get(this.currentRequest, 'request.method', '')}
							url={get(this.currentRequest, 'request.uri', '')}
							ip={get(this.currentRequest, 'request.header.X-Forwarded-For[0]')}
							status={get(this.currentRequest, 'response.code', '')}
							processingTime={get(this.currentRequest, 'response.timetaken', '')}
						/>
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
};

const mapStateToProps = (state) => ({
	appName: get(state, '$getCurrentApp.name'),
	arcVersion: get(state, '$getAppPlan.results.version'),
});
export default withErrorToaster(connect(mapStateToProps)(RequestLogs));
