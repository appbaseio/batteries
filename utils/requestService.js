/**
 * Creates a fetch request
 * @param {string} url
 * @param {Object} body
 * @param {Object} headers
 * @param {string} credentials
 * @param {string} method
 */
const createRequest = (
	url,
	body,
	headers = {
		'Content-Type': 'application/json',
	},
	credentials = 'include',
	method,
) => new Promise((resolve, reject) => {
		let status;
		const requestOptions = JSON.parse(
			JSON.stringify({
				method,
				credentials,
				headers,
				body: body ? JSON.stringify(body) : undefined,
			}),
		);
		fetch(url, requestOptions)
			.then((res) => {
				({ status } = res);
				return res.json();
			})
			.then((data) => {
				if (status >= 400) {
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
 * @param {string} credentials
 */
export const doDelete = (url, headers, credentials) => createRequest(url, undefined, headers, credentials, 'DELETE');
/**
 * To create a post request
 * @param {string} url
 * @param {Object} body
 * @param {Object} headers
 * @param {string} credentials
 */
export const doGet = (url, body, headers, credentials) => createRequest(url, body, headers, credentials, 'GET');
/**
 * To create a get request
 * @param {string} url
 * @param {Object} headers
 * @param {string} credentials
 */
export const doPost = (url, headers, credentials) => createRequest(url, undefined, headers, credentials, 'POST');
/**
 * To create a patch request
 * @param {string} url
 * @param {Object} body
 * @param {Object} headers
 * @param {string} credentials
 */
export const doPatch = (url, body, headers, credentials) => createRequest(url, body, headers, credentials, 'PATCH');
