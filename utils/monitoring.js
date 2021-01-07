import get from 'lodash/get';

export const getMonitoringSearchConfig = ({ username, password, url }) => ({
	url: `${url}/metricbeat-*/_msearch`,
	method: 'POST',
	headers: {
		Authorization: `Basic ${btoa(`${username}:${password}`)}`,
		'Content-Type': 'application/x-ndjson',
	},
});

export const formatSizeUnits = (byte) => {
	let bytes = byte;
	if (bytes >= 1073741824) {
		bytes = `${(bytes / 1073741824).toFixed(2)} GB`;
	} else if (bytes >= 1048576) {
		bytes = `${(bytes / 1048576).toFixed(2)} MB`;
	} else if (bytes >= 1024) {
		bytes = `${(bytes / 1024).toFixed(2)} KB`;
	} else if (bytes > 1) {
		bytes += ' bytes';
	} else if (bytes === 1) {
		bytes += ' byte';
	} else {
		bytes = '0 bytes';
	}
	return bytes;
};

export const fetchOverviewData = async (config, timeFilter) => {
	try {
		const {
			esURL,
			esUsername,
			esPassword,
			isAppbase,
			arcURL,
			arcPassword,
			arcUsername,
			kibanaURL,
			kibanaUsername,
			kibanaPassword,
		} = config;

		const esStatus = `{"size":0,"aggs":{"status":{"top_hits":{"sort":[{"@timestamp":{"order":"desc"}}],"size":1,"_source":{"includes":["@timestamp","elasticsearch.*"]}}}},"query":{"bool":{"must":[{"bool":{"filter":[{"term":{"metricset.name":"cluster_stats"}}]}},{"range":{"@timestamp":{"gte":"${timeFilter}","lte":"now"}}}]}}}`;

		const uptime = `{"size":0,"aggs":{"instances":{"terms":{"field":"cloud.instance.id"},"aggs":{"uptimes":{"top_hits":{"sort":[{"@timestamp":{"order":"desc"}}],"size":1,"_source":{"includes":["@timestamp","system.uptime.duration*"]}}}}}},"query":{"bool":{"must":[{"bool":{"filter":[{"term":{"metricset.name":"uptime"}}]}},{"range":{"@timestamp":{"gte":"${timeFilter}","lte":"now"}}}]}}}`;

		const esSearchConfig = getMonitoringSearchConfig({
			url: esURL,
			password: esPassword,
			username: esUsername,
		});

		const esRes = await fetch(esSearchConfig.url, {
			method: esSearchConfig.method,
			headers: esSearchConfig.headers,
			body: `{"preference": "cluster_health"}\n${esStatus}\n{"preference": "uptime"}\n${uptime}\n`,
		});

		const esData = await esRes.json();
		let arcData = esData;
		if (!isAppbase) {
			const arcSearchConfig = getMonitoringSearchConfig({
				url: arcURL,
				password: arcPassword,
				username: arcUsername,
			});
			const arcRes = await fetch(arcSearchConfig.url, {
				method: arcSearchConfig.method,
				headers: arcSearchConfig.headers,
				body: `{}\n${esStatus}\n{}\n${uptime}\n`,
			});

			arcData = await arcRes.json();
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

		return {
			esStatus: get(
				esData,
				'responses.0.aggregations.status.hits.hits.0._source.elasticsearch.cluster.stats.status',
			),
			arcStatus: get(
				arcData,
				'responses.0.aggregations.status.hits.hits.0._source.elasticsearch.cluster.stats.status',
			),
			kibanaStatus: get(kibanaData, 'status.overall.state', null),
			uptime: get(esData, 'responses.1.aggregations.instances.buckets').map((item) => ({
				node: item.key,
				uptime: parseInt(
					(get(item.uptimes, 'hits.hits.0._source.system.uptime.duration.ms', 0) /
						(1000 * 60 * 60)) %
						24,
					10,
				),
			})),
		};
	} catch (err) {
		throw err;
	}
};

export const fetchNodeSummaryData = async (config, timeFilter) => {
	try {
		const { esURL, esUsername, esPassword } = config;

		const nodes = `{"size":0,"aggs":{"nodes":{"top_hits":{"sort":[{"@timestamp":{"order":"desc"}}],"size":1,"_source":{"includes":["@timestamp","elasticsearch.*"]}}}},"query":{"bool":{"must":[{"bool":{"filter":[{"term":{"metricset.name":"cluster_stats"}}]}},{"range":{"@timestamp":{"gte":"${timeFilter}","lte":"now"}}}]}}}`;

		const cpuUsage = `{"size":0,"aggs":{"instances":{"terms":{"field":"cloud.instance.id"},"aggs":{"cpu":{"top_hits":{"sort":[{"@timestamp":{"order":"desc"}}],"size":1,"_source":{"includes":["@timestamp","system.cpu.total*"]}}}}}},"query":{"bool":{"must":[{"bool":{"filter":[{"term":{"metricset.name":"cpu"}}]}},{"range":{"@timestamp":{"gte":"${timeFilter}","lte":"now"}}}]}}}`;

		const jvmHeap = `{"size":0,"aggs":{"instances":{"terms":{"field":"cloud.instance.id"},"aggs":{"jvm":{"top_hits":{"sort":[{"@timestamp":{"order":"desc"}}],"size":1,"_source":{"includes":["@timestamp","elasticsearch.node.stats.jvm.mem.heap*"]}}}}}},"query":{"bool":{"must":[{"bool":{"filter":[{"term":{"metricset.name":"node_stats"}}]}},{"range":{"@timestamp":{"gte":"${timeFilter}","lte":"now"}}}]}}}`;

		const memory = `{"size":0,"aggs":{"instances":{"terms":{"field":"cloud.instance.id"},"aggs":{"memory":{"top_hits":{"sort":[{"@timestamp":{"order":"desc"}}],"size":1,"_source":{"includes":["@timestamp","system.memory.actual*"]}}}}}},"query":{"bool":{"must":[{"bool":{"filter":[{"term":{"metricset.name":"memory"}}]}},{"range":{"@timestamp":{"gte":"${timeFilter}","lte":"now"}}}]}}}`;

		const disk = `{"size":0,"aggs":{"instances":{"terms":{"field":"cloud.instance.id"},"aggs":{"disk":{"top_hits":{"sort":[{"@timestamp":{"order":"desc"}}],"size":1,"_source":{"includes":["@timestamp","elasticsearch.node.stats.fs.summary*"]}}}}}},"query":{"bool":{"must":[{"bool":{"filter":[{"term":{"metricset.name":"node_stats"}}]}},{"range":{"@timestamp":{"gte":"${timeFilter}","lte":"now"}}}]}}}`;

		const esSearchConfig = getMonitoringSearchConfig({
			url: esURL,
			password: esPassword,
			username: esUsername,
		});

		const esRes = await fetch(esSearchConfig.url, {
			method: esSearchConfig.method,
			headers: esSearchConfig.headers,
			body: `{"preference": "node_count"}\n${nodes}\n{"preference": "cpu_usage"}\n${cpuUsage}\n{"preference": "jvm_heap"}\n${jvmHeap}\n{"preference": "memory"}\n${memory}\n{"preference": "disk"}\n${disk}\n`,
		});

		const { responses } = await esRes.json();
		const cpuUsageString = (
			get(responses[1], 'aggregations.instances.buckets').reduce(
				(agg, item) => agg + get(item.cpu, 'hits.hits.0._source.system.cpu.total.norm.pct'),
				0,
			) / get(responses[1], 'aggregations.instances.buckets').length
		).toFixed(4);

		const jvmHeapTuple = get(responses[2], 'aggregations.instances.buckets').reduce(
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

		const memoryTuple = get(responses[3], 'aggregations.instances.buckets').reduce(
			(agg, item) => [
				agg[0] + get(item.memory, 'hits.hits.0._source.system.memory.actual.used.bytes'),
				agg[1] +
					get(item.memory, 'hits.hits.0._source.system.memory.actual.free') +
					agg[1] +
					get(item.memory, 'hits.hits.0._source.system.memory.actual.used.bytes'),
			],
			[0, 0],
		);
		const memoryString = `${((memoryTuple[0] / memoryTuple[1]) * 100).toFixed(
			1,
		)}% (${formatSizeUnits(memoryTuple[0])} / ${formatSizeUnits(memoryTuple[1])})`;

		const diskTuple = get(responses[4], 'aggregations.instances.buckets').reduce(
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
			nodes: get(
				responses[0],
				'aggregations.nodes.hits.hits.0._source.elasticsearch.cluster.stats.nodes.count',
			),
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

		return {
			indices: get(
				responses[0],
				'aggregations.cluster.hits.hits.0._source.elasticsearch.cluster.stats.indices.total',
			),
			documents: get(
				responses[1],
				'aggregations.indices.hits.hits.0._source.elasticsearch.index.summary.primaries.docs.count',
			),
			data: formatSizeUnits(
				get(
					responses[1],
					'aggregations.indices.hits.hits.0._source.elasticsearch.index.summary.primaries.store.size.bytes',
				),
			),
			primaryShards: get(
				responses[0],
				'aggregations.cluster.hits.hits.0._source.elasticsearch.cluster.stats.indices.shards.primaries',
			),
			replicaShards: get(
				responses[0],
				'aggregations.cluster.hits.hits.0._source.elasticsearch.cluster.stats.indices.shards.count',
			),
		};
	} catch (err) {
		throw err;
	}
};

export const fetchNodeStats = async (config, timeFilter) => {
	try {
		const { esURL, esUsername, esPassword } = config;

		const nodes = `{"size":0,"aggs":{"instances":{"terms":{"field":"cloud.instance.id"},"aggs":{"nodes":{"top_hits":{"sort":[{"@timestamp":{"order":"desc"}}],"size":1,"_source":{"includes":["@timestamp"]}}}}}},"query":{"bool":{"must":[{"bool":{"filter":[{"term":{"metricset.name":"cpu"}}]}},{"range":{"@timestamp":{"gte":"${timeFilter}","lte":"now"}}}]}}}`;

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
				cpuUsage: get(cpuDetails, 'cpu.hits.hits.0._source.system.cpu.total.norm.pct'),
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
				),
			};
		});
		return data;
	} catch (err) {
		throw err;
	}
};
