import mappingUsecase from './mappingUsecase';
import analyzerSettings from './analyzerSettings';
import { SCALR_API, ACC_API } from './index';

const PRESERVED_KEYS = ['meta'];
export const REMOVED_KEYS = [
	'~logs',
	'~percolator',
	'.logs',
	'.percolator',
	'_default_',
];

function getAuthHeaders(credentials) {
	if (credentials) {
		return {
			Authorization: `Basic ${btoa(credentials)}`,
		};
	}
	return {};
}

export function getMappings(appName, credentials, url = SCALR_API) {
	return new Promise((resolve, reject) => {
		fetch(`${url}/${appName}/_mapping`, {
			method: 'GET',
			headers: {
				...getAuthHeaders(credentials),
				'Content-Type': 'application/json',
			},
		})
			.then(res => res.json())
			.then(data => {
				const types = Object.keys(data[appName].mappings).filter(
					type => !REMOVED_KEYS.includes(type),
				);

				let mappings = {};
				types.forEach(type => {
					mappings = {
						...mappings,
						[type]: data[appName].mappings[type],
					};
				});
				resolve(mappings);
			})
			.catch(e => {
				reject(e);
			});
	});
}

export function getSettings(appName, credentials, url = SCALR_API) {
	return new Promise((resolve, reject) => {
		fetch(`${url}/${appName}/_settings`, {
			method: 'GET',
			headers: {
				...getAuthHeaders(credentials),
				'Content-Type': 'application/json',
			},
		})
			.then(res => res.json())
			.then(data => {
				resolve(data);
			})
			.catch(e => {
				reject(e);
			});
	});
}

export function closeIndex(appName, credentials, url = SCALR_API) {
	return new Promise((resolve, reject) => {
		fetch(`${url}/${appName}/_close`, {
			method: 'POST',
			headers: {
				...getAuthHeaders(credentials),
				'Content-Type': 'application/json',
			},
		})
			.then(res => res.json())
			.then(data => {
				resolve(data);
			})
			.catch(e => {
				reject(e);
			});
	});
}

export function updateSynonyms(
	appName,
	credentials,
	url = SCALR_API,
	synonymsArray,
) {
	return new Promise((resolve, reject) => {
		fetch(`${url}/${appName}/_settings`, {
			method: 'PUT',
			headers: {
				...getAuthHeaders(credentials),
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				analysis: {
					filter: {
						synonyms_filter: {
							type: 'synonym',
							synonyms: synonymsArray,
						},
					},
					analyzer: {
						english_synonyms_analyzer: {
							filter: [
								'lowercase',
								'synonyms_filter',
								'asciifolding',
								'porter_stem',
							],
							tokenizer: 'standard',
							type: 'custom',
						},
						english_analyzer: {
							filter: [
								'lowercase',
								'asciifolding',
								'porter_stem',
							],
							tokenizer: 'standard',
							type: 'custom',
						},
					},
				},
			}),
		})
			.then(res => res.json())
			.then(data => {
				resolve(data);
			})
			.catch(e => {
				reject(e);
			});
	});
}

export function putMapping(
	appName,
	credentials,
	url = SCALR_API,
	mappings,
	type,
	version,
) {
	let mappingURL = `${url}/${appName}/_mapping/`;
	if (version < 7) {
		mappingURL = `${mappingURL}/${type}`;
	}

	return new Promise((resolve, reject) => {
		fetch(mappingURL, {
			method: 'PUT',
			headers: {
				...getAuthHeaders(credentials),
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				...mappings,
			}),
		})
			.then(res => res.json())
			.then(data => {
				resolve(data);
			})
			.catch(e => {
				reject(e);
			});
	});
}

export function openIndex(appName, credentials, url = SCALR_API) {
	return new Promise((resolve, reject) => {
		fetch(`${url}/${appName}/_open`, {
			method: 'POST',
			headers: {
				...getAuthHeaders(credentials),
				'Content-Type': 'application/json',
			},
		})
			.then(res => res.json())
			.then(data => {
				resolve(data);
			})
			.catch(e => {
				reject(e);
			});
	});
}

export async function getESVersion(appName) {
	const response = await fetch(`${ACC_API}/app/${appName}`, {
		credentials: 'include',
	});
	const data = await response.json();
	if (response.status >= 400) {
		throw new Error(data);
	}

	return data.body.es_version;
}

export function reIndex(
	mappings,
	appName,
	excludeFields,
	type,
	version = '5',
	shards,
	settings,
) {
	const body = {
		mappings,
		settings: { analysis: settings || analyzerSettings },
		exclude_fields: excludeFields,
		type,
		es_version: version,
		shard_count: shards && shards.toString(),
	};
	if (version >= 7) {
		delete body.type;
		const { properties, ...rest } = mappings;
		body.mappings = { properties: { ...properties }, ...rest };
	}
	return new Promise((resolve, reject) => {
		fetch(`${ACC_API}/app/${appName}/reindex`, {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		})
			.then(res => {
				if (res.status === 504) {
					resolve('~100');
				}
				return res;
			})
			.then(res => res.json())
			.then(data => {
				if (data.error) {
					reject(data.error);
				}
				if (data.body && data.body.response_info.failures.length) {
					reject(data.body.response_info.failures);
				}
				if (data.message !== 'App has been successfully reindexed.') {
					reject(data.message);
				}
				resolve(data.body.response_info.took);
			})
			.catch(e => {
				reject(e);
			});
	});
}

export function hasAggs(field) {
	if (!field) return false;

	let hasAggsFlag = false;
	Object.keys(field).forEach(subField => {
		if (
			field[subField].type === 'keyword' ||
			(field[subField].type === 'string' &&
				field[subField].index === 'not_analyzed') // for ES2
		) {
			hasAggsFlag = true;
		}
	});
	return hasAggsFlag;
}

export function getTypesFromMapping(mapping) {
	return Object.keys(mapping);
}

export function transformToES5(mapping) {
	// eslint-disable-next-line
	let _mapping = { ...mapping };

	Object.keys(_mapping).every(key => {
		if (PRESERVED_KEYS.includes(key)) return false;

		if (_mapping[key].type === 'string') {
			const hasUsecase = !!_mapping[key].fields;
			let usecase = { ..._mapping[key] };

			if (hasUsecase) {
				if (_mapping[key].fields.search) {
					usecase = mappingUsecase.search;
				} else if (hasAggs(_mapping[key].field)) {
					usecase = mappingUsecase.aggs;
				}
			}

			_mapping = {
				..._mapping,
				[key]: {
					...usecase,
					type: 'text',
				},
			};
		} else if (
			typeof _mapping[key] === 'object' &&
			!Array.isArray(_mapping[key])
		) {
			_mapping = {
				..._mapping,
				[key]: {
					..._mapping[key],
					...transformToES5(_mapping[key]),
				},
			};
		}
		return true;
	});
	return _mapping;
}

function setNestedMapping(mapping, fields, currentPath, type, usecase) {
	if (fields.length - 1 === currentPath) {
		const _mapping = { ...mapping };
		let newUsecase = {};
		if (usecase) {
			newUsecase = mappingUsecase[usecase];
		}
		_mapping[fields[currentPath]] = {
			...newUsecase,
			type,
		};
		return _mapping;
	}

	const updatedmapping = setNestedMapping(
		mapping[fields[currentPath]],
		fields,
		currentPath + 1,
		type,
		usecase,
	);
	const _mapping = {
		...mapping,
		[fields[currentPath]]: {
			...mapping[fields[currentPath]],
			...updatedmapping,
		},
	};
	return _mapping;
}

export function updateMapping(mapping, field, type, usecase) {
	// eslint-disable-next-line
	let _mapping = { ...mapping };

	const fields = field.split('.');

	return setNestedMapping(_mapping, fields, 0, type, usecase);
}

export function updateMappingES7(mapping, field, type, usecase) {
	// eslint-disable-next-line
	const _mapping = { ...mapping };

	const fields = field.split('.').slice(1);

	return setNestedMapping(_mapping, fields, 0, type, usecase);
}

/**
 *
 * @param {*} mappings
 * @returns Boolean
 */
export const getVersion = async (appName, credentials, url) => {
	try {
		// Try to get the version from the root endpoint
		const res = await fetch(url, {
			headers: {
				Authorization: `Basic ${btoa(credentials)}`,
			},
		}).then(response => response.json());

		if (res.version && res.version.number) {
			const versionNumber = res.version.number;
			const majorVersion = parseInt(versionNumber.split('.')[0], 10);
			return majorVersion;
		}
		throw new Error('Version not found in root endpoint response');
	} catch (error) {
		// Fallback: use settings endpoint
		const settings = await getSettings(appName, credentials, url);
		const fullVersion =
			settings[appName].settings.index.version.upgraded ||
			settings[appName].settings.index.version.created;
		const version = parseInt(fullVersion.split('.')[0], 10);
		return version;
	}
};

/**
 * Traverse the mappings object & returns the fields (leaf)
 * @param {Object} mappings
 * @returns {{ [key: string]: Array<string> }}
 */
export async function traverseMapping(
	mappings = {},
	appName,
	credentials,
	url,
	returnOnlyLeafFields = false,
) {
	const fieldObject = {};
	const version = await getVersion(appName, credentials, url);
	const checkIfPropertyPresent = (m, type) => {
		fieldObject[type] = [];
		const setFields = (mp, prefix = '') => {
			if (mp.properties) {
				Object.keys(mp.properties).forEach(mpp => {
					if (!returnOnlyLeafFields) {
						fieldObject[type].push(`${prefix}${mpp}`);
					}
					const field = mp.properties[mpp];
					if (field && field.properties) {
						setFields(field, `${prefix}${mpp}.`);
					} else if (returnOnlyLeafFields) {
						// To return only leaf fields
						fieldObject[type].push(`${prefix}${mpp}`);
					}
				});
			}
		};
		setFields(m);
	};
	if (version !== 5 || version !== 6) {
		checkIfPropertyPresent(mappings, 'properties');
	} else {
		Object.keys(mappings).forEach(k =>
			checkIfPropertyPresent(mappings[k], k),
		);
	}
	return fieldObject;
}

function getFieldsTree(mappings = {}, prefix = null) {
	let tree = {};
	Object.keys(mappings).forEach(key => {
		if (mappings[key].properties) {
			tree = {
				...tree,
				...getFieldsTree(
					mappings[key].properties,
					`${prefix ? `${prefix}.` : ''}${key}`,
				),
			};
		} else {
			const originalFields = mappings[key].fields;
			tree = {
				...tree,
				[`${prefix ? `${prefix}.` : ''}${key}`]: {
					type: mappings[key].type,
					fields: mappings[key].fields
						? Object.keys(mappings[key].fields)
						: [],
					originalFields: originalFields || {},
				},
			};
		}
	});

	return tree;
}

/**
 * returns field types with sub-fields
 * @param {Object} mappings
 * @param {String} prefix
 */
export function getMappingsTree(mappings = {}, version) {
	let tree = {};
	if (version !== 5 || version !== 6) {
		// For Elasticsearch version 7
		if (mappings.properties) {
			tree = {
				...tree,
				...getFieldsTree(mappings.properties, null),
			};
		}
	} else {
		// For Elasticsearch version below 7 for backward compatibility
		Object.keys(mappings).forEach(key => {
			if (mappings[key].properties) {
				tree = {
					...tree,
					...getFieldsTree(mappings[key].properties, null),
				};
			}
		});
	}

	return tree;
}
