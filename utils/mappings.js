import { get } from 'lodash';

import mappingUsecase from './mappingUsecase';
import analyzerSettings, { synonymsSettings } from './analyzerSettings';
import { getURL } from '../../constants/config';
import { deleteObjectFromPath } from '.';
import language from '../../constants/language';

const PRESERVED_KEYS = ['meta'];
export const REMOVED_KEYS = ['~logs', '~percolator', '.logs', '.percolator', '_default_'];

export function getAuthHeaders(credentials) {
	if (credentials) {
		return {
			Authorization: `Basic ${btoa(credentials)}`,
		};
	}
	return {};
}

export function getMappings(appName, credentials, url = getURL()) {
	return new Promise((resolve, reject) => {
		fetch(`${url}/${appName}/_mapping`, {
			method: 'GET',
			headers: {
				...getAuthHeaders(credentials),
				'Content-Type': 'application/json',
			},
		})
			.then((res) => res.json())
			.then((data) => {
				const types = Object.keys(data[appName].mappings).filter(
					(type) => !REMOVED_KEYS.includes(type),
				);

				let mappings = {};
				types.forEach((type) => {
					mappings = {
						...mappings,
						[type]: data[appName].mappings[type],
					};
				});
				resolve(mappings);
			})
			.catch((e) => {
				reject(e);
			});
	});
}

export function putMapping(appName, credentials, mappings, type, version, url = getURL()) {
	if (+version >= 7) {
		return new Promise((resolve, reject) => {
			fetch(`${url}/${appName}/_mapping`, {
				method: 'PUT',
				headers: {
					...getAuthHeaders(credentials),
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					...mappings,
				}),
			})
				.then((res) => res.json())
				.then((data) => {
					resolve(data);
				})
				.catch((e) => {
					reject(e);
				});
		});
	}
	return new Promise((resolve, reject) => {
		fetch(`${url}/${appName}/_mapping/${type}`, {
			method: 'PUT',
			headers: {
				...getAuthHeaders(credentials),
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				...mappings,
			}),
		})
			.then((res) => res.json())
			.then((data) => {
				resolve(data);
			})
			.catch((e) => {
				reject(e);
			});
	});
}

export function getSettings(appName, credentials, url = getURL()) {
	return new Promise((resolve, reject) => {
		fetch(`${url}/${appName}/_settings`, {
			method: 'GET',
			headers: {
				...getAuthHeaders(credentials),
				'Content-Type': 'application/json',
			},
		})
			.then((res) => res.json())
			.then((data) => {
				resolve(data);
			})
			.catch((e) => {
				reject(e);
			});
	});
}

export function getNodes(appName, credentials, url = getURL()) {
	return new Promise((resolve, reject) => {
		fetch(`${url}/_nodes`, {
			method: 'GET',
			headers: {
				...getAuthHeaders(credentials),
				'Content-Type': 'application/json',
			},
		})
			.then((res) => res.json())
			.then((data) => {
				resolve(data);
			})
			.catch((e) => {
				reject(e);
			});
	});
}

export function closeIndex(appName, credentials, url = getURL()) {
	return new Promise((resolve, reject) => {
		fetch(`${url}/${appName}/_close`, {
			method: 'POST',
			headers: {
				...getAuthHeaders(credentials),
				'Content-Type': 'application/json',
			},
		})
			.then((res) => res.json())
			.then((data) => {
				resolve(data);
			})
			.catch((e) => {
				reject(e);
			});
	});
}

export function updateSynonyms(appName, credentials, url = getURL(), synonymsArray) {
	return new Promise((resolve, reject) => {
		fetch(`${url}/${appName}/_settings`, {
			method: 'PUT',
			headers: {
				...getAuthHeaders(credentials),
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(synonymsSettings(synonymsArray)),
		})
			.then((res) => res.json())
			.then((data) => {
				resolve(data);
			})
			.catch((e) => {
				reject(e);
			});
	});
}

export function openIndex(appName, credentials, url = getURL()) {
	return new Promise((resolve, reject) => {
		fetch(`${url}/${appName}/_open`, {
			method: 'POST',
			headers: {
				...getAuthHeaders(credentials),
				'Content-Type': 'application/json',
			},
		})
			.then((res) => res.json())
			.then((data) => {
				resolve(data);
			})
			.catch((e) => {
				reject(e);
			});
	});
}

export async function getESVersion(appName, credentials) {
	const ACC_API = getURL();
	const response = await fetch(ACC_API, {
		headers: {
			...getAuthHeaders(credentials),
		},
	});
	const data = await response.json();
	if (response.status >= 400) {
		throw new Error(data);
	}
	return data.version.number.split('.')[0];
}

export function reIndex({
	mappings,
	appId,
	excludeFields = [],
	type,
	version = '5',
	credentials,
	settings,
}) {
	const body = {
		mappings,
		settings: settings || analyzerSettings,
		exclude_fields: excludeFields,
		type,
		es_version: version,
	};
	if (version >= 7) {
		delete body.type;
		const { properties, ...rest } = mappings;
		body.mappings = { properties: { ...properties }, ...rest };
	}

	return new Promise((resolve, reject) => {
		const ACC_API = getURL();
		fetch(`${ACC_API}/_reindex/${appId}`, {
			method: 'POST',
			headers: {
				...getAuthHeaders(credentials),
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		})
			.then((res) => {
				if (res.status === 504) {
					resolve('~100');
				}
				return res;
			})
			.then((res) => res.json())
			.then((data) => {
				if (data.error) {
					reject(data.error);
				}
				if (data.code >= 400) {
					reject(data.message);
				}
				resolve(data);
			})
			.catch((e) => {
				reject(e);
			});
	});
}

export function hasAggs(field) {
	if (!field) return false;
	let hasAggsFlag = false;
	Object.keys(field).forEach((subField) => {
		if (
			field[subField].type === 'keyword' ||
			(field[subField].type === 'string' && field[subField].index === 'not_analyzed') // for ES2
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

	Object.keys(_mapping).every((key) => {
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
		} else if (typeof _mapping[key] === 'object' && !Array.isArray(_mapping[key])) {
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
 * Traverse the mappings object & returns the fields (leaf)
 * @param {Object} mappings
 * @returns {{ [key: string]: Array<string> | Array<string> }}
 * For v7 apps it'll return an array of fields instead of an object
 */
export function traverseMapping(mappings = {}, returnOnlyLeafFields = false) {
	const fieldObject = {};
	const checkIfPropertyPresent = (m, type) => {
		fieldObject[type] = [];
		const setFields = (mp, prefix = '') => {
			if (mp.properties) {
				Object.keys(mp.properties).forEach((mpp) => {
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
	if (mappings.properties) {
		checkIfPropertyPresent(mappings, 'properties');
	} else {
		Object.keys(mappings).forEach((k) => checkIfPropertyPresent(mappings[k], k));
	}
	return fieldObject.properties ? fieldObject.properties : fieldObject;
}

export function getAggsMappings(mappings = {}, returnOnlyLeafFields = false) {
	const fieldObject = {};
	const checkIfPropertyPresent = (m, type) => {
		fieldObject[type] = [];
		const setFields = (mp, prefix = '') => {
			if (mp.properties) {
				Object.keys(mp.properties).forEach((mpp) => {
					if (!returnOnlyLeafFields) {
						fieldObject[type].push({
							address: `${prefix}${mpp}`,
							type,
						});
					}
					const field = mp.properties[mpp];
					if (field && field.properties) {
						setFields(field, `${prefix}${mpp}.`);
					} else if (returnOnlyLeafFields) {
						// To return only leaf fields
						fieldObject[type].push({
							address: `${prefix}${mpp}`,
							usecase: field.fields ? getUsecase(field.fields) : 'none',
							type,
							fields: field.fields,
							fieldType: field.type,
						});
					}
				});
			}
		};
		setFields(m);
	};
	if (mappings.properties) {
		checkIfPropertyPresent(mappings, 'properties');
	} else {
		Object.keys(mappings).forEach((k) => checkIfPropertyPresent(mappings[k], k));
	}

	return fieldObject.properties
		? fieldObject.properties
		: Object.keys(fieldObject).reduce((agg, item) => {
				return [...agg, ...fieldObject[item]];
		  }, []);
}

function getFieldsTree(mappings = {}, prefix = null) {
	let tree = {};
	Object.keys(mappings).forEach((key) => {
		if (mappings[key].properties) {
			tree = {
				...tree,
				...getFieldsTree(mappings[key].properties, `${prefix ? `${prefix}.` : ''}${key}`),
			};
		} else {
			const originalFields = mappings[key].fields;
			tree = {
				...tree,
				[`${prefix ? `${prefix}.` : ''}${key}`]: {
					type: mappings[key].type,
					fields: mappings[key].fields ? Object.keys(mappings[key].fields) : [],
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
	if (+version >= 7) {
		// For Elasticsearch version 7
		if (mappings.properties) {
			tree = {
				...tree,
				...getFieldsTree(mappings.properties, null),
			};
		}
	} else {
		Object.keys(mappings).forEach((key) => {
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

export const applyLanguageAnalyzers = (properties = {}, language) => {
	const lang = {
		type: 'text',
		analyzer: language,
	};
	const synonyms = {
		analyzer: 'synonyms',
		type: 'text',
	};
	return Object.keys(properties).reduce((agg, key) => {
		if (properties[key].properties) {
			return {
				...agg,
				[key]: {
					...properties[key],
					properties: applyLanguageAnalyzers(properties[key].properties),
				},
			};
		}
		const data = properties[key];
		// eslint-disable-next-line prefer-const
		let { type, fields } = properties[key];
		if (type === 'text') {
			if (fields) {
				fields.lang = lang;
				fields.synonyms = synonyms;
			} else {
				fields = { lang, synonyms };
			}
		}
		data.fields = fields;
		return { ...agg, [key]: data };
	}, {});
};

export const updateMappingsProperties = ({
	mapping: originalMapping,
	types,
	esVersion,
	language = 'universal',
}) => {
	const mapping = JSON.parse(JSON.stringify(originalMapping));
	let isMappingsPresent = false;
	if (+esVersion >= 7) {
		isMappingsPresent = mapping && mapping.properties;
	} else {
		isMappingsPresent = mapping && types[0] && mapping[types[0]];
	}
	if (isMappingsPresent) {
		if (+esVersion >= 7) {
			const updatedProperties = applyLanguageAnalyzers(
				JSON.parse(JSON.stringify(mapping.properties)),
				language,
			);
			mapping.properties = {
				...mapping.properties,
				...updatedProperties,
			};
		} else {
			return types.reduce((agg, type) => {
				return {
					...agg,
					[type]: mapping[type].properties
						? {
								properties: applyLanguageAnalyzers(
									mapping[type].properties,
									language,
								),
						  }
						: mapping[type],
				};
			}, {});
		}
	}
	return mapping;
};

export const getUpdatedSettings = ({ settings, shards, replicas }) => {
	const updatedSettings = {
		index: {
			number_of_shards: shards,
			number_of_replicas: replicas,
		},
	};
	if (settings && settings.index && settings.index.analysis) {
		const {
			index: {
				analysis: { analyzer: currentAnalyzer, filter: currentFilter },
			},
		} = settings;
		const {
			analysis: { analyzer, filter },
		} = analyzerSettings;

		Object.keys(analyzer).forEach((key) => {
			if (!currentAnalyzer[key]) {
				currentAnalyzer[key] = analyzer[key];
			}
		});

		Object.keys(filter).forEach((key) => {
			if (!currentFilter[key]) {
				currentFilter[key] = filter[key];
			}
		});

		updatedSettings.index.analysis = settings.index.analysis;

		return updatedSettings;
	}
	updatedSettings.index.analysis = analyzerSettings.analysis;
	return updatedSettings;
};

export const applySynonyms = async ({
	appName,
	credentials,
	url,
	synonyms,
	mapping,
	types,
	esVersion,
}) => {
	try {
		const closeResponse = await closeIndex(appName, credentials, url);
		if (
			closeResponse &&
			closeResponse.Message &&
			closeResponse.Message.includes('is not allowed by Amazon Elasticsearch Service.')
		) {
			throw new Error('AWS');
		}
		const synonymResponse = await updateSynonyms(appName, credentials, url, synonyms);

		if (synonymResponse.acknowledged) {
			// If synonyms request is successful than update mapping via PUT request
			const indexResponse = await openIndex(appName, credentials, url);

			if (indexResponse.acknowledged) {
				const updatedMappings = updateMappingsProperties({
					esVersion,
					types,
					mapping,
				});
				let mappings = {};
				if (+esVersion >= 7) {
					mappings = updatedMappings;
				} else {
					mappings = updatedMappings[types[0]];
				}
				const mappingResponse = await putMapping(
					appName,
					credentials,
					mappings,
					types[0],
					esVersion,
				);
				if (mappingResponse.acknowledged) {
					return 'Updated';
				}
			} else {
				throw new Error('');
			}
		} else {
			throw new Error('Unable to update Synonyms');
		}
	} catch (e) {
		await openIndex(appName, credentials, url);
		console.log(e);
		throw e;
	}

	return null;
};

export const getLanguage = (settings) => {
	return Object.keys(language).find((lang) => {
		if (get(settings, `index.analysis.analyzer.${lang}`, null)) return lang;
		return null;
	});
};

export const getUsecase = (fields) => {
	const hasAggsFlag = hasAggs(fields);
	let hasSearchFlag = 0;
	if (fields.search || fields.autosuggest || fields.delimiter) hasSearchFlag = 1;

	if (hasAggsFlag && hasSearchFlag) return 'searchaggs';
	if (!hasAggsFlag && hasSearchFlag) return 'search';
	if (hasAggsFlag && !hasSearchFlag) return 'aggs';
	return 'none';
};

export const fetchSettings = ({ appName, credentials }) => {
	return getSettings(appName, credentials).then((data) => {
		const shards = get(data[appName], 'settings.index.number_of_shards');
		const replicas = get(data[appName], 'settings.index.number_of_replicas');
		const synonyms = get(
			data[appName],
			'settings.index.analysis.filter.synonyms_filter.synonyms',
			[],
		).join('\n');

		return { shards, replicas, synonyms };
	});
};

export const deleteMappingField = ({
	esVersion,
	removeType,
	types,
	_deletedPaths,
	_mapping,
	path,
}) => {
	const mapping = JSON.parse(JSON.stringify(_mapping));

	let activeType = types;
	let deletedPaths = [..._deletedPaths];

	if (esVersion < 7) {
		let fields = path.split('.');
		if (fields[fields.length - 1] === 'properties') {
			// when deleting an object
			fields = fields.slice(0, -1);
		}

		if (removeType) {
			const type = fields[0];
			// remove from active types
			activeType = activeType.filter((field) => field !== type);

			// add all the fields to excludeFields
			const deletedTypesPath = Object.keys(_mapping[type]).map(
				(property) => `${type}.properties.${property}`,
			);
			deletedPaths = [...deletedPaths, ...deletedTypesPath];
		} else {
			deletedPaths = [..._deletedPaths, path];
		}

		fields.reduce((acc, val, index) => {
			if (index === fields.length - 1) {
				delete acc[val];
				return true;
			}
			return acc[val];
		}, mapping);
	} else if (removeType) {
		const field = path
			.split('.')
			.slice(1, path.split('.').length - 1)
			.pop();

		if (field) {
			const pathToDelete = path
				.split('.')
				.slice(1, path.split('.').length - 1)
				.join('.');
			deletedPaths = [...deletedPaths, pathToDelete];
			deleteObjectFromPath(mapping, pathToDelete);
		} else {
			const pathsToDelete = Object.keys(mapping.properties);
			deletedPaths = pathsToDelete;
			delete mapping.properties;
		}
	} else {
		const pathToDelete = path.split('.').slice(1).join('.');
		deletedPaths = [...deletedPaths, pathToDelete];
		deleteObjectFromPath(mapping, path.split('.').slice(1).join('.'));
	}

	return {
		deletedPaths,
		mapping,
		activeType,
	};
};

export const addMappingField = ({ _mapping, name, usecase, type, esVersion }) => {
	const mapping = JSON.parse(JSON.stringify(_mapping));
	let newUsecase = {};

	if (usecase) {
		newUsecase = mappingUsecase[usecase];
	}

	const fieldChanged = name.split('.')[1];
	if (+esVersion >= 7) {
		mapping.properties[fieldChanged] = {
			type,
			...newUsecase,
		};
	} else {
		mapping._doc.properties[fieldChanged] = {
			type,
			...newUsecase,
		};
	}

	return { mapping };
};

export const updateSettings = ({ appName, settings, credentials }) => {
	const url = getURL();
	return new Promise((resolve, reject) => {
		fetch(`${url}/${appName}/_settings`, {
			method: 'PUT',
			headers: {
				...getAuthHeaders(credentials),
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				settings,
			}),
		})
			.then((res) => res.json())
			.then((data) => {
				resolve(data);
			})
			.catch((e) => {
				reject(e);
			});
	});
};
