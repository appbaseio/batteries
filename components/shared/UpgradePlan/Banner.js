import React from 'react';
import {
 Button, Icon, Row, Col,
} from 'antd';
import PropTypes from 'prop-types';
import Header from './Header';

const Banner = ({
 title, description, buttonText, href,
}) => (
	<Header compact>
		<Row type="flex" justify="space-between" gutter={16}>
			<Col md={18}>
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
				<Button
					size="large"
					type="primary"
					href={href}
					target="_blank"
					rel="noopener noreferrer"
				>
					<Icon type="info-circle" />
					{buttonText}
				</Button>
			</Col>
		</Row>
	</Header>
);
Banner.defaultProps = {
	description: '',
	href: '/billing',
	buttonText: 'Upgrade Now',
};

Banner.propTypes = {
	title: PropTypes.string.isRequired,
	description: PropTypes.string,
	buttonText: PropTypes.string,
	href: PropTypes.string,
};

export default Banner;
