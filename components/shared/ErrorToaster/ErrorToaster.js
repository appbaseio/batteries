import React from 'react';
import { AlertTwoTone, MessageOutlined, ReloadOutlined } from '@ant-design/icons';
import { Result, Button, Alert } from 'antd';
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
			scope.setExtras(errorInfo);
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
								<ReloadOutlined style={{ margin: '0.25rem' }} />
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
						icon={<AlertTwoTone twoToneColor="#fa541c" />}
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
								<Button
									onClick={() => {
										if (window.Tawk_API) {
											window.Tawk_API.toggle();
										} else if (window.Intercom) {
											window.Intercom('show');
										}
									}}
								>
									<MessageOutlined style={{ margin: '0.25rem' }} />
									Chat with us
								</Button>
								<Button type="primary" onClick={this.retry}>
									<ReloadOutlined style={{ margin: '0.25rem' }} />
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
