import get from 'lodash/get';
import { doGet, doPost } from './requestService';
import { getURL } from '../../constants/config';
import { ALLOWED_ACTIONS } from '../../constants';

// Get credentials if permissions are already present
export function getCredentialsFromPermissions(permissions = []) {
	let result = permissions.find(
		(permission) =>
			permission &&
			permission.ops.indexOf('read') > -1 &&
			permission &&
			permission.ops.indexOf('write') > -1 &&
			get(permission, 'referers', []).includes('*'),
	);
	if (!result) {
		result = permissions.find(
			(permission) =>
				permission &&
				permission.ops.indexOf('read') > -1 &&
				permission &&
				permission.ops.indexOf('write') > -1 &&
				get(permission, 'referers', []).includes('*'),
		);
	}
	if (!result) {
		result = permissions.find(
			(permission) =>
				permission &&
				permission.ops.indexOf('read') > -1 &&
				permission &&
				permission.ops.indexOf('write') > -1,
		);
	}
	if (!result) {
		result = permissions.find(
			(permission) => permission && permission.ops.indexOf('read') > -1,
		);
	}
	if (result) {
		result.credentials = `${result.username}:${result.password}`;
	}
	return result;
}

export function getReadCredentialsFromPermissions(permissions = []) {
	let result = permissions.find(
		(permission) =>
			permission.read &&
			!permission.write &&
			get(permission, 'referers', []).includes('*') &&
			get(permission, 'include_fields', []).includes('*'),
	);
	if (!result) {
		result = permissions.find(
			(permission) =>
				permission.read &&
				!permission.write &&
				get(permission, 'referers', []).includes('*'),
		);
	}
	if (!result) {
		result = permissions.find((permission) => permission.read && !permission.write);
	}
	return result || false;
}

const getAuthToken = () => {
	let token = null;
	try {
		token = localStorage.getItem('authToken');
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
			.then((res) => res.json())
			.then((data) => {
				resolve(getCredentialsFromPermissions(data.body));
			})
			.catch((e) => {
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

export const setUserInfo = (userInfo) => {
	const ACC_API = getURL();
	return doPost(`${ACC_API}/arc/metadata`, userInfo, {
		'Content-Type': 'application/json',
	});
};

const extractFunctionalProps = (props = {}) => ({
	defaultQuery: props.defaultQuery ? () => props.defaultQuery : null,
	customQuery: props.customQuery ? () => props.customQuery : null,
	customHighlight: props.customHighlight ? () => props.customHighlight : null,
});

export const parseSearchState = (searchState = {}) => {
	const allComponentsQueries = get(searchState, 'query', []);

	// Filter all internal Components
	const componentsQueries = allComponentsQueries.filter(
		(component) => !component.id.endsWith('__internal'),
	);

	// Filter term queries this will be part of MultiList
	const filterQueries = componentsQueries.filter((component) => component.type === 'term');

	// Search query will contain either type = search or no type but will for sure have value key.
	const searchQuery =
		allComponentsQueries.find(
			(component) =>
				(component.type === 'search' || !component.type) &&
				component.hasOwnProperty('value'),
		) || {};

	// Result query will contain either type = search or no type, plus it wont have value key and execute will be false.
	const resultQuery =
		componentsQueries.find(
			(component) =>
				(component.type === 'search' || !component.type) &&
				!component.hasOwnProperty('value') &&
				component.execute === false,
		) || {};

	const parsedState = {};

	const aggregations = filterQueries.reduce((agg, item, index) => {
		const {
			type: listType,
			react: listReact,
			execute: listExecute,
			value: listValue,
			id: listId,
			...extraListProps
		} = item;
		return [
			...agg,
			{
				...extraListProps,
				...extractFunctionalProps(extraListProps),
				id: `list-${index}`,
				type: 'term',
				value: listValue,
			},
		];
	}, []);

	const {
		type: searchType,
		execute: searchExecute,
		react: searchReact,
		value: searchValue,
		...extraSearchProps
	} = searchQuery;

	const search = {
		...extraSearchProps,
		...extractFunctionalProps(extraSearchProps),
		value: searchValue,
		id: 'search',
	};

	const {
		type: resultType,
		react: resultReactList,
		execute: resultExecute,
		...extraResultProps
	} = resultQuery;

	const result = {
		dataField: ['_score'],
		...extraResultProps,
		id: 'result',
		react: { and: ['search', ...aggregations.map((filter) => filter.id)] },
		...extractFunctionalProps(extraResultProps),
	};

	return [...aggregations, result, search];
};

export const ARC_PLANS = {
	// arc basic
	ARC_BASIC: 'arc-basic',

	// arc standard
	ARC_STANDARD: 'arc-standard',

	// arc enterprise
	ARC_ENTERPRISE: 'arc-enterprise',

	// hosted arc basic
	HOSTED_ARC_BASIC: 'hosted-arc-basic',
	HOSTED_ARC_BASIC_V2: 'hosted-arc-basic-v2',

	// hosted arc standard
	HOSTED_ARC_STANDARD: 'hosted-arc-standard',
	HOSTED_ARC_STANDARD_2021: '2021-hosted-arc-standard',

	// hosted arc enterprise
	HOSTED_ARC_ENTERPRISE: 'hosted-arc-enterprise',
	HOSTED_ARC_ENTERPRISE_2021: '2021-hosted-arc-enterprise',
};

export const CLUSTER_PLANS = {
	// cluster sandbox
	SANDBOX_2019: '2019-sandbox',
	SANDBOX_2020: '2020-sandbox',

	// cluster hobby
	HOBBY_2019: '2019-hobby',
	HOBBY_2020: '2020-hobby',

	// cluster starter
	STARTER_2019: '2019-starter',
	STARTER_2020: '2020-starter',
	STARTER_2021: '2021-starter',

	// cluster production 1
	PRODUCTION_2019_1: '2019-production-1',
	PRODUCTION_2021_1: '2021-production-1',

	// cluster production 2
	PRODUCTION_2019_2: '2019-production-2',
	PRODUCTION_2021_2: '2021-production-2',

	// cluster production 3
	PRODUCTION_2019_3: '2019-production-3',
	PRODUCTION_2021_3: '2021-production-3',
};

export const PRICE_BY_PLANS = {
	// self-hosted arc basic plans
	[ARC_PLANS.ARC_BASIC]: 19,
	// self-hosted arc standard plans
	[ARC_PLANS.ARC_STANDARD]: 59,
	// self-hosted arc enterprise plans
	[ARC_PLANS.ARC_ENTERPRISE]: 499,

	// hosted arc basic plans
	[ARC_PLANS.HOSTED_ARC_BASIC]: 39,
	[ARC_PLANS.HOSTED_ARC_BASIC_V2]: 29,

	// hosted arc standard plans
	[ARC_PLANS.HOSTED_ARC_STANDARD]: 89,
	[ARC_PLANS.HOSTED_ARC_STANDARD_2021]: 99,

	// hosted arc enterprise plans
	[ARC_PLANS.HOSTED_ARC_ENTERPRISE]: 599,
	[ARC_PLANS.HOSTED_ARC_ENTERPRISE_2021]: 799,

	// cluster sandbox
	[CLUSTER_PLANS.SANDBOX_2019]: 59,
	[CLUSTER_PLANS.SANDBOX_2020]: 49,

	// cluster hobby
	[CLUSTER_PLANS.HOBBY_2019]: 119,
	[CLUSTER_PLANS.HOBBY_2020]: 99,

	// cluster starter
	[CLUSTER_PLANS.STARTER_2019]: 199,
	[CLUSTER_PLANS.STARTER_2020]: 149,
	[CLUSTER_PLANS.STARTER_2021]: 299,

	// cluster production 1
	[CLUSTER_PLANS.PRODUCTION_2019_1]: 399,
	[CLUSTER_PLANS.PRODUCTION_2021_1]: 999,

	// cluster production 2
	[CLUSTER_PLANS.PRODUCTION_2019_2]: 700,
	[CLUSTER_PLANS.PRODUCTION_2021_2]: 1999,

	// cluster production 3
	[CLUSTER_PLANS.PRODUCTION_2019_3]: 1599,
	[CLUSTER_PLANS.PRODUCTION_2021_3]: 3199,
};

// Price per node/hr
export const EFFECTIVE_PRICE_BY_PLANS = {
	// self-hosted arc basic plans
	[ARC_PLANS.ARC_BASIC]: 0.03,
	// self-hosted arc standard plans
	[ARC_PLANS.ARC_STANDARD]: 0.08,
	// self-hosted arc enterprise plans
	[ARC_PLANS.ARC_ENTERPRISE]: 0.69,

	// hosted arc basic plans
	[ARC_PLANS.HOSTED_ARC_BASIC]: 0.05,
	[ARC_PLANS.HOSTED_ARC_BASIC_V2]: 0.04,

	// hosted arc standard plans
	[ARC_PLANS.HOSTED_ARC_STANDARD]: 0.12,
	[ARC_PLANS.HOSTED_ARC_STANDARD_2021]: 0.137,

	// hosted arc enterprise plans
	[ARC_PLANS.HOSTED_ARC_ENTERPRISE]: 0.83,
	[ARC_PLANS.HOSTED_ARC_ENTERPRISE_2021]: 1.11,

	// cluster sandbox
	[CLUSTER_PLANS.SANDBOX_2019]: 0.08,
	[CLUSTER_PLANS.SANDBOX_2020]: 0.07,

	// cluster hobby
	[CLUSTER_PLANS.HOBBY_2019]: 0.17,
	[CLUSTER_PLANS.HOBBY_2020]: 0.14,

	// cluster starter
	[CLUSTER_PLANS.STARTER_2019]: 0.28,
	[CLUSTER_PLANS.STARTER_2020]: 0.21,
	[CLUSTER_PLANS.STARTER_2021]: 0.138,

	// cluster production 1
	[CLUSTER_PLANS.PRODUCTION_2019_1]: 0.55,
	[CLUSTER_PLANS.PRODUCTION_2021_1]: 0.463,

	// cluster production 2
	[CLUSTER_PLANS.PRODUCTION_2019_2]: 1.11,
	[CLUSTER_PLANS.PRODUCTION_2021_2]: 0.925,

	// cluster production 3
	[CLUSTER_PLANS.PRODUCTION_2019_3]: 2.22,
	[CLUSTER_PLANS.PRODUCTION_2021_3]: 1.48,
};

// Production or enterprise plans
export const allowedPlans = [
	ARC_PLANS.ARC_ENTERPRISE,
	ARC_PLANS.HOSTED_ARC_ENTERPRISE,
	ARC_PLANS.HOSTED_ARC_ENTERPRISE_2021,
	CLUSTER_PLANS.PRODUCTION_2019_1,
	CLUSTER_PLANS.PRODUCTION_2019_2,
	CLUSTER_PLANS.PRODUCTION_2019_3,
	CLUSTER_PLANS.PRODUCTION_2021_1,
	CLUSTER_PLANS.PRODUCTION_2021_2,
	CLUSTER_PLANS.PRODUCTION_2021_3,
];

export const features = {
	FUNCTIONS: 'FUNCTIONS',
	SEARCH_RELEVANCY: 'SEARCH_RELEVANCY',
	QUERY_RULES: 'QUERY_RULES',
	ANALYTICS: 'ANALYTICS',
	UI_BUILDER_PREMIUM: 'UI BUILDER PREMIUM',
};

export const isValidPlan = (tier, override, feature) => {
	if (override) {
		return true;
	}
	switch (feature) {
		// functions are not available for prod-1
		case features.FUNCTIONS:
			const functionPlans = allowedPlans.filter(
				(plan) =>
					![CLUSTER_PLANS.PRODUCTION_2019_1, CLUSTER_PLANS.PRODUCTION_2021_1].includes(
						plan,
					),
			);
			return tier && functionPlans.includes(tier);
		case features.SEARCH_RELEVANCY:
			// Allow search relevancy for starter and standard 2021 plans
			return (
				tier &&
				[
					...allowedPlans,
					CLUSTER_PLANS.STARTER_2021,
					ARC_PLANS.HOSTED_ARC_STANDARD_2021,
				].includes(tier)
			);
		default:
			return tier && allowedPlans.includes(tier);
	}
};

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

export const BACKENDS = {
	ELASTICSEARCH: {
		name: 'elasticsearch',
		logo: 'https://static-www.elastic.co/v3/assets/bltefdd0b53724fa2ce/blt05047fdbe3b9c333/5c11ec1f3312ce2e785d9c30/logo-elastic-elasticsearch-lt.svg',
	},
	OPENSEARCH: {
		name: 'opensearch',
		logo: 'https://opensearch.org/assets/brand/SVG/Logo/opensearch_logo_default.svg',
	},
	MONGODB: {
		name: 'mongodb',
		logo: 'https://webimages.mongodb.com/_com_assets/cms/kuyjf3vea2hg34taa-horizontal_default_slate_blue.svg?auto=format%252Ccompress',
	},
	FUSION: {
		name: 'fusion',
		logo: 'https://www.drupal.org/files/project-images/Solr.png',
	},
	SOLR: {
		name: 'solr',
		logo: 'https://www.drupal.org/files/project-images/Solr.png',
	},
	ZINC: {
		name: 'zinc',
		logo: 'https://zincsearch.com/assets/images/common/logo.svg',
	},
};

export const ALLOWED_ACTIONS_BY_BACKEND = {
	[BACKENDS.ELASTICSEARCH.name]: [...Object.values(ALLOWED_ACTIONS)],
	[BACKENDS.OPENSEARCH.name]: [...Object.values(ALLOWED_ACTIONS)],
	[BACKENDS.SOLR.name]: [
		...Object.values(ALLOWED_ACTIONS).filter(
			(action) =>
				action !== ALLOWED_ACTIONS.SEARCH_RELEVANCY &&
				action !== ALLOWED_ACTIONS.DEVELOP &&
				action !== ALLOWED_ACTIONS.SPEED,
		),
	],
	[BACKENDS.FUSION.name]: [
		...Object.values(ALLOWED_ACTIONS).filter(
			(action) =>
				action !== ALLOWED_ACTIONS.OVERVIEW &&
				action !== ALLOWED_ACTIONS.SEARCH_RELEVANCY &&
				action !== ALLOWED_ACTIONS.DEVELOP &&
				action !== ALLOWED_ACTIONS.SPEED,
		),
	],
	[BACKENDS.MONGODB.name]: [
		...Object.values(ALLOWED_ACTIONS).filter(
			(action) =>
				action !== ALLOWED_ACTIONS.OVERVIEW &&
				action !== ALLOWED_ACTIONS.SEARCH_RELEVANCY &&
				action !== ALLOWED_ACTIONS.DEVELOP &&
				action !== ALLOWED_ACTIONS.SPEED,
		),
	],
	[BACKENDS.ZINC.name]: [
		...Object.values(ALLOWED_ACTIONS).filter(
			(action) =>
				action !== ALLOWED_ACTIONS.SEARCH_RELEVANCY &&
				action !== ALLOWED_ACTIONS.DEVELOP &&
				action !== ALLOWED_ACTIONS.SPEED,
		),
	],
};

export const isFusion = () => {
	if (window && window.host) {
		return window.host === 'https://lw-dash.appbase.io/' || window.host.includes('lw-dash');
	}
	return false;
};
