import { getAppIndexName, isSystemIndex } from '../index';

describe('isSystemIndex', () => {
	it('treats dot-prefixed indices as system indices', () => {
		expect(isSystemIndex('.kibana')).toBe(true);
	});

	it('treats metricbeat indices as system indices', () => {
		expect(isSystemIndex('metricbeat-7.10.0')).toBe(true);
	});

	it('treats rs_ indices as system indices regardless of backend', () => {
		expect(isSystemIndex('rs_rs-synonyms')).toBe(true);
		expect(isSystemIndex('rs_ai_faqs')).toBe(true);
		expect(isSystemIndex('rs_saved_searches')).toBe(true);
	});

	it('does not treat user indices as system indices', () => {
		expect(isSystemIndex('movies')).toBe(false);
		expect(isSystemIndex('products')).toBe(false);
	});
});

describe('getAppIndexName', () => {
	it('resolves index name from index, alias, or name', () => {
		expect(getAppIndexName({ index: 'movies' })).toBe('movies');
		expect(getAppIndexName({ alias: 'movies-alias' })).toBe('movies-alias');
		expect(getAppIndexName({ name: 'movies-name' })).toBe('movies-name');
		expect(getAppIndexName({ index: 'movies', alias: 'alias' })).toBe('movies');
	});
});
