import styled from 'react-emotion';
import { Card } from 'antd';

export const CustomCard = styled(Card)`
	background: rgba(229, 230, 233, 0.21);
	border: 0;
	border-top: 2px solid rgb(0, 0, 0);
	height: 275px;
	flex: 1;
	margin: 10px;
	:first-child {
		margin-left: 0px;
	}
	:last-child {
		margin-right: 0px;
	}
	.ant-card-head {
		border-bottom: 0;
		padding: 0 15px;
	}
	.ant-card-head-title {
		border-bottom: 0;
		font-weight: bold;
		color: #8c8c8c;
		text-align: center;
	}
	.ant-card-body {
		padding: 15px;
		padding-top: 0;
	}
`;

export const Title = styled.span`
	font-weight: bold;
`;

export const GraphContainer = styled.div`
	margin: 10px;
	flex: 1;
`;
