/**
 * Creates a fetch request
 * @param {string} url
 * @param {Object} body
 * @param {Object} headers
 * @param {string} method
 * @param {Array<Number>} allowedStatusCode
 */
const createRequest = (
	url,
	body,
	headers = {
		'Content-Type': 'application/json',
	},
	method,
	credentials = false,
	allowedStatusCode,
) => new Promise((resolve, reject) => {
		let status;
		let authToken = null;
		try {
			authToken = sessionStorage.getItem('authToken');
		} catch (e) {
			console.error(e);
		}
		const requestOptions = JSON.parse(
			JSON.stringify({
				method,
				...(credentials && { credentials: 'include' }),
				headers: {
					...headers,
					...(!credentials && { Authorization: `Basic ${authToken}` }),
				},
				body: body ? JSON.stringify(body) : undefined,
			}),
		);
		fetch(url, requestOptions)
			.then((res) => {
				({ status } = res);
				if (status >= 500) {
					return {
						message: 'Something went wrong!',
					};
				}
				return res.json();
			})
			.then((data) => {
				if (allowedStatusCode && allowedStatusCode.includes(status)) {
					return resolve(data);
				}
				if (status >= 400) {
					if (data.error) {
						return reject(data.error);
					}
					return reject(data);
				}
				if (data.body) {
					return resolve(data.body);
				}
				return resolve(data);
			})
			.catch(error => reject(error));
	});
/**
 * To create a delete request
 * @param {string} url
 * @param {Object} headers
 * @param {boolean} credentials
 */
export const doDelete = (url, headers, credentials, body) => createRequest(url, body, headers, 'DELETE', credentials);
/**
 * To create a get request
 * @param {string} url
 * @param {Object} headers
 * @param {boolean} credentials
 */
export const doGet = (url, headers, credentials) => createRequest(url, undefined, headers, 'GET', credentials);
/**
 * To create a post request
 * @param {string} url
 * @param {Object} body
 * @param {Object} headers
 * @param {boolean} credentials
 */
export const doPost = (url, body, headers, credentials, allowedStatusCode) => createRequest(url, body, headers, 'POST', credentials, allowedStatusCode);
/**
 * To create a patch request
 * @param {string} url
 * @param {Object} body
 * @param {Object} headers
 * @param {boolean} credentials
 */
export const doPatch = (url, body, headers, credentials) => createRequest(url, body, headers, 'PATCH', credentials);
/**
 * To create a put request
 * @param {string} url
 * @param {Object} body
 * @param {Object} headers
 * @param {boolean} credentials
 */
export const doPut = (url, body, headers, credentials) => createRequest(url, body, headers, 'PUT', credentials);
