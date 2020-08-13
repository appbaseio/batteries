import React from 'react';
import { Result, Icon, Button, Alert } from 'antd';
import * as Sentry from '@sentry/browser';
import PropTypes from 'prop-types';

class ErrorToaster extends React.Component {
	state = {
		hasError: false,
	};

	retry = () => {
		this.setState({
			hasError: false,
		});
	};

	catchError = () => {
		this.setState({
			hasError: true,
		});
	};

	componentDidCatch(error, errorInfo) {
		this.catchError();
		Sentry.withScope((scope) => {
			Object.keys(errorInfo).forEach((key) => {
				scope.setExtra(key, errorInfo[key]);
			});
			Sentry.captureException(error);
		});
	}

	render() {
		const { hasError } = this.state;
		const { children, inline, placeholder, title } = this.props;

		if (hasError && placeholder) {
			return placeholder({
				errorHandler: this.retry,
			});
		}

		if (hasError && inline) {
			return (
				<Alert
					message={
						<React.Fragment>
							<span style={{ display: 'inline-block', marginRight: 5 }}>
								{title || 'Something went wrong.'}
							</span>
							<Button size="small" type="primary" onClick={this.retry}>
								<Icon type="reload" />
								Retry
							</Button>
						</React.Fragment>
					}
					type="error"
				/>
			);
		}

		if (hasError) {
			return (
				<React.Fragment>
					<Result
						icon={<Icon twoToneColor="#fa541c" type="alert" theme="twoTone" />}
						title={
							<React.Fragment>
								{title || (
									<React.Fragment>
										<h4 style={{ fontWeight: 600 }}>Something went wrong!</h4>
										<p>Our team has been notified about this.</p>
									</React.Fragment>
								)}
							</React.Fragment>
						}
						extra={
							<React.Fragment>
								<Button onClick={() => window.Intercom('show')}>
									<Icon type="message" />
									Chat with us
								</Button>
								<Button type="primary" onClick={this.retry}>
									<Icon type="reload" />
									Retry
								</Button>
							</React.Fragment>
						}
					/>
				</React.Fragment>
			);
		}

		return <React.Fragment>{children}</React.Fragment>;
	}
}

export const withErrorToaster = (Component, ...rest) => {
	const WrappedComponent = (props) => {
		return (
			<ErrorToaster {...rest}>
				<Component {...props} />
			</ErrorToaster>
		);
	};

	const name = Component.displayName || Component.name || 'Unknown';
	WrappedComponent.displayName = `withErrorToaster(${name})`;

	return WrappedComponent;
};

ErrorToaster.propTypes = {
	inline: PropTypes.bool,
	placeholder: PropTypes.func,
	title: PropTypes.oneOfType([
		PropTypes.arrayOf(PropTypes.node),
		PropTypes.node,
		PropTypes.string,
	]),
	children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
};

ErrorToaster.defaultProps = {
	inline: false,
	placeholder: null,
	title: '',
};

export default ErrorToaster;
