import get from 'lodash/get';
import { doGet, doPost } from './requestService';
import { getURL } from '../../constants/config';

// Get credentials if permissions are already present
export function getCredentialsFromPermissions(permissions = []) {
	let result = permissions.find(
		permission =>
			permission &&
			permission.ops.indexOf('read') > -1 &&
			permission &&
			permission.ops.indexOf('write') > -1 &&
			get(permission, 'referers', []).includes('*'),
	);
	if (!result) {
		result = permissions.find(
			permission =>
				permission &&
				permission.ops.indexOf('read') > -1 &&
				permission &&
				permission.ops.indexOf('write') > -1 &&
				get(permission, 'referers', []).includes('*'),
		);
	}
	if (!result) {
		result = permissions.find(
			permission =>
				permission &&
				permission.ops.indexOf('read') > -1 &&
				permission &&
				permission.ops.indexOf('write') > -1,
		);
	}
	if (!result) {
		result = permissions.find(permission => permission && permission.ops.indexOf('read') > -1);
	}
	if (result) {
		result.credentials = `${result.username}:${result.password}`;
	}
	return result;
}

export function getReadCredentialsFromPermissions(permissions = []) {
	let result = permissions.find(
		permission =>
			permission.read &&
			!permission.write &&
			get(permission, 'referers', []).includes('*') &&
			get(permission, 'include_fields', []).includes('*'),
	);
	if (!result) {
		result = permissions.find(
			permission =>
				permission.read &&
				!permission.write &&
				get(permission, 'referers', []).includes('*'),
		);
	}
	if (!result) {
		result = permissions.find(permission => permission.read && !permission.write);
	}
	return result || false;
}

const getAuthToken = () => {
	let token = null;
	try {
		token = sessionStorage.getItem('authToken');
	} catch (e) {
		console.error(e);
	}
	return token;
};

export function getCredentials(appId) {
	return new Promise((resolve, reject) => {
		const authToken = getAuthToken();
		const ACC_API = getURL();
		fetch(`${ACC_API}/app/${appId}/permissions`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Basic ${authToken}`,
			},
		})
			.then(res => res.json())
			.then(data => {
				resolve(getCredentialsFromPermissions(data.body));
			})
			.catch(e => {
				reject(e);
			});
	});
}

export function isEqual(x, y) {
	/* eslint-disable */
	if (x === y) return true;
	if (!(x instanceof Object) || !(y instanceof Object)) return false;
	if (x.constructor !== y.constructor) return false;

	for (const p in x) {
		if (!x.hasOwnProperty(p)) continue;
		if (!y.hasOwnProperty(p)) return false;
		if (x[p] === y[p]) continue;
		if (typeof x[p] !== 'object') return false;
		if (!isEqual(x[p], y[p])) return false;
	}

	for (const p in y) {
		if (y.hasOwnProperty(p) && !x.hasOwnProperty(p)) return false;
	}
	return true;
}
export const getUserAppsPermissions = () => {
	const ACC_API = getURL();
	return doGet(`${ACC_API}/_permissions`);
};

export const setUserInfo = userInfo => {
	const ACC_API = getURL();
	return doPost(`${ACC_API}/arc/metadata`, userInfo, {
		'Content-Type': 'application/json',
	});
};

export const parseSearchState = (searchState = {}) => {
	const allComponentsQueries = get(searchState, 'query', []);

	// Filter all internal Components
	const componentsQueries = allComponentsQueries.filter(
		(component) => !component.id.endsWith('__internal'),
	);

	// Filter term queries this will be part of MultiList
	const filterQueries = componentsQueries.filter((component) => component.type === 'term');

	// Search query will contain either type = search or no type but will for sure have value key.
	const searchQuery = allComponentsQueries.find(
		(component) =>
			(component.type === 'search' || !component.type) && component.hasOwnProperty('value'),
	) || {};

	// Result query will contain either type = search or no type, plus it wont have value key and execute will be false.
	const resultQuery = componentsQueries.find(
		(component) => (component.type === 'search' || !component.type) && !component.hasOwnProperty('value') && component.execute === false,
	) || {};

	const parsedState = {};

	const aggregations = filterQueries.reduce((agg, item, index) => {
		const { type: listType, react: listReact, execute: listExecute,value: listValue, id: listId, ...extraListProps } = item;
		return [
			...agg,
			{
				...extraListProps,
				id: `list-${index}`,
				type: 'term',
				value: listValue,
			},
		];
	}, []);

	const {
		type: searchType,
		execute:searchExecute,
		react: searchReact,
		value: searchValue,
		...extraSearchProps
	} = searchQuery;

	const search = {
		...extraSearchProps,
		value: searchValue,
		id: 'search',
	};

	const { type: resultType, react: resultReactList ,execute: resultExecute, ...extraResultProps } = resultQuery;

	const result = {
		dataField: ['_score'],
		...extraResultProps,
		id: 'result',
		react: { and: ['search', ...filterQueries.map((filter) => filter.id)] },
	};

	return [
		...aggregations,
		result,
		search,
	];
};

export const ARC_PLANS = {
	ARC_BASIC: 'arc-basic',
	ARC_STANDARD: 'arc-standard',
	ARC_ENTERPRISE: 'arc-enterprise',
	HOSTED_ARC_BASIC: 'hosted-arc-basic',
	HOSTED_ARC_STANDARD: 'hosted-arc-standard',
	HOSTED_ARC_ENTERPRISE: 'hosted-arc-enterprise',
};


export const CLUSTER_PLANS = {
	SANDBOX_2019: '2019-sandbox',
	HOBBY_2019: '2019-hobby',
	STARTER_2019: '2019-starter',
	PRODUCTION_2019_1: '2019-production-1',
	PRODUCTION_2019_2: '2019-production-2',
	PRODUCTION_2019_3: '2019-production-3',
};

export const PRICE_BY_PLANS = {
	[ARC_PLANS.ARC_BASIC]: 19,
	[ARC_PLANS.ARC_STANDARD]: 59,
	[ARC_PLANS.ARC_ENTERPRISE]: 499,
	[ARC_PLANS.HOSTED_ARC_BASIC]: 39,
	[ARC_PLANS.HOSTED_ARC_STANDARD]: 89,
	[ARC_PLANS.HOSTED_ARC_ENTERPRISE]: 599,
	[CLUSTER_PLANS.SANDBOX_2019]: 59,
	[CLUSTER_PLANS.HOBBY_2019]: 119,
	[CLUSTER_PLANS.STARTER_2019]: 199,
	[CLUSTER_PLANS.PRODUCTION_2019_1]: 399,
	[CLUSTER_PLANS.PRODUCTION_2019_2]: 700,
	[CLUSTER_PLANS.PRODUCTION_2019_3]: 1599,
}

export const EFFECTIVE_PRICE_BY_PLANS = {
	[ARC_PLANS.ARC_BASIC]: 0.03,
	[ARC_PLANS.ARC_STANDARD]: 0.08,
	[ARC_PLANS.ARC_ENTERPRISE]: 0.69,
	[ARC_PLANS.HOSTED_ARC_BASIC]: 0.05,
	[ARC_PLANS.HOSTED_ARC_STANDARD]: 0.12,
	[ARC_PLANS.HOSTED_ARC_ENTERPRISE]: 0.83,
	[CLUSTER_PLANS.SANDBOX_2019]: 0.08,
	[CLUSTER_PLANS.HOBBY_2019]: 0.17,
	[CLUSTER_PLANS.STARTER_2019]: 0.28,
	[CLUSTER_PLANS.PRODUCTION_2019_1]: 0.55,
	[CLUSTER_PLANS.PRODUCTION_2019_2]: 1.11,
	[CLUSTER_PLANS.PRODUCTION_2019_3]: 2.22,
}

export const allowedPlans = [
	ARC_PLANS.ARC_ENTERPRISE,
	ARC_PLANS.HOSTED_ARC_ENTERPRISE,
	CLUSTER_PLANS.PRODUCTION_2019_1,
	CLUSTER_PLANS.PRODUCTION_2019_2,
	CLUSTER_PLANS.PRODUCTION_2019_3,
];

export const features = {
	FUNCTIONS: 'FUNCTIONS',
	SEARCH_RELEVANCY: 'SEARCH_RELEVANCY',
	QUERY_RULES: 'QUERY_RULES',
	ANALYTICS: 'ANALYTICS',
}


export const isValidPlan = (tier, override, feature) => {
	if (override) {
		return true;
	}

	switch (feature) {
		case features.FUNCTIONS:
			const functionPlans = allowedPlans.filter(plan => plan !== CLUSTER_PLANS.PRODUCTION_2019_1)
			return tier && functionPlans.includes(tier)
		default:
			return tier && allowedPlans.includes(tier);
	}
}

export const deleteObjectFromPath = (obj, path) => {
	const fields = path.split('.');
	if (obj) {
		if (fields.length === 1 && obj[fields[0]]) {
			return delete obj[path];
		}
		return deleteObjectFromPath(obj[fields[0]], fields.slice(1).join('.'));
	}
	return false;
};
