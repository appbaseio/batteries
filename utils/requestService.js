/**
 * Creates a fetch request
 * @param {string} url
 * @param {Object} body
 * @param {Object} headers
 * @param {string} method
 */
const createRequest = (
	url,
	body,
	headers = {
		'Content-Type': 'application/json',
	},
	method,
) => new Promise((resolve, reject) => {
		let status;
		let authToken = null;
		try {
			// eslint-disable-next-line
			authToken = JSON.parse(JSON.parse(localStorage.getItem('persist:root')).user).data
				.authToken;
		} catch (e) {
			console.error(e);
		}
		const requestOptions = JSON.parse(
			JSON.stringify({
				method,
				headers: {
					...headers,
					Authorization: `Basic ${authToken}`,
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
 */
export const doDelete = (url, headers) => createRequest(url, undefined, headers, 'DELETE');
/**
 * To create a post request
 * @param {string} url
 * @param {Object} body
 * @param {Object} headers
 */
export const doGet = (url, headers) => createRequest(url, undefined, headers, 'GET');
/**
 * To create a get request
 * @param {string} url
 * @param {Object} headers
 */
export const doPost = (url, body, headers) => createRequest(url, body, headers, 'POST');
/**
 * To create a patch request
 * @param {string} url
 * @param {Object} body
 * @param {Object} headers
 */
export const doPatch = (url, body, headers) => createRequest(url, body, headers, 'PATCH');
