import get from 'lodash/get';
import moment from 'moment';

export const TIME_FILTER = {
	'now-5m': { label: 'Last 5 minutes', interval: '45s' },
	'now-1h': { label: 'Last 1 hour', interval: '10m' },
	'now-3h': { label: 'Last 3 hours', interval: '30m' },
	'now-12h': { label: 'Last 12 hours', interval: '1h' },
	'now-1d': { label: 'Last 24 hours', interval: '2h' },
	'now-7d': { label: 'Last 7 days', interval: '1d' },
};

export const getMonitoringSearchConfig = ({ username, password, url }) => ({
	url: `${url}/metricbeat-*/_msearch`,
	method: 'POST',
	headers: {
		Authorization: `Basic ${btoa(`${username}:${password}`)}`,
		'Content-Type': 'application/x-ndjson',
	},
});

export const formatSizeUnits = (byte) => {
	const bytes = byte;
	// if (bytes >= 1073741824) {
	// 	bytes = `${(bytes / 1073741824).toFixed(2)} GB`;
	// } else if (bytes >= 1048576) {
	// 	bytes = `${(bytes / 1048576).toFixed(2)} MB`;
	// } else if (bytes >= 1024) {
	// 	bytes = `${(bytes / 1024).toFixed(2)} KB`;
	// } else if (bytes > 1) {
	// 	bytes += ' bytes';
	// } else if (bytes === 1) {
	// 	bytes += ' byte';
	// } else {
	// 	bytes = '0 bytes';
	// }

	return `${(bytes / 1073741824).toFixed(2)} GB`;
};

export const fetchOverviewData = async (config, timeFilter) => {
	try {
		const {
			esURL,
			esUsername,
			esPassword,
			isAppbase,
			arcURL,
			kibanaURL,
			kibanaUsername,
			kibanaPassword,
		} = config;

		const esStatus = `{"size":0,"aggs":{"status":{"top_hits":{"sort":[{"@timestamp":{"order":"desc"}}],"size":1,"_source":{"includes":["@timestamp","elasticsearch.*"]}}}},"query":{"bool":{"must":[{"bool":{"filter":[{"term":{"metricset.name":"cluster_stats"}}]}},{"range":{"@timestamp":{"gte":"${timeFilter}","lte":"now"}}}]}}}`;

		const uptime = `{"size":0,"aggs":{"instances":{"terms":{"field":"cloud.instance.id"},"aggs":{"uptimes":{"top_hits":{"sort":[{"@timestamp":{"order":"desc"}}],"size":1,"_source":{"includes":["@timestamp","system.uptime.duration*", "cloud.instance.*"]}}}}}},"query":{"bool":{"must":[{"bool":{"filter":[{"term":{"metricset.name":"uptime"}}]}},{"range":{"@timestamp":{"gte":"now-1h","lte":"now"}}}]}}}`;

		const liveNodes = `{"size":0,"aggs":{"instances":{"terms":{"field":"cloud.instance.id"},"aggs":{"cpu":{"top_hits":{"sort":[{"@timestamp":{"order":"desc"}}],"size":1,"_source":{"includes":["@timestamp","system.cpu.total*"]}}}}}},"query":{"bool":{"must":[{"bool":{"filter":[{"term":{"metricset.name":"cpu"}}]}},{"range":{"@timestamp":{"gte":"${timeFilter}","lte":"now"}}}]}}}`;

		const esSearchConfig = getMonitoringSearchConfig({
			url: esURL,
			password: esPassword,
			username: esUsername,
		});

		const esRes = await fetch(esSearchConfig.url, {
			method: esSearchConfig.method,
			headers: esSearchConfig.headers,
			body: `{"preference": "cluster_health"}\n${esStatus}\n{"preference": "uptime"}\n${uptime}\n{"preference": "live_nodes"}\n${liveNodes}\n`,
		});

		const esData = await esRes.json();
		let arcFetchEndpoint = `${esURL}/arc/plan`;
		if (!isAppbase) {
			arcFetchEndpoint = `${arcURL}/arc/plan`;
		}

		const arcRes = await fetch(arcFetchEndpoint);
		let arcStatus = 'green';
		if (arcRes.status > 400) {
			arcStatus = 'red';
		}

		let kibanaData = null;
		if (kibanaURL) {
			// fetch kibana data
			const kibanaRes = await fetch(`${kibanaURL}/api/status`, {
				headers: {
					Authorization: `Basic ${btoa(`${kibanaUsername}:${kibanaPassword}`)}`,
				},
			});

			kibanaData = await kibanaRes.json();
		}

		const currentNodes = get(esData, 'responses.2.aggregations.instances.buckets').map(
			(i) => i.key,
		);

		const uptimes = get(esData, 'responses.1.aggregations.instances.buckets')
			.map((item) => {
				const hours = Math.ceil(
					get(item.uptimes, 'hits.hits.0._source.system.uptime.duration.ms', 0) /
						(1000 * 60 * 60),
				);
				let uptimeData = `${hours} hrs`;
				if (hours > 100) {
					uptimeData = `${Math.ceil(hours / 24)} days`;
				}
				return {
					nodeId: get(item.uptimes, 'hits.hits.0._source.cloud.instance.id'),
					node: get(
						item.uptimes,
						'hits.hits.0._source.cloud.instance.name',
						get(item.uptimes, 'hits.hits.0._source.cloud.instance.id'),
					),
					uptime: uptimeData,
				};
			})
			.filter((item) => currentNodes.includes(item.nodeId));
		return {
			esStatus: get(
				esData,
				'responses.0.aggregations.status.hits.hits.0._source.elasticsearch.cluster.stats.status',
				null,
			),
			arcStatus,
			kibanaStatus: get(kibanaData, 'status.overall.state', null),
			uptime: uptimes,
		};
	} catch (err) {
		throw err;
	}
};

export const fetchNodeSummaryData = async (config, timeFilter) => {
	try {
		const { esURL, esUsername, esPassword } = config;

		const cpuUsage = `{"size":0,"aggs":{"instances":{"terms":{"field":"cloud.instance.id"},"aggs":{"cpu":{"top_hits":{"sort":[{"@timestamp":{"order":"desc"}}],"size":1,"_source":{"includes":["@timestamp","system.cpu.total*"]}}}}}},"query":{"bool":{"must":[{"bool":{"filter":[{"term":{"metricset.name":"cpu"}}]}},{"range":{"@timestamp":{"gte":"${timeFilter}","lte":"now"}}}]}}}`;

		const jvmHeap = `{"size":0,"aggs":{"instances":{"terms":{"field":"cloud.instance.id"},"aggs":{"jvm":{"top_hits":{"sort":[{"@timestamp":{"order":"desc"}}],"size":1,"_source":{"includes":["@timestamp","elasticsearch.node.stats.jvm.mem.heap*"]}}}}}},"query":{"bool":{"must":[{"bool":{"filter":[{"term":{"metricset.name":"node_stats"}}]}},{"range":{"@timestamp":{"gte":"${timeFilter}","lte":"now"}}}]}}}`;

		const memory = `{"size":0,"aggs":{"instances":{"terms":{"field":"cloud.instance.id"},"aggs":{"memory":{"top_hits":{"sort":[{"@timestamp":{"order":"desc"}}],"size":1,"_source":{"includes":["@timestamp","system.memory*"]}}}}}},"query":{"bool":{"must":[{"bool":{"filter":[{"term":{"metricset.name":"memory"}}]}},{"range":{"@timestamp":{"gte":"${timeFilter}","lte":"now"}}}]}}}`;

		const disk = `{"size":0,"aggs":{"instances":{"terms":{"field":"cloud.instance.id"},"aggs":{"disk":{"top_hits":{"sort":[{"@timestamp":{"order":"desc"}}],"size":1,"_source":{"includes":["@timestamp","elasticsearch.node.stats.fs.summary*"]}}}}}},"query":{"bool":{"must":[{"bool":{"filter":[{"term":{"metricset.name":"node_stats"}}]}},{"range":{"@timestamp":{"gte":"${timeFilter}","lte":"now"}}}]}}}`;

		const esSearchConfig = getMonitoringSearchConfig({
			url: esURL,
			password: esPassword,
			username: esUsername,
		});

		const esRes = await fetch(esSearchConfig.url, {
			method: esSearchConfig.method,
			headers: esSearchConfig.headers,
			body: `{"preference": "cpu_usage"}\n${cpuUsage}\n{"preference": "jvm_heap"}\n${jvmHeap}\n{"preference": "memory"}\n${memory}\n{"preference": "disk"}\n${disk}\n`,
		});

		const { responses } = await esRes.json();
		const instanceBuckets = get(responses[0], 'aggregations.instances.buckets');
		if (!instanceBuckets.length) {
			return null;
		}
		const cpuUsageString = `${(
			(get(responses[0], 'aggregations.instances.buckets').reduce(
				(agg, item) => agg + get(item.cpu, 'hits.hits.0._source.system.cpu.total.norm.pct'),
				0,
			) /
				get(responses[0], 'aggregations.instances.buckets').length) *
			100
		).toFixed(2)}%`;

		const jvmHeapTuple = get(responses[1], 'aggregations.instances.buckets').reduce(
			(agg, item) => [
				agg[0] +
					get(
						item.jvm,
						'hits.hits.0._source.elasticsearch.node.stats.jvm.mem.heap.used.bytes',
					),
				agg[1] +
					get(
						item.jvm,
						'hits.hits.0._source.elasticsearch.node.stats.jvm.mem.heap.max.bytes',
					),
			],
			[0, 0],
		);
		const jvmHeapString = `${((jvmHeapTuple[0] / jvmHeapTuple[1]) * 100).toFixed(
			1,
		)}% (${formatSizeUnits(jvmHeapTuple[0])} / ${formatSizeUnits(jvmHeapTuple[1])})`;

		const memoryTuple = get(responses[2], 'aggregations.instances.buckets').reduce(
			(agg, item) => {
				return [
					agg[0] +
						get(item.memory, 'hits.hits.0._source.system.memory.actual.used.bytes'),
					agg[1] +
						get(item.memory, 'hits.hits.0._source.system.memory.actual.free') +
						get(item.memory, 'hits.hits.0._source.system.memory.actual.used.bytes'),
				];
			},
			[0, 0],
		);

		const memoryString = `${((memoryTuple[0] / memoryTuple[1]) * 100).toFixed(
			1,
		)}% (${formatSizeUnits(memoryTuple[0])} / ${formatSizeUnits(memoryTuple[1])})`;

		const diskTuple = get(responses[3], 'aggregations.instances.buckets').reduce(
			(agg, item) => [
				agg[0] +
					get(
						item.disk,
						'hits.hits.0._source.elasticsearch.node.stats.fs.summary.available.bytes',
					),

				agg[1] +
					get(
						item.disk,
						'hits.hits.0._source.elasticsearch.node.stats.fs.summary.total.bytes',
					),
			],
			[0, 0],
		);

		const diskString = `${((diskTuple[0] / diskTuple[1]) * 100).toFixed(1)}% (${formatSizeUnits(
			diskTuple[0],
		)} / ${formatSizeUnits(diskTuple[1])})`;
		return {
			nodes: get(responses[0], 'aggregations.instances.buckets').length,
			cpuUsage: cpuUsageString,
			jvmHeap: jvmHeapString,
			memory: memoryString,
			disk: diskString,
		};
	} catch (err) {
		throw err;
	}
};

export const fetchIndicesData = async (config, timeFilter) => {
	try {
		const { esURL, esUsername, esPassword } = config;

		const clusterStats = `{"size":0,"aggs":{"cluster":{"top_hits":{"sort":[{"@timestamp":{"order":"desc"}}],"size":1,"_source":{"includes":["@timestamp","elasticsearch.cluster.stats.indices*"]}}}},"query":{"bool":{"must":[{"bool":{"filter":[{"term":{"metricset.name":"cluster_stats"}}]}},{"range":{"@timestamp":{"gte":"${timeFilter}","lte":"now"}}}]}}}`;

		const indicesSummary = `{"size":0,"aggs":{"indices":{"top_hits":{"sort":[{"@timestamp":{"order":"desc"}}],"size":1,"_source":{"includes":["@timestamp","elasticsearch.index.summary*"]}}}},"query":{"bool":{"must":[{"bool":{"filter":[{"term":{"metricset.name":"index_summary"}}]}},{"range":{"@timestamp":{"gte":"${timeFilter}","lte":"now"}}}]}}}`;

		const esSearchConfig = getMonitoringSearchConfig({
			url: esURL,
			password: esPassword,
			username: esUsername,
		});

		const esRes = await fetch(esSearchConfig.url, {
			method: esSearchConfig.method,
			headers: esSearchConfig.headers,
			body: `{"preference": "cluster_stats"}\n${clusterStats}\n{"preference": "indices_summary"}\n${indicesSummary}\n`,
		});

		const { responses } = await esRes.json();
		if (!get(responses[0], 'aggregations.cluster.hits.hits').length) {
			return null;
		}

		return {
			indices: get(
				responses[0],
				'aggregations.cluster.hits.hits.0._source.elasticsearch.cluster.stats.indices.total',
			).toLocaleString(),
			documents: get(
				responses[1],
				'aggregations.indices.hits.hits.0._source.elasticsearch.index.summary.total.docs.count',
			).toLocaleString(),
			data: formatSizeUnits(
				get(
					responses[1],
					'aggregations.indices.hits.hits.0._source.elasticsearch.index.summary.total.store.size.bytes',
				),
			),
			primaryShards: get(
				responses[0],
				'aggregations.cluster.hits.hits.0._source.elasticsearch.cluster.stats.indices.shards.primaries',
			).toLocaleString(),
			replicaShards: (
				get(
					responses[0],
					'aggregations.cluster.hits.hits.0._source.elasticsearch.cluster.stats.indices.shards.count',
				) -
				get(
					responses[0],
					'aggregations.cluster.hits.hits.0._source.elasticsearch.cluster.stats.indices.shards.primaries',
				)
			).toLocaleString(),
		};
	} catch (err) {
		throw err;
	}
};

export const fetchNodeStats = async (config, timeFilter) => {
	try {
		const { esURL, esUsername, esPassword } = config;

		const nodes = `{"size":0,"aggs":{"instances":{"terms":{"field":"cloud.instance.id"},"aggs":{"nodes":{"top_hits":{"sort":[{"@timestamp":{"order":"desc"}}],"size":1,"_source":{"includes":["@timestamp", "cloud.instance*"]}}}}}},"query":{"bool":{"must":[{"bool":{"filter":[{"term":{"metricset.name":"cpu"}}]}},{"range":{"@timestamp":{"gte":"${timeFilter}","lte":"now"}}}]}}}`;

		const cpuUsage = `{"size":0,"aggs":{"instances":{"terms":{"field":"cloud.instance.id"},"aggs":{"cpu":{"top_hits":{"sort":[{"@timestamp":{"order":"desc"}}],"size":1,"_source":{"includes":["@timestamp","system.cpu.total*"]}}}}}},"query":{"bool":{"must":[{"bool":{"filter":[{"term":{"metricset.name":"cpu"}}]}},{"range":{"@timestamp":{"gte":"${timeFilter}","lte":"now"}}}]}}}`;

		const jvmHeap = `{"size":0,"aggs":{"instances":{"terms":{"field":"cloud.instance.id"},"aggs":{"jvm":{"top_hits":{"sort":[{"@timestamp":{"order":"desc"}}],"size":1,"_source":{"includes":["@timestamp","elasticsearch.node.stats.jvm.mem.heap*"]}}}}}},"query":{"bool":{"must":[{"bool":{"filter":[{"term":{"metricset.name":"node_stats"}}]}},{"range":{"@timestamp":{"gte":"${timeFilter}","lte":"now"}}}]}}}`;

		const memory = `{"size":0,"aggs":{"instances":{"terms":{"field":"cloud.instance.id"},"aggs":{"memory":{"top_hits":{"sort":[{"@timestamp":{"order":"desc"}}],"size":1,"_source":{"includes":["@timestamp","system.memory.actual*"]}}}}}},"query":{"bool":{"must":[{"bool":{"filter":[{"term":{"metricset.name":"memory"}}]}},{"range":{"@timestamp":{"gte":"${timeFilter}","lte":"now"}}}]}}}`;

		const disk = `{"size":0,"aggs":{"instances":{"terms":{"field":"cloud.instance.id"},"aggs":{"disk":{"top_hits":{"sort":[{"@timestamp":{"order":"desc"}}],"size":1,"_source":{"includes":["@timestamp","elasticsearch.*"]}}}}}},"query":{"bool":{"must":[{"bool":{"filter":[{"term":{"metricset.name":"node_stats"}}]}},{"range":{"@timestamp":{"gte":"${timeFilter}","lte":"now"}}}]}}}`;

		const esSearchConfig = getMonitoringSearchConfig({
			url: esURL,
			password: esPassword,
			username: esUsername,
		});
		const esRes = await fetch(esSearchConfig.url, {
			method: esSearchConfig.method,
			headers: esSearchConfig.headers,
			body: `{"preference": "node_count"}\n${nodes}\n{"preference": "cpu_usage"}\n${cpuUsage}\n{"preference": "jvm_heap"}\n${jvmHeap}\n{"preference": "memory"}\n${memory}\n{"preference": "disk"}\n${disk}\n{"preference": "indices"}\n`,
		});
		const { responses } = await esRes.json();

		const nodeBucket = get(responses[0], 'aggregations.instances.buckets');

		const data = nodeBucket.map((bucket) => {
			const cpuDetails = get(responses[1], 'aggregations.instances.buckets').find(
				(i) => i.key === bucket.key,
			);
			const jvmHeapDetails = get(responses[2], 'aggregations.instances.buckets').find(
				(i) => i.key === bucket.key,
			);
			const memoryDetails = get(responses[3], 'aggregations.instances.buckets').find(
				(i) => i.key === bucket.key,
			);
			const diskDetails = get(responses[4], 'aggregations.instances.buckets').find(
				(i) => i.key === bucket.key,
			);

			return {
				key: bucket.key,
				name: get(
					bucket,
					'nodes.hits.hits.0._source.cloud.instance.name',
					get(bucket, 'nodes.hits.hits.0._source.cloud.instance.id'),
				),
				cpuUsage: `${(
					get(cpuDetails, 'cpu.hits.hits.0._source.system.cpu.total.norm.pct') * 100
				).toFixed(2)}%`,
				jvmHeap: `${formatSizeUnits(
					get(
						jvmHeapDetails,
						'jvm.hits.hits.0._source.elasticsearch.node.stats.jvm.mem.heap.used.bytes',
					),
				)} / ${formatSizeUnits(
					get(
						jvmHeapDetails,
						'jvm.hits.hits.0._source.elasticsearch.node.stats.jvm.mem.heap.max.bytes',
					),
				)}`,
				memory: `${formatSizeUnits(
					get(
						memoryDetails,
						'memory.hits.hits.0._source.system.memory.actual.used.bytes',
					),
				)} / ${formatSizeUnits(
					get(memoryDetails, 'memory.hits.hits.0._source.system.memory.actual.free') +
						get(
							memoryDetails,
							'memory.hits.hits.0._source.system.memory.actual.used.bytes',
						),
				)}`,
				disk: `${formatSizeUnits(
					get(
						diskDetails,
						'disk.hits.hits.0._source.elasticsearch.node.stats.fs.summary.available.bytes',
					),
				)} / ${formatSizeUnits(
					get(
						diskDetails,
						'disk.hits.hits.0._source.elasticsearch.node.stats.fs.summary.total.bytes',
					),
				)}`,
				documents: get(
					diskDetails,
					'disk.hits.hits.0._source.elasticsearch.node.stats.indices.docs.count',
				).toLocaleString(),
			};
		});
		return data;
	} catch (err) {
		throw err;
	}
};

export const fetchGraphData = async (config, timeFilter, nodeId) => {
	const cpuSet = `{"size":0,"aggs":{"time_intervals":{"date_histogram":{"field":"@timestamp","fixed_interval":"${get(
		TIME_FILTER,
		`${timeFilter}.interval`,
		'1h',
	)}"},"aggs":{"cpu":{"top_hits":{"sort":[{"@timestamp":{"order":"desc"}}],"size":1,"_source":{"includes":[]}}}}}},"query":{"bool":{"filter":[{"range":{"@timestamp":{"gte":"${timeFilter}","lte":"now"}}},{"term":{"cloud.instance.id":"${nodeId}"}},{"term":{"metricset.name":"cpu"}}]}}}`;

	const nodeSet = `{"size":0,"aggs":{"time_intervals":{"date_histogram":{"field":"@timestamp","fixed_interval":"${get(
		TIME_FILTER,
		`${timeFilter}.interval`,
		'1h',
	)}"},"aggs":{"node_stats":{"top_hits":{"sort":[{"@timestamp":{"order":"desc"}}],"size":1,"_source":{"includes":[]}}}}}},"query":{"bool":{"filter":[{"range":{"@timestamp":{"gte":"${timeFilter}","lte":"now"}}},{"term":{"cloud.instance.id":"${nodeId}"}},{"term":{"metricset.name":"node_stats"}}]}}}`;

	const memorySet = `{"size":0,"aggs":{"time_intervals":{"date_histogram":{"field":"@timestamp","fixed_interval":"${get(
		TIME_FILTER,
		`${timeFilter}.interval`,
		'1h',
	)}"},"aggs":{"memory":{"top_hits":{"sort":[{"@timestamp":{"order":"desc"}}],"size":1,"_source":{"includes":[]}}}}}},"query":{"bool":{"filter":[{"range":{"@timestamp":{"gte":"${timeFilter}","lte":"now"}}},{"term":{"cloud.instance.id":"${nodeId}"}},{"term":{"metricset.name":"memory"}}]}}}`;

	const { esURL, esUsername, esPassword } = config;

	const esSearchConfig = getMonitoringSearchConfig({
		url: esURL,
		password: esPassword,
		username: esUsername,
	});
	const esRes = await fetch(esSearchConfig.url, {
		method: esSearchConfig.method,
		headers: esSearchConfig.headers,
		body: `{"preference": "cpuSet"}\n${cpuSet}\n{"preference": "nodeSet"}\n${nodeSet}\n{"preference": "memorySet"}\n${memorySet}\n`,
	});

	const { responses } = await esRes.json();

	const getDateIntervalValue = (dateValue) => {
		const isDayInterval = timeFilter === 'now-7d';
		const isSecondInterval = timeFilter === 'now-5m';
		if (isDayInterval) {
			return moment.utc(dateValue).local().format('DD-MMM');
		}
		if (isSecondInterval) {
			moment.utc(dateValue).local().format('HH:mm:ss');
		}

		return moment.utc(dateValue).local().format('HH:mm');
	};

	return {
		cpuUsage: get(responses[0], 'aggregations.time_intervals.buckets').map((item) => ({
			key: item.key,
			date: getDateIntervalValue(item.key_as_string),
			data: Number(
				(get(item, 'cpu.hits.hits.0._source.system.cpu.total.norm.pct') * 100).toFixed(2),
			),
		})),
		diskAvailable: get(responses[1], 'aggregations.time_intervals.buckets').map((item) => ({
			key: item.key,
			date: getDateIntervalValue(item.key_as_string),
			data: Number(
				(
					get(
						item,
						'node_stats.hits.hits.0._source.elasticsearch.node.stats.fs.summary.available.bytes',
					) / 1073741824
				).toFixed(2),
			),
		})),
		jvmHeap: get(responses[1], 'aggregations.time_intervals.buckets').map((item) => ({
			key: item.key,
			date: getDateIntervalValue(item.key_as_string),
			data: Number(
				(
					get(
						item,
						'node_stats.hits.hits.0._source.elasticsearch.node.stats.jvm.mem.heap.used.bytes',
					) / 1073741824
				).toFixed(2),
			),
		})),
		memory: get(responses[2], 'aggregations.time_intervals.buckets').map((item) => ({
			key: item.key,
			date: getDateIntervalValue(item.key_as_string),
			data: Number(
				(
					get(item, 'memory.hits.hits.0._source.system.memory.actual.used.bytes') /
					1073741824
				).toFixed(2),
			),
		})),
		indexMemory: get(responses[1], 'aggregations.time_intervals.buckets').map((item) => ({
			key: item.key,
			date: getDateIntervalValue(item.key_as_string),
			data: Number(
				(
					get(
						item,
						'node_stats.hits.hits.0._source.elasticsearch.node.stats.indices.store.size.bytes',
					) / 1073741824
				).toFixed(2),
			),
		})),
		segmentCount: get(responses[1], 'aggregations.time_intervals.buckets').map((item) => ({
			key: item.key,
			date: getDateIntervalValue(item.key_as_string),
			data: get(
				item,
				'node_stats.hits.hits.0._source.elasticsearch.node.stats.indices.segments.count',
			),
		})),
	};
};
