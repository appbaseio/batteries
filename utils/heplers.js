import { notification } from 'antd';
// eslint-disable-next-line
export const displayErrors = (nextErrors = [], prevErrors = []) => {
	nextErrors.map((error, index) => {
		if (error && error !== prevErrors[index]) {
			notification.error({
				message: 'Error',
				description: error.message,
			});
		}
		return null;
	});
};
