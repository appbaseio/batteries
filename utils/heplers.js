import filter from 'lodash/filter';

export const displayErrors = (nextErrors = [], prevErrors = []) => {
	nextErrors.map((error, index) => {
		if (error && error !== prevErrors[index]) {
			console.error(error);
		}
		return null;
	});
};

export const getFilteredResults = (array = []) => filter(array, (i, index) => index < 5);
