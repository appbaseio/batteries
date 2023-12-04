import get from 'lodash/get';
import { componentTypes } from '@appbaseio/reactivecore/lib/utils/constants';
import { doGet } from './requestService';

// ---------------------------------CAUTION------------------------------------
/**
 * Please don't try to change this section just to switch the URLs
 * instead create a `.env` file at root and define the `CONTEXT` variable according to your usage
 */
export const isStaging = false;
// export const isStaging = process.env.CONTEXT === 'deploy-preview';

export const ACC_API = isStaging
	? 'https://accapi-staging.reactivesearch.io'
	: 'https://accapi.appbase.io';

// export const ACC_API = 'http://localhost:3000';
export const SCALR_API = isStaging
	? 'https://api-staging.reactiveapps.io'
	: 'https://scalr.api.appbase.io';
// ---------------------------------CAUTION------------------------------------

// Get credentials if permissions are already present
export function getCredentialsFromPermissions(permissions = []) {
	let result = permissions.find(
		permission =>
			permission.read &&
			permission.write &&
			get(permission, 'referers', []).includes('*') &&
			get(permission, 'include_fields', []).includes('*'),
	);
	if (!result) {
		result = permissions.find(
			permission =>
				permission.read &&
				permission.write &&
				get(permission, 'referers', []).includes('*'),
		);
	}
	if (!result) {
		result = permissions.find(
			permission => permission.read && permission.write,
		);
	}
	if (!result) {
		result = permissions.find(permission => permission.read);
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
		result = permissions.find(
			permission => permission.read && !permission.write,
		);
	}
	return result || false;
}

export function getCredentials(appId) {
	return new Promise((resolve, reject) => {
		fetch(`${ACC_API}/app/${appId}/permissions`, {
			method: 'GET',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
				...getSecretHeaders(),
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
export const getUserAppsPermissions = () =>
	doGet(`${ACC_API}/user/apps/permissions`);
export const setUserInfo = userInfo =>
	new Promise((resolve, reject) => {
		fetch(`${ACC_API}/user/profile`, {
			method: 'PUT',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
				...getSecretHeaders(),
			},
			body: JSON.stringify(userInfo),
		})
			.then(res => res.json())
			.then(data => resolve(data))
			.catch(error => reject(error));
	});

/**
 * Search state parser
 * Generates a search state compatible with SearchSandbox
 */
export const parseSearchState = (searchState = {}) => {
	const searchProfile = {};
	let listCounter = 1;
	const componentIds = {};
	// Filter out the components
	Object.keys(searchState).forEach(key => {
		const { value, dataField, URLParams, ...state } = searchState[key];
		// Change value to defaultValue
		// Don't set URL params
		state.defaultValue = value;
		if (Array.isArray(dataField)) {
			state.dataField = dataField.filter(i => !i.split('.')[1]);
		} else if (typeof dataField === 'string') {
			state.dataField = dataField.split('.')[0];
		}
		switch (state.componentType) {
			case componentTypes.dataSearch:
				searchProfile.search = state;
				componentIds[key] = 'search';
				break;
			case componentTypes.reactiveList:
				searchProfile.result = state;
				componentIds[key] = 'result';
				break;
			case componentTypes.multiDataList:
			case componentTypes.singleDataList:
			case componentTypes.multiDropdownList:
			case componentTypes.singleDropdownList:
			case componentTypes.singleList:
			case componentTypes.multiList:
				componentIds[key] = `list-${listCounter}`;
				searchProfile[`list-${listCounter}`] = state;
				listCounter += 1;
				break;
			default:
				break;
		}
	});
	const filterReactProp = (react, queryFormat = 'and') => {
		if (typeof react[queryFormat] === 'string') {
			if (componentIds[react[queryFormat]]) {
				return componentIds[react[queryFormat]];
			}
			return undefined;
		}
		const newReact = [];
		if (react[queryFormat] instanceof Array) {
			react[queryFormat].forEach(reactKey => {
				if (componentIds[reactKey]) {
					newReact.push(componentIds[reactKey]);
				}
			});
		}
		return newReact.length ? newReact : undefined;
	};
	// Update the react props
	Object.keys(searchProfile).forEach(key => {
		const { react, ...state } = searchProfile[key];
		const newReact = {};
		if (react) {
			if (react.or) {
				const orFormat = filterReactProp(react, 'or');
				if (orFormat) {
					newReact.or = orFormat;
				}
			}
			if (react.and) {
				const andFormat = filterReactProp(react);
				if (andFormat) {
					newReact.and = andFormat;
				}
			}
		}
		if (Object.keys(newReact).length) {
			searchProfile[key] = {
				...state,
				react: newReact,
			};
		}
		searchProfile[key] = state;
	});
	return searchProfile;
};

export const getSecretHeaders = () => {
	const storedValue = sessionStorage.getItem('secretHeaders');

	if (storedValue) {
		const parsedValue = JSON.parse(storedValue);

		return {
			'x-app-secret': parsedValue.secret,
			'x-secret-id': parsedValue.mail,
		};
	}
	return {};
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

export const CLUSTER_PLANS = {
	SANDBOX_2019: '2019-sandbox',
	HOBBY_2019: '2019-hobby',
	STARTER_2019: '2019-starter',
	PRODUCTION_2019_1: '2019-production-1',
	PRODUCTION_2019_2: '2019-production-2',
	PRODUCTION_2019_3: '2019-production-3',
	SANDBOX_2020: '2020-sandbox',
	HOBBY_2020: '2020-hobby',
	STARTER_2020: '2020-starter',
	STARTER_2021: '2021-starter',
	PRODUCTION_2021_1: '2021-production-1',
	PRODUCTION_2021_2: '2021-production-2',
	PRODUCTION_2021_3: '2021-production-3',
	PRODUCTION_2023_1: '2023-production-1',
};
