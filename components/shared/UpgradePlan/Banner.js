import React from 'react';
import { ArrowLeftOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Button, Row, Col } from 'antd';
import PropTypes, { any } from 'prop-types';
import Header from './Header';

const Banner = ({
	title,
	description,
	buttonText,
	videoLink,
	href,
	showButton,
	onClick,
	showGoBack,
	goBackText,
	onClickGoBack,
	icon,
	renderButtons,
}) => (
	<Header compact>
		<Row type="flex" justify="space-between" gutter={16}>
			<Col md={18}>
				{showGoBack && (
					<Button onClick={onClickGoBack}>
						<ArrowLeftOutlined />
						{goBackText}
					</Button>
				)}
				{title && <h2>{title}</h2>}
				<Row>
					<Col span={18}>{description && <p>{description}</p>}</Col>
				</Row>
			</Col>
			<Col
				md={6}
				css={{
					display: 'flex !important',
					flexDirection: 'column-reverse',
					paddingBottom: 20,
				}}
			>
				{showButton && (
					<React.Fragment>
						{videoLink !== '#' && (
							<a
								target="_blank"
								rel="noreferrer"
								href={videoLink}
								style={{ textAlign: 'center' }}
							>
								Watch Video
							</a>
						)}
						<Button
							size="large"
							type="primary"
							{...(!onClick && { href })}
							target="_blank"
							rel="noopener noreferrer"
							onClick={onClick}
							icon={icon}
						>
							{buttonText}
						</Button>
					</React.Fragment>
				)}
				{renderButtons && renderButtons()}
			</Col>
		</Row>
	</Header>
);
Banner.defaultProps = {
	icon: <InfoCircleOutlined />,
	description: '',
	href: '/billing',
	buttonText: 'Upgrade Now',
	videoLink: '#',
	showButton: true,
	onClick: undefined,
	showGoBack: false,
	goBackText: 'Go Back',
	onClickGoBack: undefined,
	renderButtons: undefined,
};

Banner.propTypes = {
	title: PropTypes.string.isRequired,
	icon: any,
	onClick: PropTypes.func,
	description: PropTypes.string,
	buttonText: PropTypes.string,
	videoLink: PropTypes.string,
	href: PropTypes.string,
	showButton: PropTypes.bool,
	showGoBack: PropTypes.bool,
	goBackText: PropTypes.string,
	onClickGoBack: PropTypes.func,
	renderButtons: PropTypes.func,
};

export default Banner;
