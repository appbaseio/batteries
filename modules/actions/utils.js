const formatError = (error = {}) => {
	try {
		const errorObj = error && JSON.parse(error.message);
		const errorToBeReturned = {};
		if (errorObj && errorObj.length) {
			errorToBeReturned.message = errorObj[0] && errorObj[0].message;
		}
		errorToBeReturned.actual = errorObj;
		return errorToBeReturned;
	} catch (e) {
		return error;
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
	if (arguments.length > 2 || error !== undefined) {
		action.error = formatError(error);
	}
	if (meta !== undefined) {
		action.meta = meta;
	}

	return action;
}
