import { notification } from 'antd';
import filter from 'lodash/filter';
import { init, captureMessage } from '@sentry/browser';

init({
	dsn: 'https://8e07fb23ba8f46d8a730e65496bb7f00@sentry.io/58038',
});

export const displayErrors = (nextErrors = [], prevErrors = []) => {
	nextErrors.map((error, index) => {
		if (error && error !== prevErrors[index]) {
			if (process.env.NODE_ENV === 'production') {
				captureMessage(error.message);
			} else {
				notification.error({
					message: 'Error',
					description: error.message,
				});
			}
		}
		return null;
	});
};

export const getFilteredResults = (array = []) => filter(array, (i, index) => index < 5);
