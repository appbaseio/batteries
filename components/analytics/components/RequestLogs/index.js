import React from 'react';
import find from 'lodash/find';
import { connect } from 'react-redux';
import get from 'lodash/get';
import filter from 'lodash/filter';
import {
 Card, Tabs, Table, notification,
} from 'antd';
import PropTypes from 'prop-types';
import { getRequestLogs, requestLogs, getTimeDuration } from '../../utils';
import RequestDetails from './RequestDetails';
import Loader from '../../../shared/Loader/Spinner';

const { TabPane } = Tabs;

const normalizeData = data => data.map((i) => {
		const timeDuration = getTimeDuration(get(i, 'timestamp'));
		return {
			id: get(i, '_id'),
			operation: {
				method: get(i, 'request.method'),
				uri: get(i, 'request.uri'),
			},
			classifier: get(i, 'category', '').toUpperCase(),
			timeTaken: `${timeDuration.time} ${timeDuration.formattedUnit} ago`,
			status: get(i, 'response.code'),
		};
	});
const filterHits = (hits = []) => {
	const successHits = [];
	const errorHits = [];
	const searchHits = [];
	const deleteHits = [];
	hits.forEach((h) => {
		const status = get(h, 'response.code');
		if (get(h, 'category') === 'search') {
			searchHits.push(h);
		}
		if (get(h, 'request.method', '').toLowerCase() === 'delete') {
			deleteHits.push(h);
		}
		if (status >= 200 && status <= 300) {
			successHits.push(h);
		} else {
			errorHits.push(h);
		}
	});
	return {
		successHits,
		deleteHits,
		errorHits,
		searchHits,
	};
};

const parseData = (data = '') => {
	try {
		return JSON.parse(data);
	} catch (e) {
		try {
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
		this.state = {
			activeTabKey: this.tabKeys.includes(tab) ? props.tab : this.tabKeys[0],
			logs: undefined,
			isFetching: true,
			hits: [],
			successHits: [],
			errorHits: [],
			searchHits: [],
			deleteHits: [],
			showDetails: false,
		};
	}

	componentDidMount() {
		const { appName } = this.props;
		getRequestLogs(appName)
			.then((res) => {
				const filteredHits = filterHits(res.logs);
				this.setState({
					logs: res.logs,
					isFetching: false,
					hits: normalizeData(res.logs),
					successHits: normalizeData(filteredHits.successHits),
					errorHits: normalizeData(filteredHits.errorHits),
					searchHits: normalizeData(filteredHits.searchHits),
					deleteHits: normalizeData(filteredHits.deleteHits),
				});
				// Update the request time locally
				setInterval(() => {
					this.setState({
						hits: normalizeData(res.logs),
						successHits: normalizeData(filteredHits.successHits),
						errorHits: normalizeData(filteredHits.errorHits),
						searchHits: normalizeData(filteredHits.searchHits),
						deleteHits: normalizeData(filteredHits.deleteHits),
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
	}

	changeActiveTabKey = (tab) => {
		this.setState(
			{
				activeTabKey: tab,
			},
			() => this.redirectTo(tab),
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

	render() {
		const {
			activeTabKey,
			hits,
			isFetching,
			showDetails,
			successHits,
			errorHits,
			searchHits,
			deleteHits,
		} = this.state;
		const { pageSize } = this.props;
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
								<Table
									css=".ant-table-row { cursor: pointer }"
									rowKey={record => record.id}
									dataSource={hits}
									columns={requestLogs}
									pagination={{
										pageSize,
									}}
									scroll={{ x: 700 }}
									onRow={record => ({
										onClick: () => this.handleLogClick(record),
									})}
								/>
							</TabPane>
							<TabPane tab="SEARCH" key={this.tabKeys[1]}>
								<Table
									css=".ant-table-row { cursor: pointer }"
									rowKey={record => record.id}
									dataSource={searchHits}
									columns={requestLogs}
									pagination={{
										pageSize,
									}}
									onRow={record => ({
										onClick: () => this.handleLogClick(record),
									})}
									scroll={{ x: 700 }}
								/>
							</TabPane>
							<TabPane tab="SUCCESS" key={this.tabKeys[2]}>
								<Table
									css=".ant-table-row { cursor: pointer }"
									rowKey={record => record.id}
									dataSource={successHits}
									columns={requestLogs}
									pagination={{
										pageSize,
									}}
									onRow={record => ({
										onClick: () => this.handleLogClick(record),
									})}
									scroll={{ x: 700 }}
								/>
							</TabPane>
							<TabPane tab="DELETE" key={this.tabKeys[3]}>
								<Table
									css=".ant-table-row { cursor: pointer }"
									rowKey={record => record.id}
									dataSource={deleteHits}
									columns={requestLogs}
									pagination={{
										pageSize,
									}}
									onRow={record => ({
										onClick: () => this.handleLogClick(record),
									})}
									scroll={{ x: 700 }}
								/>
							</TabPane>
							<TabPane tab="ERROR" key={this.tabKeys[4]}>
								<Table
									css=".ant-table-row { cursor: pointer }"
									rowKey={record => record.id}
									dataSource={errorHits}
									columns={requestLogs}
									pagination={{
										pageSize,
									}}
									onRow={record => ({
										onClick: () => this.handleLogClick(record),
									})}
									scroll={{ x: 700 }}
								/>
							</TabPane>
						</Tabs>
						{showDetails && this.currentRequest && (
							<RequestDetails
								show={showDetails}
								handleCancel={this.handleCancel}
								headers={get(this.currentRequest, 'request.header', {})}
								request={parseData(get(this.currentRequest, 'request.body')) || {}}
								response={
									parseData(get(this.currentRequest, 'response.body')) || {}
								}
								time={get(this.currentRequest, 'timestamp', '')}
								method={get(this.currentRequest, 'request.method', '')}
								url={get(this.currentRequest, 'request.uri', '')}
								ip={get(this.currentRequest, 'request.header.X-Forwarded-For[0]')}
								status={get(this.currentRequest, 'response.code', '')}
								processingTime={get(this.currentRequest, 'response.timetaken', '')}
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
};
RequestLogs.propTypes = {
	tab: PropTypes.string,
	onTabChange: PropTypes.func,
	appName: PropTypes.string.isRequired,
	changeUrlOnTabChange: PropTypes.bool,
	pageSize: PropTypes.number,
};

const mapStateToProps = state => ({
	appName: get(state, '$getCurrentApp.name'),
});
export default connect(mapStateToProps)(RequestLogs);
