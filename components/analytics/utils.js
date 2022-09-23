import React from 'react';
import { css } from 'emotion';
import moment from 'moment';
import { Button, message } from 'antd';
import { Link } from 'react-router-dom';
import get from 'lodash/get';
// import mockProfile from './components/mockProfile';
import { doGet, doPut } from '../../utils/requestService';
import Flex from '../shared/Flex';
import { getURL } from '../../../constants/config';
import { getUrlParams } from '../../../utils/helper';
import { versionCompare } from '../../utils/helpers';

export const ANALYTICS_ROOT_FILTER_ID = 'analytics_page';

let lastIndex = 0;
const updateIndex = () => {
	lastIndex += 1;
	return lastIndex;
};

const requestOpt = css`
	color: #00ff88;
	text-transform: uppercase;
	font-weight: 500;
	padding: 5px 10px;
	border-radius: 3px;
	border: solid 1px #00ff88;
`;

export const getQueryParams = (paramConfig, arcVersion, shouldApplyDateFilters = true) => {
	let queryString = '';
	let paramObj = paramConfig;
	const versionComparison = versionCompare(arcVersion, '7.40.1');
	// Apply new params to only for arc versions >= 7.40.1
	if ([0, 1].includes(versionComparison) && shouldApplyDateFilters) {
		const defaultDateRange = {
			from: moment().subtract(30, 'days').unix(),
			to: moment().unix(),
		};
		if (!paramObj) {
			paramObj = {};
		}
		if (!paramObj.from) {
			paramObj.from_timestamp = defaultDateRange.from;
		} else {
			paramObj.from_timestamp = Math.ceil(new Date(paramObj.from).getTime() / 1000);
		}
		if (!paramObj.to) {
			paramObj.to_timestamp = defaultDateRange.to;
		} else {
			paramObj.to_timestamp =
				Math.ceil(new Date(paramObj.to).getTime() / 1000) + 24 * 60 * 60 - 1; // end of day
		}
		paramObj.time_zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
	}

	if (paramObj) {
		Object.keys(paramObj).forEach((o, i) => {
			if (i === 0) {
				queryString = `?${o}=${encodeURIComponent(paramObj[o])}`;
			} else {
				queryString += `&${o}=${encodeURIComponent(paramObj[o])}`;
			}
		});
	}
	return queryString;
};

export const getStringifiedJSON = (data) => {
	try {
		return JSON.stringify(data, null, 2);
	} catch (e) {
		return data;
	}
};

const replaySearch = [
	{
		title: 'Replay Search',
		key: 'search_state',
		width: 125,
		render: (item) => (
			<div css="text-align: center">
				<Button
					disabled={!item.search_state}
					icon="redo"
					onClick={() => item.handleReplaySearch(item.search_state)}
				/>
			</div>
		),
	},
];

const replaySearchFake = [
	{
		title: '',
		key: 'search_state',
		width: 125,
	},
];

export const getTimeDuration = (time) => {
	const timeInMs = moment.duration(moment().diff(time)).asMilliseconds();
	if (timeInMs >= 24 * 60 * 60 * 1000) {
		const timeD = parseInt(timeInMs / (24 * 60 * 60 * 1000), 10);
		return {
			unit: 'day',
			time: timeD,
			formattedUnit: timeD > 1 ? 'days' : 'day',
		};
	}
	if (timeInMs >= 60 * 60 * 1000) {
		const timeH = parseInt(timeInMs / (60 * 60 * 1000), 10);
		return {
			unit: 'hr',
			time: timeH,
			formattedUnit: timeH > 1 ? 'hrs' : 'hr',
		};
	}
	if (timeInMs >= 60 * 1000) {
		const timeM = parseInt(timeInMs / (60 * 1000), 10);
		return {
			unit: 'min',
			time: timeM,
			formattedUnit: timeM > 1 ? 'mins' : 'min',
		};
	}
	if (timeInMs >= 1000) {
		const timeS = parseInt(timeInMs / 1000, 10);
		return {
			unit: 'sec',
			time: timeS,
			formattedUnit: timeS > 1 ? 'secs' : 'sec',
		};
	}
	return {
		unit: 'ms',
		time: parseInt(timeInMs / 1000, 10),
	};
};

export function getFormattedTime(time = 0) {
	const secNum = parseInt(time, 10); // don't forget the second param
	let hours = Math.floor(secNum / 3600);
	let minutes = Math.floor((secNum - hours * 3600) / 60);
	let seconds = secNum - hours * 3600 - minutes * 60;

	if (hours < 10) {
		hours = `0${hours}`;
	}
	if (minutes < 10) {
		minutes = `0${minutes}`;
	}
	if (seconds < 10) {
		seconds = `0${seconds}`;
	}
	return `${hours}:${minutes}:${seconds}`;
}

export const parseTimeDuration = (time) => {
	const timeInMs = time * 1000;
	if (timeInMs >= 24 * 60 * 60 * 1000) {
		const timeD = parseInt(timeInMs / (24 * 60 * 60 * 1000), 10);
		return {
			unit: 'day',
			time: timeD,
			formattedUnit: timeD > 1 ? 'days' : 'day',
		};
	}
	if (timeInMs >= 60 * 60 * 1000) {
		const timeH = parseInt(timeInMs / (60 * 60 * 1000), 10);
		return {
			unit: 'hr',
			time: timeH,
			formattedUnit: timeH > 1 ? 'hrs' : 'hr',
		};
	}
	if (timeInMs >= 60 * 1000) {
		const timeM = parseInt(timeInMs / (60 * 1000), 10);
		return {
			unit: 'min',
			time: timeM,
			formattedUnit: timeM > 1 ? 'mins' : 'min',
		};
	}
	if (timeInMs >= 1000) {
		const timeS = parseInt(timeInMs / 1000, 10);
		return {
			unit: 'sec',
			time: timeS,
			formattedUnit: timeS > 1 ? 'secs' : 'sec',
		};
	}
	return {
		unit: 'ms',
		time: parseInt(timeInMs / 1000, 10),
	};
};

export const popularFiltersCol = (plan, displayReplaySearch, isSubTable = false) => {
	const defaults = [
		...(isSubTable
			? [
					{
						title: 'Values',
						render: (item) => (
							<React.Fragment>
								<strong>{item.value}</strong>
							</React.Fragment>
						),
						key: `pf-values${updateIndex()}`,
					},
			  ]
			: [
					{
						title: 'Filters',
						render: (item) => (
							<React.Fragment>
								<strong>{item.key}</strong>
								{item.value ? ` ${item.value}` : ''}
							</React.Fragment>
						),
						key: `pf-filters${updateIndex()}`,
					},
			  ]),
		{
			title: 'Selections',
			dataIndex: 'count',
			key: `pf-count${updateIndex()}`,
		},
	];
	if (!plan || (plan !== 'growth' && plan !== 'bootstrap')) {
		return defaults;
	}
	return [...defaults, ...(displayReplaySearch ? replaySearch : [])];
};
export const popularResultsCol = (plan) => {
	const defaults = [
		{
			title: 'Results',
			dataIndex: 'key',
			key: `pr-results${updateIndex()}`,
		},
		{
			title: 'Impressions',
			dataIndex: 'count',
			key: `pr-count${updateIndex()}`,
		},
	];
	if (!plan || (plan !== 'growth' && plan !== 'bootstrap')) {
		return defaults;
	}
	return defaults;
};
export const defaultColumns = (plan, redirectToQuery = false) => {
	const defaults = [
		{
			title: 'Search Terms',
			dataIndex: 'key',
			key: `search-term${updateIndex()}`,
			...(redirectToQuery
				? {
						render: (key) => (
							<Link to={`popular-searches/query-overview/${key}`}>{key}</Link>
						),
				  }
				: null),
		},
		{
			title: 'Total Queries',
			dataIndex: 'count',
			key: `count${updateIndex()}`,
		},
	];
	if (!plan || plan !== 'growth') {
		return defaults;
	}
	return [
		...defaults,
		{
			title: 'Click Rate',
			dataIndex: 'click_rate',
			render: (i) => `${i.toFixed(2)}%`,
			key: `clickrate${updateIndex()}`,
		},
	];
};

export const topClicksColumns = (ViewSource) => [
	{
		title: 'Results',
		dataIndex: 'key',
		key: `top-click${updateIndex()}`,
	},
	{
		title: 'Clicks',
		render: (item) => (
			<span>
				<b>{item.count}</b>
				{item.click_type ? ` (${item.click_type})` : ''}
			</span>
		),
		width: 150,
		key: `top-click-count${updateIndex()}`,
	},
	{
		title: 'Source',
		key: `top-results-source${updateIndex()}`,
		render: (item) => <ViewSource docID={item.key} index={item.index} />,
	},
];

export const topResultsColumns = (ViewSource) => [
	{
		title: 'Results',
		dataIndex: 'key',
		key: `top-results-key${updateIndex()}`,
	},
	{
		title: 'Impressions',
		dataIndex: 'count',
		width: 150,
		key: `top-results-count${updateIndex()}`,
	},
	{
		title: 'Source',
		key: `top-results-source${updateIndex()}`,
		render: (item) => <ViewSource docID={item.key} index={item.index} />,
	},
];

export const popularSearchesCol = (plan, displayReplaySearch) => {
	if (plan !== 'growth' && plan !== 'bootstrap') {
		return defaultColumns();
	}
	return [...defaultColumns(), ...(displayReplaySearch ? replaySearch : [])];
};

export const noResultsFull = (plan, displayReplaySearch) => {
	if (plan !== 'growth' && plan !== 'bootstrap') {
		return defaultColumns();
	}
	return [...defaultColumns(), ...(displayReplaySearch ? replaySearch : [])];
};

export const ConvertToCSV = (objArray) => {
	const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
	let str = '';

	for (let i = 0; i < array.length; i += 1) {
		let line = '';
		// eslint-disable-next-line
		for (var index in array[i]) {
			if (line !== '') line += ',';
			line += array[i][index];
		}

		str += `${line}\r\n`;
	}

	return str;
};
export const exportCSVFile = (headers, items, fileTitle) => {
	if (headers) {
		items.unshift(headers);
	}

	// Convert Object to JSON
	const jsonObject = JSON.stringify(items);

	const csv = ConvertToCSV(jsonObject);

	const exportedFilenmae = fileTitle ? `${fileTitle}.csv` : 'export.csv';

	const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
	if (navigator.msSaveBlob) {
		// IE 10+
		navigator.msSaveBlob(blob, exportedFilenmae);
	} else {
		const link = document.createElement('a');
		if (link.download !== undefined) {
			// feature detection
			// Browsers that support HTML5 download attribute
			const url = URL.createObjectURL(blob);
			link.setAttribute('href', url);
			link.setAttribute('download', exportedFilenmae);
			link.style.visibility = 'hidden';
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		}
	}
};

export const popularSearchesFull = (plan, displayReplaySearch) => {
	if (!plan || plan !== 'growth') {
		return [
			...defaultColumns(plan, true),
			...(plan === 'bootstrap' && displayReplaySearch ? replaySearch : []),
		];
	}
	return [
		...defaultColumns('free', true),
		{
			title: 'Clicks',
			dataIndex: 'clicks',
			key: `ps-clicks${updateIndex()}`,
		},
		{
			title: 'Click Rate',
			dataIndex: 'click_rate',
			render: (i) => `${i.toFixed(2)}%`,
			key: `ps-clickrate${updateIndex()}`,
		},
		{
			title: 'Avg Click Position',
			dataIndex: 'click_position',
			render: (i) => i.toFixed(2),
			key: `ps-clickposition${updateIndex()}`,
		},
		{
			title: 'Conversion Rate',
			dataIndex: 'conversion_rate',
			render: (i) => `${i.toFixed(2)}%`,
			key: `ps-conversionrate${updateIndex()}`,
		},
		...(displayReplaySearch ? replaySearch : []),
	];
};

export const popularResultsFull = (plan, ViewSource) => {
	return [
		...popularResultsCol('free'),
		{
			title: 'Clicks',
			dataIndex: 'clicks',
			key: `pr-clicks${updateIndex()}`,
		},
		{
			title: 'Click Rate',
			dataIndex: 'click_rate',
			render: (i) => `${i.toFixed(2)}%`,
			key: `pr-clickrate${updateIndex()}`,
		},
		{
			title: 'Click Position',
			dataIndex: 'click_position',
			render: (item) => (
				<div css="overflow-y: scroll; max-height:150px;">{item.toFixed(2) || '-'}</div>
			),
			key: `pr-clickposition${updateIndex()}`,
		},
		{
			title: 'Conversion Rate',
			dataIndex: 'conversion_rate',
			render: (i) => `${i.toFixed(2)}%`,
			key: `pr-conversionrate${updateIndex()}`,
		},
		{
			title: 'Source',
			key: `pr-source${updateIndex()}`,
			render: (item) => <ViewSource docID={item.key} index={item.index} />,
		},
	];
};
export const popularFiltersFull = (plan, displayReplaySearch, isSubTable) => {
	if (plan !== 'growth') {
		return [
			...popularFiltersCol(plan, false, isSubTable),
			...(plan === 'bootstrap' && displayReplaySearch ? replaySearch : []),
		];
	}
	let replaySearchCol = [];
	if (displayReplaySearch) {
		if (isSubTable) {
			replaySearchCol = replaySearch;
		} else {
			replaySearchCol = replaySearchFake;
		}
	}
	return [
		...popularFiltersCol('free', false, isSubTable),
		{
			title: 'Clicks',
			dataIndex: 'clicks',
			key: `pf-clicks${updateIndex()}`,
		},
		{
			title: 'Click Rate',
			dataIndex: 'click_rate',
			render: (i) => `${i.toFixed(2)}%`,
			key: `pf-clickrate${updateIndex()}`,
		},
		{
			title: 'Click Position',
			dataIndex: 'click_position',
			key: `pf-clickposition${updateIndex()}`,
			render: (item) => (
				<div css="overflow-y: scroll; max-height:150px;">{item.toFixed(2) || '-'}</div>
			),
		},
		{
			title: 'Conversion Rate',
			dataIndex: 'conversion_rate',
			render: (i) => `${i.toFixed(2)}%`,
			key: `pf-conversionrate${updateIndex()}`,
		},
		...replaySearchCol,
	];
};

export const getRequestLogsColumns = (displaySearchLogs, isPipeMode = false) => [
	{
		title: isPipeMode ? 'Route' : 'Operation',
		dataIndex: 'operation',
		render: (operation) => {
			return (
				<div>
					<Flex>
						<div css="width: 100px;margin-top: 5px;word-break: keep-all;">
							<span css={requestOpt}>{operation.method}</span>
						</div>
						<div css="margin-left: 5px;">
							<span css="color: #74A2FF;">
								{operation[isPipeMode ? 'route' : 'uri']}
							</span>
						</div>
					</Flex>
				</div>
			);
		},
		key: `operation${updateIndex()}`,
	},
	...(isPipeMode
		? [
				{
					title: 'Latency (in ms)',
					width: '150px',
					key: `type${updateIndex()}`,
					dataIndex: 'took',
				},
		  ]
		: []),
	...(displaySearchLogs
		? [
				{
					title: 'Latency (in ms)',
					width: '150px',
					key: `type${updateIndex()}`,
					dataIndex: 'took',
				},
		  ]
		: [
				{
					title: 'Type',
					dataIndex: 'classifier',
					width: '100px',
					key: `type${updateIndex()}`,
				},
		  ]),
	{
		title: 'Time',
		dataIndex: 'timeTaken',
		width: '140px',
		key: `time${updateIndex()}`,
	},
	{
		title: 'Status',
		dataIndex: 'status',
		width: '100px',
		key: `status${updateIndex()}`,
	},
];

export const getAuthToken = () => {
	let token = null;
	try {
		token = localStorage.getItem('authToken');
	} catch (e) {
		console.error(e);
	}
	return token;
};

export const getApp = (app) => {
	if (window.location.pathname.startsWith('/cluster/')) return '';
	return `${app}/`;
};

/**
 * Get the analytics
 * @param {string} appName
 */
export function getAnalytics(appName, filters, arcVersion) {
	return doGet(
		`${getURL()}/_analytics/${getApp(appName)}advanced${getQueryParams(
			{
				...filters,
			},
			arcVersion,
		)}`,
	);
}
/**
 * Get the search latency
 * @param {string} appName
 */
export function getSearchLatency(appName, filters, arcVersion) {
	return doGet(
		`${getURL()}/_analytics/${getApp(appName)}latency${getQueryParams(
			filters,
			arcVersion,
			false,
		)}`,
	);
}

/**
 * Get the query overview
 * @param {string} appName
 * @param {string} filters
 * @param {string} query
 */
export function getQueryOverview(appName, filters, query, arcVersion) {
	return doGet(
		`${getURL()}/_analytics/${getApp(appName)}query-overview${getQueryParams(
			{
				size: 100,
				...filters,
				...(query && query !== '<empty_query>' ? { query } : null),
			},
			arcVersion,
		)}`,
	);
}
/**
 * Get the geo distribution
 * @param {string} appName
 */
export function getGeoDistribution(appName, filters, arcVersion) {
	return doGet(
		`${getURL()}/_analytics/${getApp(appName)}geo-distribution${getQueryParams(
			filters,
			arcVersion,
		)}`,
	);
}
/**
 * Get the search latency
 * @param {string} appName
 */
export function getAnalyticsSummary(appName, filters, arcVersion) {
	return doGet(
		`${getURL()}/_analytics/${getApp(appName)}summary${getQueryParams(filters, arcVersion)}`,
	);
}
/**
 * Get the popular seraches
 * @param {string} appName
 */
// eslint-disable-next-line
export function getPopularSearches(
	appName,
	clickanalytics = true,
	size = 100,
	filters,
	arcVersion,
) {
	return doGet(
		`${getURL()}/_analytics/${getApp(appName)}popular-searches${getQueryParams(
			{
				size,
				click_analytics: clickanalytics,
				...filters,
			},
			arcVersion,
		)}`,
	);
}
/**
 * Get the no results seraches
 * @param {string} appName
 */
export function getNoResultSearches(appName, size = 100, filters, arcVersion) {
	return doGet(
		`${getURL()}/_analytics/${getApp(appName)}no-result-searches${getQueryParams(
			{
				size,
				...filters,
			},
			arcVersion,
		)}`,
	);
}
// eslint-disable-next-line
export function getPopularResults(appName, clickAnalytics = true, size = 100, filters, arcVersion) {
	return doGet(
		`${getURL()}/_analytics/${getApp(appName)}popular-results${getQueryParams(
			{
				size,
				show_global: true,
				click_analytics: clickAnalytics,
				...filters,
			},
			arcVersion,
		)}`,
	);
}
/**
 * Get the request distribution
 * @param {string} appName
 */
export function getRequestDistribution(appName, filters, arcVersion) {
	const ACC_API = getURL();
	return doGet(
		`${ACC_API}/_analytics/${getApp(appName)}request-distribution${getQueryParams(
			filters,
			arcVersion,
		)}`,
	);
}
// eslint-disable-next-line
export function getPopularFilters(appName, clickAnalytics = true, size = 100, filters, arcVersion) {
	return doGet(
		`${getURL()}/_analytics/${getApp(appName)}popular-filters${getQueryParams(
			{
				size,
				click_analytics: clickAnalytics,
				...filters,
			},
			arcVersion,
		)}`,
	);
}

const validTabFilters = ['search', 'success', 'error', 'delete', 'suggestion', 'index'];

// To fetch the logs
export function getRequestLogs(
	appName,
	queryParams = {
		size: 10,
		from: 0,
		filter: undefined,
		startDate: undefined,
		endDate: undefined,
		startLatency: undefined,
		endLatency: undefined,
	},
	isSearchLogs = false,
	arcVersion,
) {
	return doGet(
		`${getURL()}/${getApp(appName)}${isSearchLogs ? '_logs/search' : '_logs'}${getQueryParams(
			// remove undefined
			JSON.parse(
				JSON.stringify({
					size: queryParams.size,
					from: queryParams.from,
					start_date: queryParams.startDate,
					end_date: queryParams.endDate,
					start_latency: queryParams.startLatency,
					end_latency: queryParams.endLatency,
					...(queryParams.filter &&
						validTabFilters.includes(queryParams.filter) && {
							filter: queryParams.filter,
						}),
				}),
			),
			arcVersion,
			false,
		)}`,
	);
}

// to fetch the request log details by log id
export function getRequestLogDetails(logId) {
	return doGet(`${getURL()}/_log/${logId}?verbose=false`);
}

// To fetch the pipeline logs
export function getPipelineLogs(
	pipelineId,
	queryParams = {
		size: 10,
		from: 0,
		startDate: undefined,
		endDate: undefined,
		category: '',
	},
	arcVersion,
) {
	return doGet(
		`${getURL()}/_pipeline/${pipelineId}/logs${getQueryParams(
			// remove undefined
			JSON.parse(
				JSON.stringify({
					size: queryParams.size,
					from: queryParams.from,
					...(queryParams.category &&
						validTabFilters.includes(queryParams.category) && {
							category: queryParams.category,
						}),
				}),
			),
			arcVersion,
			false,
		)}`,
	);
}

// to fetch the pipeline log details
export function getPipelineLogDetails(logId) {
	return doGet(`${getURL()}/_pipelines/log/${logId}?verbose=true`);
}
/**
 * Get the analytics insights
 * @param {string} appName
 */
export function getAnalyticsInsights(appName) {
	const ACC_API = getURL();
	return doGet(`${ACC_API}/_analytics/${getApp(appName)}insights`);
}

/**
 * Update the analytics insights status
 * @param {string} appName
 * @param {string} id
 * @param {string} status
 */
export function updateAnalyticsInsights({ id, status, appName }) {
	const ACC_API = getURL();
	return doPut(`${ACC_API}/_analytics/${getApp(appName)}insight-status`, {
		id,
		status,
	});
}

// Banner messages
export const bannerMessagesAnalytics = {
	free: {
		title: 'Unlock the ROI impact of your search',
		description:
			'Get a paid plan to see actionable analytics on search volume, popular searches, no results, track clicks and conversions.',
		buttonText: 'Upgrade Now',
		href: 'billing',
	},
	bootstrap: {
		title: 'Get richer analytics on clicks and conversions',
		description:
			'By upgrading to the Growth plan, you can track clicks and conversions, get a 30-day retention on analytics along with being able to view actionable analytics on popular filters, popular results, search latency and geo distribution.',
		buttonText: 'Upgrade To Growth',
		href: 'billing',
	},
	growth: {
		title: 'Learn how to track click analytics',
		description:
			'See our docs on how to track search, filters, click events, conversions and add your own custom events.',
		buttonText: 'Read Docs',
		href: 'https://docs.appbase.io',
	},
};
export const tabMappings = {
	popularSearches: 'popular-searches',
	noResultSearches: 'no-result-searches',
	popularResults: 'popular-results',
	popularFilters: 'popular-filters',
	requestLogs: 'request-logs',
	analytics: 'analytics',
};
export const getActiveKeyByRoutes = (tab) => {
	let activeKey = '';
	Object.keys(tabMappings).every((k) => {
		if (tabMappings[k] === tab) {
			activeKey = k;
			return false;
		}
		return true;
	});
	return activeKey;
};

export const applyFilterParams = ({ filters = {}, callback, filterId, applyFilter }) => {
	const urlParams = getUrlParams(window.location.search);
	if (
		urlParams &&
		filters &&
		urlParams.from &&
		urlParams.to &&
		filters.from !== urlParams.from &&
		filters.to !== urlParams.to
	) {
		applyFilter(filterId, 'from', urlParams.from);
		applyFilter(filterId, 'to', urlParams.to);
		return;
	}
	if (callback) {
		callback();
	}
};

export const dateRanges = {
	'Last 30 minutes': {
		from: moment().subtract(30, 'minute').format(),
		to: moment().format(),
	},
	'This week': {
		from: moment().startOf('week').format('YYYY/MM/DD'),
		to: moment().format('YYYY/MM/DD'),
	},
	'Last Week': {
		from: moment().subtract(1, 'weeks').startOf('week').format('YYYY/MM/DD'),
		to: moment().subtract(1, 'weeks').endOf('week').format('YYYY/MM/DD'),
	},
	'This Month': {
		from: moment().startOf('month').format('YYYY/MM/DD'),
		to: moment().format('YYYY/MM/DD'),
	},

	'Last Month': {
		from: moment().subtract(1, 'months').startOf('month').format('YYYY/MM/DD'),
		to: moment().subtract(1, 'months').endOf('month').format('YYYY/MM/DD'),
	},

	'Last day': {
		from: moment().subtract(1, 'days').format('YYYY/MM/DD'),
		to: moment().format('YYYY/MM/DD'),
	},

	'Last 7 days': {
		from: moment().subtract(7, 'days').format('YYYY/MM/DD'),
		to: moment().format('YYYY/MM/DD'),
	},
	'Last 30 days': {
		from: moment().subtract(30, 'days').format('YYYY/MM/DD'),
		to: moment().format('YYYY/MM/DD'),
	},
	'Last 60 days': {
		from: moment().subtract(60, 'days').format('YYYY/MM/DD'),
		to: moment().format('YYYY/MM/DD'),
	},
	'Last 90 days': {
		from: moment().subtract(90, 'days').format('YYYY/MM/DD'),
		to: moment().format('YYYY/MM/DD'),
	},
};

export const requestLogsDateRanges = {
	Today: {
		from: moment().format('YYYY/MM/DD'),
		to: moment().format('YYYY/MM/DD'),
	},
	Yesterday: {
		from: moment().subtract(1, 'day').format('YYYY/MM/DD'),
		to: moment().subtract(1, 'day').format('YYYY/MM/DD'),
	},
	...dateRanges,
};

export const dateRangesColumn = (dates = dateRanges, columnItems = 6) =>
	Object.keys(dates).reduce((agg, item, index) => {
		const columnIndex = `col_${Math.floor(index / columnItems)}`;
		return {
			...agg,
			[columnIndex]: {
				...get(agg, columnIndex, {}),
				[item]: dates[item],
			},
		};
	}, {});

export const recentSearchesFull = () => {
	return defaultColumns();
};

export const recentResultsFull = (ViewSource) => {
	return [
		{
			title: 'Results',
			dataIndex: 'key',
			key: `rr-results${updateIndex()}`,
		},
		{
			title: 'Impressions',
			dataIndex: 'count',
			key: `rr-count${updateIndex()}`,
		},
		{
			title: 'Source',
			key: `rr-source${updateIndex()}`,
			render: (item) => <ViewSource docID={item.key} index={item.index} />,
		},
	];
};

/**
 * Get the recent seraches
 * @param {string} appName
 */
export function getRecentSearches(appName, filters, arcVersion) {
	const ACC_API = getURL();
	return doGet(
		`${ACC_API}/_analytics/${getApp(appName)}recent-searches${getQueryParams(
			{
				size: 100,
				show_global: true,
				...filters,
			},
			arcVersion,
		)}`,
	);
}
/**
 * Get the no recent results
 * @param {string} appName
 */
export function getRecentResults(appName, filters, arcVersion) {
	const ACC_API = getURL();
	return doGet(
		`${ACC_API}/_analytics/${getApp(appName)}recent-results${getQueryParams(
			{
				size: 100,
				show_global: true,
				...filters,
			},
			arcVersion,
		)}`,
	);
}
export function inViewPort(id) {
	if (window && document) {
		const element = document.getElementById(id);
		if (element) {
			const rect = element.getBoundingClientRect();
			return (
				rect.top >= 0 &&
				rect.left >= 0 &&
				rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
				rect.right <= (window.innerWidth || document.documentElement.clientWidth)
			);
		}
		return false;
	}
	return true;
}

export function convertToCURL(url, method, headers, requestBody) {
	const headersToIgnore = [
		'Content-Length',
		'Sec-Ch-Ua',
		'Sec-Ch-Ua-Mobile',
		'Sec-Fetch-Dest',
		'User-Agent',
	];
	try {
		let cURlCommand = `curl -X ${method} ${getURL()}${url}`;
		Object.keys(headers).forEach((key) => {
			if (headersToIgnore.indexOf(key) < 0 && !key.startsWith('X-')) {
				cURlCommand += ` -H '${key}: ${headers[key][0]}'`;
			}
		});
		if (method !== 'GET' && method !== 'DELETE') {
			cURlCommand += ` -d '${
				isValidJSONFormat(requestBody) ? JSON.stringify(requestBody) : requestBody
			}'`;
		}
		navigator.clipboard.writeText(cURlCommand);
		message.success('Request copied to clipboard');
	} catch (e) {
		message.error("Couldn't copy request. Try again");
	}
}

export function replayRequest(url, method, headers, requestBody) {
	const headersToIgnore = [
		'Content-Length',
		'Sec-Ch-Ua',
		'Sec-Ch-Ua-Mobile',
		'Sec-Fetch-Dest',
		'User-Agent',
		'Pragma',
		'Sec-Fetch-Mode',
		'Sec-Fetch-Site',
		'Via',
	];
	const updatedHeaders = {};
	Object.keys(headers).forEach((key) => {
		if (headersToIgnore.indexOf(key) < 0 && !key.startsWith('X-')) {
			// eslint-disable-next-line
			updatedHeaders[key] = headers[key][0];
		}
	});

	const updatedRequestBody =
		requestBody && isValidJSONFormat(requestBody) ? JSON.stringify(requestBody) : requestBody;
	const body = method === 'GET' || method === 'DELETE' ? null : updatedRequestBody;
	return new Promise((resolve, reject) => {
		fetch(`${getURL()}${url}`, {
			method,
			headers: updatedHeaders,
			body,
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.error) {
					message.error(res.error.message || 'Unable to replay the request. Try again');
				} else {
					message.success('Request replayed successfully. Reload the view to see it');
				}
				resolve(res);
			})
			.catch((e) => {
				message.error('Unable to replay the request. Try again');
				reject(e);
			});
	});
}

export const isValidJSONFormat = (input) => {
	if (typeof input === 'string') {
		try {
			JSON.parse(input);
			return true;
		} catch (error) {
			return false;
		}
	} else {
		try {
			JSON.stringify(input);
			return true;
		} catch (error) {
			return false;
		}
	}
};

export const getPipelinesAvgTimeTakenInsights = (
	pipelineId,
	queryParams = {
		from_timestamp: undefined,
		to_timestamp: undefined,
	},
) => {
	const authToken = getAuthToken();
	const ACC_API = getURL();

	return doGet(
		`${ACC_API}/_analytics/pipeline/${pipelineId}/time-taken${getQueryParams(
			// remove undefined
			JSON.parse(
				JSON.stringify({
					...queryParams,
				}),
			),
			undefined,
			false,
		)}`,
		{
			'Content-Type': 'application/json',
			Authorization: `Basic ${authToken}`,
		},
	);
};

export const getPipelinesErrorRateInsights = (
	pipelineId,
	queryParams = {
		from_timestamp: undefined,
		to_timestamp: undefined,
	},
) => {
	const authToken = getAuthToken();
	const ACC_API = getURL();

	return doGet(
		`${ACC_API}/_analytics/pipeline/${pipelineId}/error-rate${getQueryParams(
			// remove undefined
			JSON.parse(
				JSON.stringify({
					...queryParams,
				}),
			),
			undefined,
			false,
		)}`,
		{
			'Content-Type': 'application/json',
			Authorization: `Basic ${authToken}`,
		},
	);
};

export const getPipelinesAvgTimeTakenPerVersion = (
	pipelineId,
	versionId,
	queryParams = {
		from_timestamp: undefined,
		to_timestamp: undefined,
	},
) => {
	const authToken = getAuthToken();
	const ACC_API = getURL();

	return doGet(
		`${ACC_API}/_analytics/pipeline/${pipelineId}/version/${versionId}/time-taken${getQueryParams(
			// remove undefined
			JSON.parse(
				JSON.stringify({
					...queryParams,
				}),
			),
			undefined,
			false,
		)}`,
		{
			'Content-Type': 'application/json',
			Authorization: `Basic ${authToken}`,
		},
	);
};
export const getPipelinesErrorRateInsightsPerVersion = (
	pipelineId,
	versionId,
	queryParams = {
		from_timestamp: undefined,
		to_timestamp: undefined,
	},
) => {
	const authToken = getAuthToken();
	const ACC_API = getURL();

	return doGet(
		`${ACC_API}/_analytics/pipeline/${pipelineId}/version/${versionId}/error-rate${getQueryParams(
			// remove undefined
			JSON.parse(
				JSON.stringify({
					...queryParams,
				}),
			),
			undefined,
			false,
		)}`,
		{
			'Content-Type': 'application/json',
			Authorization: `Basic ${authToken}`,
		},
	);
};
