const formatError = (error = {}) => {
	try {
		const errorObj = error && JSON.parse(error.message);
		const errorToBeReturned = {};
		if (errorObj && errorObj.length) {
			errorToBeReturned.message = errorObj[0] && errorObj[0].message;
		}
		errorToBeReturned.actual = error;
		return errorToBeReturned;
	} catch (e) {
		return e;
	}
};
/**
 * Function to create a redux action
 * @param {string} actionId
 * @param {any} payload
 * @param {any} error
 * @param {any} meta
 */
// eslint-disable-next-line
export function createAction(actionId, payload, error, meta) {
	const action = {
		type: actionId,
	};
	if (payload !== undefined) {
		action.payload = payload;
	}
	if (error !== undefined) {
		action.error = formatError(error);
	}
	if (meta !== undefined) {
		action.meta = meta;
	}

	return action;
}
