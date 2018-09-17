import React from 'react';
import { css } from 'emotion';
import moment from 'moment';
import { ACC_API } from '../../utils';
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
			queryString = `&${o}=${paramObj[o]}`;
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
		...defaultColumns(plan),
		{
			title: 'Clicks',
			dataIndex: 'clicks',
		},
		{
			title: 'Click Position',
			dataIndex: 'clickposition',
		},
		{
			title: 'Conversion Rate',
			dataIndex: 'conversionrate',
		},
	];
};
export const popularResultsFull = (plan) => {
	if (plan !== 'growth') {
		return popularResultsCol(plan);
	}
	return [
		...popularResultsCol(plan),
		{
			title: 'Clicks',
			dataIndex: 'clicks',
			key: 'clicks',
		},
		{
			title: 'Source',
			dataIndex: 'source',
			key: 'source',
		},
		{
			title: 'Conversion Rate',
			dataIndex: 'conversionrate',
			key: 'conversionrate',
		},
	];
};
export const popularFiltersFull = (plan) => {
	if (plan !== 'growth') {
		return popularFiltersCol(plan);
	}
	return [
		...popularFiltersCol(plan),
		{
			title: 'Clicks',
			dataIndex: 'clicks',
			key: 'clicks',
		},
		{
			title: 'Source',
			dataIndex: 'source',
			key: 'source',
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
					<div css="width: 70px">
						<span css={requestOpt}>{operation.method}</span>
					</div>
					<div>
						<span css="color: #74A2FF;margin-left: 10px">{operation.uri}</span>
					</div>
				</Flex>
			</div>
		),
	},
	{
		title: 'Type',
		dataIndex: 'classifier',
	},
	{
		title: 'Time',
		dataIndex: 'timeTaken',
	},
	{
		title: 'Status',
		dataIndex: 'status',
	},
];
/**
 * Get the analytics
 * @param {string} appName
 */
export function getAnalytics(appName, userPlan, clickanalytics = true) {
	return new Promise((resolve, reject) => {
		const url =			userPlan === 'growth'
				? `${ACC_API}/analytics/${appName}/advanced`
				: `${ACC_API}/analytics/${appName}/overview`;
		const queryParams = getQueryParams({ clickanalytics });
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
export function getSearchLatency(appName) {
	return new Promise((resolve, reject) => {
		fetch(`${ACC_API}/analytics/${appName}/latency`, {
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
export function getGeoDistribution(appName) {
	return new Promise((resolve, reject) => {
		fetch(`${ACC_API}/analytics/${appName}/geoip`, {
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
 * Get the popular seraches
 * @param {string} appName
 */
export function getPopularSearches(appName, clickanalytics = true, size = 100) {
	return new Promise((resolve, reject) => {
		fetch(
			`${ACC_API}/analytics/${appName}/popularsearches${getQueryParams({
				clickanalytics,
			})}?size=${size}`,
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
export function getNoResultSearches(appName, size = 100) {
	return new Promise((resolve, reject) => {
		fetch(`${ACC_API}/analytics/${appName}/noresultsearches?size=${size}`, {
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
				resolve(res.noResultSearches);
			})
			.catch((e) => {
				reject(e);
			});
	});
}
export function getPopularResults(appName, clickanalytics = true, size = 100) {
	return new Promise((resolve, reject) => {
		fetch(
			`${ACC_API}/analytics/${appName}/popularResults${getQueryParams({
				clickanalytics,
			})}?size=${size}`,
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
export function getPopularFilters(appName, clickanalytics = true, size = 100) {
	return new Promise((resolve, reject) => {
		fetch(
			`${ACC_API}/analytics/${appName}/popularFilters${getQueryParams({
				clickanalytics,
			})}?size=${size}`,
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
// To fetch request logs
export function getRequestLogs(appName, size = 100) {
	return new Promise((resolve, reject) => {
		fetch(`${ACC_API}/app/${appName}/logs?size=${size}`, {
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

// Banner messages
export const bannerMessages = {
	free: {
		title: 'Unlock the ROI impact of your search',
		description:
			'Get a paid plan to see actionable analytics on search volume, popular searches, no results, track clicks and conversions.',
		buttonText: 'Upgrade Now',
		href: '/billing',
	},
	bootstrap: {
		title: 'Get richer analytics on clicks and conversions',
		description:
			'By upgrading to the Growth plan, you can get more actionable analytics on popular filters, popular results, and track clicks and conversions along with a 30-day retention.',
		buttonText: 'Upgrade To Growth',
		href: '/billing',
		isHorizontal: true,
	},
	growth: {
		title: 'Learn how to track click analytics',
		description:
			'See our docs on how to track search, filters, click events, conversions and your own custom events.',
		buttonText: 'Read Docs',
		isHorizontal: true,
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
