import React from 'react';
import { css } from 'emotion';
import moment from 'moment';
import { Button } from 'antd';
// import mockProfile from './components/mockProfile';
import { doGet } from '../../utils/requestService';
import Flex from '../shared/Flex';
import { getURL } from '../../../constants/config';

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
export const getQueryParams = (paramObj) => {
	let queryString = '';
	if (paramObj) {
		Object.keys(paramObj).forEach((o, i) => {
			if (i === 0) {
				queryString = `?${o}=${paramObj[o]}`;
			} else {
				queryString += `&${o}=${paramObj[o]}`;
			}
		});
	}
	return queryString;
};
const replaySearch = [
	{
		title: 'Replay Search',
		key: 'search_state',
		width: 125,
		render: item => (
			<div css="text-align: center">
				<Button disabled={!item.search_state} icon="redo" onClick={() => item.handleReplaySearch(item.search_state)} />
			</div>
		),
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
export const popularFiltersCol = (plan, displayReplaySearch) => {
	const defaults = [
		{
			title: 'Filters',
			render: item => (
				<React.Fragment>
					<strong>{item.key}</strong>
					{` ${item.value}`}
				</React.Fragment>
			),
			key: `pf-filters${updateIndex()}`,
		},
		{
			title: 'Impressions',
			dataIndex: 'count',
			key: `pf-count${updateIndex()}`,
		},
	];
	if (!plan || (plan !== 'growth' && plan !== 'bootstrap')) {
		return defaults;
	}
	return [...defaults, ...(displayReplaySearch ? replaySearch : [])];
};
export const popularResultsCol = (plan, displayReplaySearch) => {
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
	return [...defaults, ...(displayReplaySearch ? replaySearch : [])];
};
export const defaultColumns = (plan) => {
	const defaults = [
		{
			title: 'Search Terms',
			dataIndex: 'key',
			key: `search-term${updateIndex()}`,
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
			render: i => i.toFixed(2),
			key: `clickrate${updateIndex()}`,
		},
	];
};

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
			...defaultColumns(plan),
			...(plan === 'bootstrap' && displayReplaySearch ? replaySearch : []),
		];
	}
	return [
		...defaultColumns('free'),
		{
			title: 'Clicks',
			dataIndex: 'clicks',
			key: `ps-clicks${updateIndex()}`,
		},
		{
			title: 'Avg Click Position',
			dataIndex: 'click_position',
			render: i => i.toFixed(2),
			key: `ps-clickposition${updateIndex()}`,
		},
		{
			title: 'Click Rate',
			dataIndex: 'click_rate',
			render: i => i.toFixed(2),
			key: `ps-clickrate${updateIndex()}`,
		},
		{
			title: 'Conversion Rate',
			dataIndex: 'conversion_rate',
			key: `ps-conversionrate${updateIndex()}`,
		},
		...(displayReplaySearch ? replaySearch : []),
	];
};

export const popularResultsFull = (plan, displayReplaySearch) => {
	if (plan !== 'growth') {
		return [
			...popularResultsCol(plan),
			{
				title: 'Source',
				dataIndex: 'source',
				key: `pr-source${updateIndex()}`,
				width: '30%',
				style: {
					maxWidth: 250,
				},
				render: item => <div css="overflow-y: scroll; height:150px;">{item}</div>,
			},
			...(plan === 'bootstrap' && displayReplaySearch ? replaySearch : []),
		];
	}
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
			render: i => i.toFixed(2),
			key: `pr-clickrate${updateIndex()}`,
		},
		{
			title: 'Click Position',
			dataIndex: 'click_position',
			render: item => <div css="overflow-y: scroll; max-height:150px;">{item.toFixed(2) || '-'}</div>,
			key: `pr-clickposition${updateIndex()}`,
		},
		{
			title: 'Conversion Rate',
			dataIndex: 'conversion_rate',
			key: `pr-conversionrate${updateIndex()}`,
		},
		...(displayReplaySearch ? replaySearch : []),
		{
			title: 'Source',
			dataIndex: 'source',
			key: `pr-source${updateIndex()}`,
			width: '30%',
			render: item => <div css="overflow-y: scroll; height:150px;">{item}</div>,
		},
	];
};
export const popularFiltersFull = (plan, displayReplaySearch) => {
	if (plan !== 'growth') {
		return [
			...popularFiltersCol(plan),
			...(plan === 'bootstrap' && displayReplaySearch ? replaySearch : []),
		];
	}
	return [
		...popularFiltersCol('free'),
		{
			title: 'Clicks',
			dataIndex: 'clicks',
			key: `pf-clicks${updateIndex()}`,
		},
		{
			title: 'Click Rate',
			dataIndex: 'click_rate',
			render: i => i.toFixed(2),
			key: `pf-clickrate${updateIndex()}`,
		},
		{
			title: 'Click Position',
			dataIndex: 'click_position',
			key: `pf-clickposition${updateIndex()}`,
			render: item => <div css="overflow-y: scroll; max-height:150px;">{item.toFixed(2) || '-'}</div>,
		},
		{
			title: 'Conversion Rate',
			dataIndex: 'conversion_rate',
			key: `pf-conversionrate${updateIndex()}`,
		},
		...(displayReplaySearch ? replaySearch : []),
	];
};

export const requestLogs = [
	{
		title: 'Operation',
		dataIndex: 'operation',
		render: operation => (
			<div>
				<Flex>
					<div css="width: 100px;margin-top: 5px;word-break: keep-all;">
						<span css={requestOpt}>{operation.method}</span>
					</div>
					<div css="margin-left: 5px;">
						<span css="color: #74A2FF;">{operation.uri}</span>
					</div>
				</Flex>
			</div>
		),
		key: `operation${updateIndex()}`,
	},
	{
		title: 'Type',
		dataIndex: 'classifier',
		width: '100px',
		key: `type${updateIndex()}`,
	},
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

const getAuthToken = () => {
	let token = null;
	try {
		token = sessionStorage.getItem('authToken');
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
export function getAnalytics(appName, filters) {
	return new Promise((resolve, reject) => {
		const ACC_API = getURL();
		const url = `${ACC_API}/_analytics/${getApp(appName)}advanced`;
		const queryParams = getQueryParams({
			...filters,
			// from: moment()
			// 	.subtract(30, 'days')
			// 	.format('YYYY/MM/DD'),
			// to: moment().format('YYYY/MM/DD'),
		});

		const authToken = getAuthToken();
		fetch(url + queryParams, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Basic ${authToken}`,
			},
		})
			// Comment out this line
			.then(res => res.json())
			.then((res) => {
				// resolve the promise with response
				resolve(res);
			})
			.catch((e) => {
				reject(e);
			});
	});
}
/**
 * Get the search latency
 * @param {string} appName
 */
export function getSearchLatency(appName, filters) {
	return new Promise((resolve, reject) => {
		const authToken = getAuthToken();
		const ACC_API = getURL();
		fetch(`${ACC_API}/_analytics/${getApp(appName)}latency${getQueryParams(filters)}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Basic ${authToken}`,
			},
		})
			// Comment out this line
			.then(res => res.json())
			.then((res) => {
				// resolve the promise with response
				resolve(res);
			})
			.catch((e) => {
				reject(e);
			});
	});
}
/**
 * Get the geo distribution
 * @param {string} appName
 */
export function getGeoDistribution(appName, filters) {
	return new Promise((resolve, reject) => {
		const authToken = getAuthToken();
		const ACC_API = getURL();
		fetch(`${ACC_API}/_analytics/${getApp(appName)}geo-distribution${getQueryParams(filters)}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Basic ${authToken}`,
			},
		})
			// Comment out this line
			.then(res => res.json())
			.then((res) => {
				// resolve the promise with response
				resolve(res);
			})
			.catch((e) => {
				reject(e);
			});
	});
}
/**
 * Get the search latency
 * @param {string} appName
 */
export function getAnalyticsSummary(appName, filters) {
	const ACC_API = getURL();
	return doGet(`${ACC_API}/_analytics/${getApp(appName)}summary${getQueryParams(filters)}`, filters);
}
/**
 * Get the popular seraches
 * @param {string} appName
 */
// eslint-disable-next-line
export function getPopularSearches(appName, clickanalytics = true, size = 100, filters) {
	return new Promise((resolve, reject) => {
		const authToken = getAuthToken();
		const ACC_API = getURL();
		fetch(
			`${ACC_API}/_analytics/${getApp(appName)}popular-searches${getQueryParams({
				size,
				click_analytics: clickanalytics,
				...filters,
			})}`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Basic ${authToken}`,
				},
			},
		)
			// Comment out this line
			.then(res => res.json())
			.then((res) => {
				// resolve the promise with response
				resolve(res.popular_searches);
				// resolve(data.body.popularSearches);
			})
			.catch((e) => {
				reject(e);
			});
	});
}
/**
 * Get the no results seraches
 * @param {string} appName
 */
export function getNoResultSearches(appName, size = 100, filters) {
	return new Promise((resolve, reject) => {
		const authToken = getAuthToken();
		const ACC_API = getURL();
		fetch(`${ACC_API}/_analytics/${getApp(appName)}no-result-searches${getQueryParams({
			size,
			...filters,
		})}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Basic ${authToken}`,
			},
		})
			// Comment out this line
			.then(res => res.json())
			.then((res) => {
				// resolve the promise with response
				resolve(res.no_results_searches);
			})
			.catch((e) => {
				reject(e);
			});
	});
}
// eslint-disable-next-line
export function getPopularResults(appName, clickanalytics = true, size = 100, filters) {
	return new Promise((resolve, reject) => {
		const authToken = getAuthToken();
		const ACC_API = getURL();
		fetch(
			`${ACC_API}/_analytics/${getApp(appName)}popular-results${getQueryParams({
				size,
				click_analytics: clickanalytics,
				...filters,
			})}`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Basic ${authToken}`,
				},
			},
		)
			// Comment out this line
			.then(res => res.json())
			.then((res) => {
				// resolve the promise with response
				resolve(res.popular_results);
			})
			.catch((e) => {
				reject(e);
			});
	});
}
/**
 * Get the request distribution
 * @param {string} appName
 */
export function getRequestDistribution(appName, filters) {
	const ACC_API = getURL();
	return doGet(`${ACC_API}/_analytics/${getApp(appName)}request-distribution${getQueryParams(filters)}`);
}
// eslint-disable-next-line
export function getPopularFilters(appName, clickanalytics = true, size = 100, filters) {
	return new Promise((resolve, reject) => {
		const authToken = getAuthToken();
		const ACC_API = getURL();
		fetch(
			`${ACC_API}/_analytics/${getApp(appName)}popular-filters${getQueryParams({
				size,
				click_analytics: clickanalytics,
				...filters,
			})}`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Basic ${authToken}`,
				},
			},
		)
			// Comment out this line
			.then(res => res.json())
			.then((res) => {
				// resolve the promise with response
				resolve(res.popular_filters);
			})
			.catch((e) => {
				reject(e);
			});
	});
}
// To fetch request logs
export function getRequestLogs(appName, size = 10, from = 0, filter) {
	return new Promise((resolve, reject) => {
		const authToken = getAuthToken();
		const ACC_API = getURL();
		const validFilters = ['search', 'success', 'error', 'delete'];
		fetch(
			`${ACC_API}/${getApp(appName)}_logs${getQueryParams({
				size,
				from,
				...(filter
					&& validFilters.includes(filter) && {
						filter,
					}),
			})}`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Basic ${authToken}`,
				},
			},
		)
			// Comment out this line
			.then(res => res.json())
			.then((res) => {
				// resolve the promise with response
				resolve(res);
			})
			.catch((e) => {
				reject(e);
			});
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
