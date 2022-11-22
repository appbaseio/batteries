import React from 'react';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Icon as LegacyIcon } from '@ant-design/compatible';
import { Button, Row, Col } from 'antd';
import PropTypes from 'prop-types';
import Header from './Header';

const Banner = ({
	title,
	description,
	buttonText,
	href,
	showButton,
	onClick,
	showGoBack,
	goBackText,
	onClickGoBack,
	icon,
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
					display: 'flex',
					flexDirection: 'column-reverse',
					paddingBottom: 20,
				}}
			>
				{showButton && (
					<Button
						size="large"
						type="primary"
						{...!onClick && { href }}
						target="_blank"
						rel="noopener noreferrer"
						onClick={onClick}
						icon={<LegacyIcon type={icon} />}
					>
						{buttonText}
					</Button>
				)}
			</Col>
		</Row>
	</Header>
);
Banner.defaultProps = {
	icon: 'info-circle',
	description: '',
	href: '/billing',
	buttonText: 'Upgrade Now',
	showButton: true,
	onClick: undefined,
	showGoBack: false,
	goBackText: 'Go Back',
	onClickGoBack: undefined,
};

Banner.propTypes = {
	title: PropTypes.string.isRequired,
	icon: PropTypes.string,
	onClick: PropTypes.func,
	description: PropTypes.string,
	buttonText: PropTypes.string,
	href: PropTypes.string,
	showButton: PropTypes.bool,
	showGoBack: PropTypes.bool,
	goBackText: PropTypes.string,
	onClickGoBack: PropTypes.func,
};

export default Banner;
