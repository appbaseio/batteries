import React from 'react';
import { DeleteOutlined } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Button, Table } from 'antd';

import { NumberInput, DropdownInput } from '../../shared/Input';
import { rowStyles, deleteStyles } from '../styles';

class DataFieldInput extends React.Component {
	handleSearchDataFieldChange = (valueObject) => {
		const { componentProps, setComponentProps } = this.props;

		const dataField = Object.assign([], componentProps.dataField, {
			...valueObject,
		});
		setComponentProps({ dataField });
	};

	renderDeleteButton = (x, y, index) => (
		<Button
			className={deleteStyles}
			icon={<DeleteOutlined />}
			shape="circle"
			type="danger"
			onClick={() => this.handleSearchDataFieldDelete(index)}
		/>
	);

	handleSearchDataFieldDelete = (deleteIndex) => {
		const { setComponentProps, componentProps } = this.props;
		const newComponentProps = {
			dataField: componentProps.dataField.filter((i, index) => index !== deleteIndex),
			fieldWeights: componentProps.fieldWeights.filter((i, index) => index !== deleteIndex),
		};
		setComponentProps(newComponentProps);
	};

	handleSearchWeightChange = (newWeight) => {
		const { setComponentProps, componentProps } = this.props;
		const fieldWeights = Object.assign([], componentProps.fieldWeights, {
			...newWeight,
		});
		setComponentProps({ fieldWeights });
	};

	handleAddFieldRow = () => {
		const { setComponentProps, getAvailableDataField, componentProps } = this.props;
		const field = getAvailableDataField().find(
			item => !componentProps.dataField.includes(item),
		);

		if (field) {
			const newComponentProps = {
				dataField: [...componentProps.dataField, field],
				fieldWeights: [...componentProps.fieldWeights, 1],
			};
			setComponentProps(newComponentProps);
		}
	};

	renderDataFieldTable = () => {
		const { getAvailableDataField, componentProps } = this.props;
		const fields = getAvailableDataField();
		const columns = [
			{
				title: 'Field',
				dataIndex: 'field',
				key: 'field',
				render: (selected, x, index) => {
					const options = fields
						.filter(
							item => item === selected || !componentProps.dataField.includes(item),
						)
						.map(item => ({ label: item, key: item }));

					return (
						<DropdownInput
							options={options}
							name={index}
							value={selected}
							handleChange={this.handleSearchDataFieldChange}
							styleProps={{ minWidth: '16vw' }}
						/>
					);
				},
			},
			{
				title: 'Weight',
				dataIndex: 'weight',
				key: 'weight',
				render: (value, x, index) => (
					<NumberInput
						min={1}
						value={Number(value)}
						name={index}
						placeholder="Enter Field Weight"
						handleChange={this.handleSearchWeightChange}
					/>
				),
				width: 100,
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
					scroll={{ x: true }}
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
		const {
            id, label, description, getAvailableDataField, componentProps, setComponentProps,
        } = this.props; // prettier-ignore
		const { dataField } = componentProps;
		const fields = getAvailableDataField();
		const options = fields.map(item => ({
			label: item,
			key: item,
		}));

		return (
			<Form.Item label={label} colon={false}>
				<div style={{ margin: '0 0 6px' }} className="ant-form-extra">
					{description}
				</div>
				{id === 'search' ? (
					this.renderDataFieldTable()
				) : (
					<DropdownInput
						value={dataField}
						handleChange={setComponentProps}
						options={options}
						name="dataField"
						noOptionsMessage="No Fields Present"
					/>
				)}
			</Form.Item>
		);
	}
}

export default DataFieldInput;
