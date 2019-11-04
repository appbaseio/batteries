import get from 'lodash/get';

export const getPlanFromTier = (plan) => {
	if (plan) {
		return 'growth';
	}
	return 'free';
};

export const computeMetrics = (metrics) => {
	let totalRecords = 0;
	let totalStorage = 0;
	let totalCalls = 0;
	const currentDate = new Date();
	// current_date.setMonth(current_date.getMonth() - 1);
	currentDate.setDate(1);

	totalRecords += parseInt(get(metrics, 'overall.numDocs'), 10) || 0;
	const dividend = 1024 ** 2;
	totalStorage += get(metrics, 'overall.storage') / dividend || 0; // in MB

	get(metrics, 'month.buckets', []).forEach((bucket) => {
		if (bucket.key >= currentDate.getTime()) totalCalls += bucket.apiCalls.value;
	});

	return {
		storage: totalStorage.toFixed(3),
		records: totalRecords,
		calls: totalCalls,
	};
};
export const getApiCalls = (data) => {
	let total = 0;
	get(data, 'month.buckets', []).forEach((bucket) => {
		total += bucket.apiCalls.value;
	});
	return total;
};
