import get from 'lodash/get';
import { componentTypes } from '@appbaseio/reactivecore/lib/utils/constants';
import { doGet } from './requestService';

// export const ACC_API = 'https://accapi.appbase.io';
// export const SCALR_API = 'https://scalr.api.appbase.io';
export const ACC_API = 'https://accapi-staging.reactiveapps.io';
export const SCALR_API = 'https://api-staging.reactiveapps.io';

// Get credentials if permissions are already present
export function getCredentialsFromPermissions(permissions = []) {
	let result = permissions.find(
		permission => permission.read
			&& permission.write
			&& get(permission, 'referers', []).includes('*')
			&& get(permission, 'include_fields', []).includes('*'),
	);
	if (!result) {
		result = permissions.find(
			permission => permission.read
				&& permission.write
				&& get(permission, 'referers', []).includes('*'),
		);
	}
	if (!result) {
		result = permissions.find(permission => permission.read && permission.write);
	}
	if (!result) {
		result = permissions.find(permission => permission.read);
	}
	return result;
}

export function getReadCredentialsFromPermissions(permissions = []) {
	let result = permissions.find(
		permission => permission.read
			&& !permission.write
			&& get(permission, 'referers', []).includes('*')
			&& get(permission, 'include_fields', []).includes('*'),
	);
	if (!result) {
		result = permissions.find(
			permission => permission.read
				&& !permission.write
				&& get(permission, 'referers', []).includes('*'),
		);
	}
	if (!result) {
		result = permissions.find(permission => permission.read && !permission.write);
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
			},
		})
			.then(res => res.json())
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
export const getUserAppsPermissions = () => doGet(`${ACC_API}/user/apps/permissions`);
export const setUserInfo = userInfo =>
	new Promise((resolve, reject) => {
		fetch(`${ACC_API}/user/profile`, {
			method: 'PUT',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
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
