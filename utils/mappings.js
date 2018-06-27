import mappingUsecase from './mappingUsecase';
import analyzerSettings from './analyzerSettings';
import { SCALR_API } from './index';

const PRESERVED_KEYS = ['meta'];
const REMOVED_KEYS = ['~logs', '~percolator', '.logs', '.percolator', '_default_'];

export function getMappings(appName, credentials) {
	return new Promise((resolve, reject) => {
		fetch(`${SCALR_API}/${appName}/_mapping`, {
			method: 'GET',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Basic ${btoa(credentials)}`,
			},
		})
			.then(res => res.json())
			.then((data) => {
				const types = Object
					.keys(data[appName].mappings)
					.filter(type => !REMOVED_KEYS.includes(type));

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

export function reIndex(mappings, appId) {
	const body = {
		mappings,
		settings: analyzerSettings,
		es_version: '5',
	};
	return new Promise((resolve, reject) => {
		fetch(`https://accapi-staging.bottleneck.io/app/${appId}/reindex`, {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		})
			.then(res => res.json())
			.then((data) => {
				if (data.status === 200) resolve(data);
				else reject(data.error.reason);
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
			field[subField].type === 'keyword'
			|| (field[subField].type === 'string' && field[subField].index === 'not_analyzed') // for ES2
		) {
			hasAggsFlag = true;
		}
	});
	return hasAggsFlag;
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
		} else if (!Array.isArray(_mapping[key]) && typeof (_mapping[key]) !== 'string') {
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

export function updateMapping(mapping, field, type, usecase) {
	// eslint-disable-next-line
	let _mapping = { ...mapping };

	Object.keys(_mapping).forEach((key) => {
		if (PRESERVED_KEYS.includes(key)) return _mapping;

		if (key === field) {
			let newUsecase = {};
			if (usecase) {
				newUsecase = mappingUsecase[usecase];
			}
			_mapping = {
				..._mapping,
				[key]: {
					...newUsecase,
					type,
				},
			};
		} else if (!Array.isArray(_mapping[key]) && typeof (_mapping[key]) !== 'string') {
			_mapping = {
				..._mapping,
				[key]: {
					..._mapping[key],
					...updateMapping(_mapping[key], field, type, usecase),
				},
			};
		}
	});
	return _mapping;
}
