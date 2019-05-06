import React from 'react';
import find from 'lodash/find';
import { connect } from 'react-redux';
import get from 'lodash/get';
import filter from 'lodash/filter';
import {
 Card, Tabs, Table, notification,
} from 'antd';
import PropTypes from 'prop-types';
import Parser from 'partial-json-parser';
import { getRequestLogs, requestLogs, getTimeDuration } from '../../utils';
import { getAppPlanByName } from '../../../../modules/selectors';
import RequestDetails from './RequestDetails';
import Loader from '../../../shared/Loader/Spinner';

const { TabPane } = Tabs;

const normalizeData = (data = []) => data.map((i) => {
		const timeDuration = getTimeDuration(get(i, '_source.timestamp'));
		return {
			id: get(i, '_id'),
			operation: {
				method: get(i, '_source.request.method'),
				uri: get(i, '_source.request.uri'),
			},
			classifier: get(i, '_source.classifier', '').toUpperCase(),
			timeTaken: `${timeDuration.time} ${timeDuration.formattedUnit} ago`,
			status: get(i, '_source.response.status'),
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
				const formatted = filter(removeBackslash, o => o !== '');
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
			isFetching: true,
			showDetails: false,
		};
		this.tabKeys.forEach((tabKey) => {
			state[tabKey] = defaultTabState;
		});
		this.state = state;
	}

	componentDidMount() {
		this.fetchRequestLogs();
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
		this.currentRequest = logs && find(logs, o => get(o, '_id') === record.id);
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
	fetchRequestLogs = (from = 0, currentPage = 0, tab = this.state.activeTabKey) => {
		const { appName, plan, pageSize } = this.props;
		// Set loading to true
		this.setState({
			[tab]: {
				...this.state[tab], // eslint-disable-line
				[currentPage]: {
					...this.state[tab][currentPage], // eslint-disable-line
					isLoading: true,
				},
			},
		});
		getRequestLogs(appName, plan, pageSize, from, tab)
			.then((res) => {
				const { logs } = this.state;
				this.setState({
					logs: [...res.hits, ...logs],
					isFetching: false,
					[tab]: {
						currentPage,
						total: res.total,
						[currentPage]: {
							...this.state[tab][currentPage], // eslint-disable-line
							hits: normalizeData(res.hits),
							isLoading: false,
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
								hits: normalizeData(res.hits),
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
					isFetching: false,
				});
			});
	};

	renderTable = (tab) => {
		const { pageSize } = this.props;
		const { currentPage, total } = this.state[tab]; // eslint-disable-line
		const { hits } = this.state[tab][currentPage]; // eslint-disable-line
		return (
			<Table
				css=".ant-table-row { cursor: pointer }"
				rowKey={record => record.id}
				dataSource={hits}
				columns={requestLogs}
				pagination={{
					pageSize,
					total,
					onChange: this.handlePageChange,
				}}
				scroll={{ x: 700 }}
				onRow={record => ({
					onClick: () => this.handleLogClick(record),
				})}
			/>
		);
	};

	render() {
		const { activeTabKey, isFetching, showDetails } = this.state;
		return (
			<Card title="Latest Operations">
				{isFetching ? (
					<Loader />
				) : (
					<React.Fragment>
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
						{showDetails && this.currentRequest && (
							<RequestDetails
								show={showDetails}
								handleCancel={this.handleCancel}
								headers={get(this.currentRequest, '_source.request.headers', {})}
								request={
									parseData(get(this.currentRequest, '_source.request.body'))
									|| {}
								}
								response={
									parseData(get(this.currentRequest, '_source.response.body'))
									|| {}
								}
								time={get(this.currentRequest, '_source.timestamp', '')}
								method={get(this.currentRequest, '_source.request.method', '')}
								url={get(this.currentRequest, '_source.request.uri', '')}
								ip={get(
									this.currentRequest,
									'_source.request.headers.X-Forwarded-For[0]',
								)}
								status={get(this.currentRequest, '_source.response.status', '')}
								processingTime={get(
									this.currentRequest,
									'_source.response.timetaken',
									'',
								)}
							/>
						)}
					</React.Fragment>
				)}
			</Card>
		);
	}
}
RequestLogs.defaultProps = {
	changeUrlOnTabChange: false,
	onTabChange: undefined, // Use this to override the default redirect logic on tab change
	tab: 'all',
	pageSize: 10,
	plan: 'free',
};
RequestLogs.propTypes = {
	tab: PropTypes.string,
	plan: PropTypes.string,
	onTabChange: PropTypes.func,
	appName: PropTypes.string.isRequired,
	changeUrlOnTabChange: PropTypes.bool,
	pageSize: PropTypes.number,
};

const mapStateToProps = state => ({
	appName: get(state, '$getCurrentApp.name'),
	plan: get(getAppPlanByName(state), 'plan'),
});
export default connect(mapStateToProps)(RequestLogs);
