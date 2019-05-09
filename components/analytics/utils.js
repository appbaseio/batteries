import React from 'react';
import { css } from 'emotion';
import moment from 'moment';
import { ACC_API } from '../../utils';
import { doGet } from '../../utils/requestService';
import Flex from '../shared/Flex';

const requestOpt = css`
	color: #00ff88;
	text-transform: uppercase;
	font-weight: 500;
	padding: 5px 10px;
	border-radius: 3px;
	border: solid 1px #00ff88;
`;
const getQueryParams = (paramObj) => {
	let queryString = '';
	Object.keys(paramObj).forEach((o, i) => {
		if (i === 0) {
			queryString = `?${o}=${paramObj[o]}`;
		} else {
			queryString += `&${o}=${paramObj[o]}`;
		}
	});
	return queryString;
};
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
export const popularFiltersCol = (plan) => {
	const defaults = [
		{
			title: 'Filters',
			render: item => (
				<React.Fragment>
					<strong>{item.key}</strong>
					{` ${item.value}`}
				</React.Fragment>
			),
		},
		{
			title: 'Impressions',
			dataIndex: 'count',
		},
	];
	if (!plan || plan !== 'growth') {
		return defaults;
	}
	return [
		...defaults,
		{
			title: 'Click Rate',
			dataIndex: 'clickrate',
		},
	];
};
export const popularResultsCol = (plan) => {
	const defaults = [
		{
			title: 'Results',
			dataIndex: 'key',
		},
		{
			title: 'Impressions',
			dataIndex: 'count',
		},
	];
	if (!plan || plan !== 'growth') {
		return defaults;
	}
	return [
		...defaults,
		{
			title: 'Click Rate',
			dataIndex: 'clickrate',
		},
	];
};
export const defaultColumns = (plan) => {
	const defaults = [
		{
			title: 'Search Terms',
			dataIndex: 'key',
		},
		{
			title: 'Total Queries',
			dataIndex: 'count',
		},
	];
	if (!plan || plan !== 'growth') {
		return defaults;
	}
	return [
		...defaults,
		{
			title: 'Click Rate',
			dataIndex: 'clickrate',
		},
	];
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

export const popularSearchesFull = (plan) => {
	if (!plan || plan !== 'growth') {
		return defaultColumns(plan);
	}
	return [
		...defaultColumns('free'),
		{
			title: 'Clicks',
			dataIndex: 'clicks',
		},
		{
			title: 'Avg Click Position',
			dataIndex: 'clickposition',
		},
		{
			title: 'Click Rate',
			dataIndex: 'clickrate',
		},
		{
			title: 'Conversion Rate',
			dataIndex: 'conversionrate',
		},
	];
};
export const popularResultsFull = (plan) => {
	if (plan !== 'growth') {
		return [
			...popularResultsCol(plan),
			{
				title: 'Source',
				dataIndex: 'source',
				key: 'source',
				width: '30%',
				render: item => <div css="overflow-y: scroll; height:150px;">{item}</div>,
			},
		];
	}
	return [
		...popularResultsCol('free'),
		{
			title: 'Clicks',
			dataIndex: 'clicks',
			key: 'clicks',
		},
		{
			title: 'Click Rate',
			dataIndex: 'clickrate',
		},
		{
			title: 'Click Position',
			dataIndex: 'clickposition',
			render: item => <div css="overflow-y: scroll; max-height:150px;">{item || '-'}</div>,
		},
		{
			title: 'Conversion Rate',
			dataIndex: 'conversionrate',
			key: 'conversionrate',
		},
		{
			title: 'Source',
			dataIndex: 'source',
			key: 'source',
			width: '30%',
			render: item => <div css="overflow-y: scroll; height:150px;">{item}</div>,
		},
	];
};
export const popularFiltersFull = (plan) => {
	if (plan !== 'growth') {
		return popularFiltersCol(plan);
	}
	return [
		...popularFiltersCol('free'),
		{
			title: 'Clicks',
			dataIndex: 'clicks',
			key: 'clicks',
		},
		{
			title: 'Click Rate',
			dataIndex: 'clickrate',
		},
		{
			title: 'Click Position',
			dataIndex: 'clickposition',
			render: item => <div css="overflow-y: scroll; max-height:150px;">{item || '-'}</div>,
		},
		{
			title: 'Conversion Rate',
			dataIndex: 'conversionrate',
			key: 'conversionrate',
		},
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
	},
	{
		title: 'Type',
		dataIndex: 'classifier',
		width: '100px',
	},
	{
		title: 'Time',
		dataIndex: 'timeTaken',
		width: '140px',
	},
	{
		title: 'Status',
		dataIndex: 'status',
		width: '100px',
	},
];
export const growthTimeRange = {
	from: moment()
		.subtract(30, 'days')
		.format('YYYY/MM/DD'),
	to: moment().format('YYYY/MM/DD'),
};

const getDateRangeByPlan = (plan, filters) => {
	if (filters && filters.from && filters.to) {
		return {
			from: filters.from,
			to: filters.to,
		};
	}
	return plan === 'growth' ? growthTimeRange : '';
};
/**
 * Get the analytics
 * @param {string} appName
 */
export function getAnalytics(appName, userPlan, clickanalytics = true) {
	return new Promise((resolve, reject) => {
		const url =			userPlan === 'growth'
				? `${ACC_API}/analytics/${appName}/advanced`
				: `${ACC_API}/analytics/${appName}/overview`;
		const queryParams =			userPlan === 'growth'
				? getQueryParams({
						clickanalytics,
						...getDateRangeByPlan(userPlan),
				  })
				: getQueryParams({ clickanalytics });
		fetch(url + queryParams, {
			method: 'GET',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
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
export function getSearchLatency(appName, plan) {
	return new Promise((resolve, reject) => {
		fetch(
			`${ACC_API}/analytics/${appName}/latency${getQueryParams(getDateRangeByPlan(plan))}`,
			{
				method: 'GET',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
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
/**
 * Get the geo distribution
 * @param {string} appName
 */

export function getGeoDistribution(appName, plan) {
	return new Promise((resolve, reject) => {
		fetch(`${ACC_API}/analytics/${appName}/geoip${getQueryParams(getDateRangeByPlan(plan))}`, {
			method: 'GET',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
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
 * Get the summary
 * @param {string} appName
 */
export function getAnalyticsSummary(appName, plan) {
	return doGet(
		`${ACC_API}/analytics/${appName}/summary${getQueryParams(getDateRangeByPlan(plan))}`,
	);
}
/**
 * Get the request distribution
 * @param {string} appName
 */
export function getRequestDistribution(appName, plan, filters) {
	return doGet(
		`${ACC_API}/analytics/${appName}/requestdistribution${getQueryParams(
			getDateRangeByPlan(plan, filters),
		)}`,
	);
}
/**
 * Get the popular seraches
 * @param {string} appName
 */
export function getPopularSearches(appName, plan, clickanalytics = true, size = 100) {
	return new Promise((resolve, reject) => {
		fetch(
			`${ACC_API}/analytics/${appName}/popularsearches${getQueryParams({
				clickanalytics,
				size,
				...getDateRangeByPlan(plan),
			})}`,
			{
				method: 'GET',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
				},
			},
		)
			// Comment out this line
			.then(res => res.json())
			.then((res) => {
				// resolve the promise with response
				resolve(res.popularSearches);
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
export function getNoResultSearches(appName, plan, size = 100) {
	return new Promise((resolve, reject) => {
		fetch(
			`${ACC_API}/analytics/${appName}/noresultsearches${getQueryParams({
				size,
				...getDateRangeByPlan(plan),
			})}`,
			{
				method: 'GET',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
				},
			},
		)
			// Comment out this line
			.then(res => res.json())
			.then((res) => {
				// resolve the promise with response
				resolve(res.noResultSearches);
			})
			.catch((e) => {
				reject(e);
			});
	});
}
export function getPopularResults(appName, plan, clickanalytics = true, size = 100) {
	return new Promise((resolve, reject) => {
		fetch(
			`${ACC_API}/analytics/${appName}/popularResults${getQueryParams({
				clickanalytics,
				size,
				...getDateRangeByPlan(plan),
			})}`,
			{
				method: 'GET',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
				},
			},
		)
			// Comment out this line
			.then(res => res.json())
			.then((res) => {
				// resolve the promise with response
				resolve(res.popularResults);
			})
			.catch((e) => {
				reject(e);
			});
	});
}
export function getPopularFilters(appName, plan, clickanalytics = true, size = 100) {
	return new Promise((resolve, reject) => {
		fetch(
			`${ACC_API}/analytics/${appName}/popularFilters${getQueryParams({
				clickanalytics,
				size,
				...getDateRangeByPlan(plan),
			})}`,
			{
				method: 'GET',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
				},
			},
		)
			// Comment out this line
			.then(res => res.json())
			.then((res) => {
				// resolve the promise with response
				resolve(res.popularFilters);
			})
			.catch((e) => {
				reject(e);
			});
	});
}
const validFilters = ['search', 'success', 'error', 'delete'];
// To fetch request logs
export function getRequestLogs(appName, plan, size = 10, from = 0, filter) {
	return new Promise((resolve, reject) => {
		fetch(
			`${ACC_API}/app/${appName}/logs${getQueryParams({
				size,
				from,
				...(filter
					&& validFilters.includes(filter) && {
						filter,
					}),
			})}`,
			{
				method: 'GET',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
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
