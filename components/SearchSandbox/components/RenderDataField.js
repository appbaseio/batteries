import React from 'react';
import {
 Dropdown, Menu, Button, Icon, Input, Form, Table,
} from 'antd';
import { rowStyles, deleteStyles } from '../styles';

class RenderDataField extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			componentProps: props.componentProps,
		};
	}

	handleSearchDataFieldChange = (item) => {
		const field = item.key;
		const index = item.item.props.value;
		const { componentProps } = this.state;
		const { setComponentProps } = this.props;
		const dataField = Object.assign([], componentProps.dataField, {
			[index]: field,
		});

		const newComponentProps = {
			...componentProps,
			dataField,
		};
		this.setState(
			{
				componentProps: newComponentProps,
			},
			setComponentProps(newComponentProps),
		);
	};

	renderDeleteButton = (x, y, index) => (
		<Button
			className={deleteStyles}
			icon="delete"
			shape="circle"
			type="danger"
			onClick={() => this.handleSearchDataFieldDelete(index)}
		/>
	);

	handleSearchDataFieldDelete = (deleteIndex) => {
		const { componentProps } = this.state;
		const { setComponentProps } = this.props;
		const newComponentProps = {
			...componentProps,
			dataField: componentProps.dataField.filter((i, index) => index !== deleteIndex),
			fieldWeights: componentProps.fieldWeights.filter((i, index) => index !== deleteIndex),
		};
		this.setState(
			{
				componentProps: newComponentProps,
			},
			setComponentProps(newComponentProps),
		);
	};

	handleSearchWeightChange = (index, value) => {
		const { componentProps } = this.state;
		const { setComponentProps } = this.props;
		const fieldWeights = Object.assign([], componentProps.fieldWeights, {
			[index]: value,
		});
		const newComponentProps = {
			...componentProps,
			fieldWeights,
		};
		this.setState(
			{
				componentProps: newComponentProps,
			},
			setComponentProps(newComponentProps),
		);
	};

	handleDataFieldChange = (item) => {
		const dataField = item.key;
		const { componentProps } = this.state;
		const { setComponentProps } = this.props;
		const newComponentProps = {
			...componentProps,
			dataField,
		};
		this.setState(
			{
				componentProps: newComponentProps,
			},
			setComponentProps(newComponentProps),
		);
	};

	handleAddFieldRow = () => {
		const { componentProps } = this.state;
		const { setComponentProps, getAvailableDataField } = this.props;
		const field = getAvailableDataField().find(
			item => !componentProps.dataField.includes(item),
		);

		if (field) {
			const newComponentProps = {
				...componentProps,
				dataField: [...componentProps.dataField, field],
				fieldWeights: [...componentProps.fieldWeights, 1],
			};
			this.setState(
				{
					componentProps: newComponentProps,
				},
				setComponentProps(newComponentProps),
			);
		}
	};

	renderDataFieldTable = () => {
		const { getAvailableDataField } = this.props;
		const fields = getAvailableDataField();
		const { componentProps } = this.state;
		const columns = [
			{
				title: 'Field',
				dataIndex: 'field',
				key: 'field',
				render: (selected, x, index) => {
					const menu = (
						<Menu
							onClick={this.handleSearchDataFieldChange}
							style={{ maxHeight: 300, overflowY: 'scroll' }}
						>
							{fields
								.filter(
									item => item === selected
										|| !componentProps.dataField.includes(item),
								)
								.map(item => (
									<Menu.Item key={item} value={index}>
										{item}
									</Menu.Item>
								))}
						</Menu>
					);
					return (
						<Dropdown overlay={menu} trigger={['click']}>
							<Button style={{ marginLeft: 8 }}>
								{selected} <Icon type="down" />
							</Button>
						</Dropdown>
					);
				},
			},
			{
				title: 'Weight',
				dataIndex: 'weight',
				key: 'weight',
				render: (value, x, index) => (
					<Input
						min={1}
						type="number"
						defaultValue={value}
						onChange={e => this.handleSearchWeightChange(index, e.target.value)}
					/>
				),
			},
			{
				render: this.renderDeleteButton,
			},
		];

		const dataSource = componentProps.dataField.map((field, index) => ({
			key: field,
			field,
			weight: componentProps.fieldWeights[index],
		}));

		return (
			<React.Fragment>
				<Table
					dataSource={dataSource}
					columns={columns}
					pagination={false}
					rowClassName={rowStyles}
				/>
				{fields.length === componentProps.dataField.length ? null : (
					<div style={{ paddingTop: 12, textAlign: 'right' }}>
						<Button
							onClick={this.handleAddFieldRow}
							type="primary"
							style={{ marginBottom: 16 }}
						>
							Add a new field
						</Button>
					</div>
				)}
			</React.Fragment>
		);
	};

	render() {
		const { componentProps: stateComponentProps } = this.state;
		const {
            id, label, description, getAvailableDataField,
        } = this.props; // prettier-ignore
		const { dataField } = stateComponentProps;
		const fields = getAvailableDataField();
		const menu = (
			<Menu
				onClick={this.handleDataFieldChange}
				style={{ maxHeight: 300, overflowY: 'scroll' }}
			>
				{fields.map(item => (
					<Menu.Item key={item}>{item}</Menu.Item>
				))}
			</Menu>
		);
		return (
			<Form.Item label={label} colon={false}>
				<div style={{ margin: '0 0 6px' }} className="ant-form-extra">
					{description}
				</div>
				{id === 'search' ? (
					this.renderDataFieldTable()
				) : (
					<Dropdown overlay={menu} trigger={['click']}>
						<Button
							style={{
								width: '100%',
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
							}}
						>
							{dataField} <Icon type="down" />
						</Button>
					</Dropdown>
				)}
			</Form.Item>
		);
	}
}

export default RenderDataField;
