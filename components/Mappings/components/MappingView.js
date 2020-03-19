import React from 'react';
import { Icon, Popover, Button, Dropdown, Menu } from 'antd';

import MappingIcon from './MappingIcon';
import { subItem, deleteBtn, item, title, row, dropdown } from '../styles';
import { getUsecase } from '../../../utils/mappings';

class MappingView extends React.Component {
	renderUsecase = (field, fieldname) => {
		const { setMapping, usecases } = this.props;
		if (field.type === 'text') {
			const selected = field.fields ? getUsecase(field.fields) : 'none';
			return this.renderDropDown({
				name: 'field-usecase',
				value: selected,
				handleChange: e => setMapping(fieldname, 'text', e.key),
				options: Object.entries(usecases).map(entry => ({
					value: entry[0],
					label: entry[1],
				})),
			});
		}
		return null;
	};

	renderOptions = (originalFields, fields, field) => {
		const { getType, getConversionMap } = this.props;
		const options = [];

		if (originalFields[field]) {
			options.push({
				label: getType(originalFields[field].type),
				value: getType(originalFields[field].type),
			});
			getConversionMap(getType(originalFields[field].type)).map(itemType =>
				options.push({
					label: getType(itemType)
						.split('_')
						.join(' '),
					value: getType(itemType),
				}),
			);
			return options;
		}
		options.push({
			label: getType(fields[field].type),
			value: getType(fields[field].type),
		});

		getConversionMap(getType(fields[field].type)).map(itemType =>
			options.push({
				label: getType(itemType)
					.split('_')
					.join(' '),
				value: getType(itemType),
			}),
		);
		return options;
	};

	renderDropDown = ({
		options,
		value,
		handleChange // prettier-ignore
	}) => {
		const menu = (
			<Menu onClick={e => handleChange(e)}>
				{options.map(option => (
					<Menu.Item key={option.value}>{option.label}</Menu.Item>
				))}
			</Menu>
		);
		const selectedOption = options.find(option => option.value === value);
		return (
			<Dropdown overlay={menu}>
				<Button className={dropdown}>
					{(selectedOption && selectedOption.label) || value}
					<Icon type="down" />
				</Button>
			</Dropdown>
		);
	};

	renderMapping = (type, fields, originalFields, address = '', mappingType, initialRender) => {
		const nestedObj = {
			type: 'nested',
		};
		const {
			deletePath,
			setMapping,
			hideSearchType,
			hideAggsType,
			hideNoType,
			hideNoneTextType,
			hideDelete,
			hideDataType,
			columnRender,
			hidePropertiesType,
			renderMappingInfo,
			onDeleteField,
			dirty,
		} = this.props;
		if (fields) {
			return (
				<section key={type} className={row}>
					{renderMappingInfo && initialRender ? renderMappingInfo({ dirty }) : null}
					<h4 className={`${title} ${deleteBtn}`}>
						<span title={type}>
							{mappingType === 'nested' ? (
								<Popover content={<pre>{JSON.stringify(nestedObj, null, 2)}</pre>}>
									<div
										css={{
											justifyContent: 'center',
											alignItems: 'center',
											width: 30,
											height: 31,
											border: '1px solid #ddd',
											borderRadius: '50%',
											display: 'inline-flex',
											marginRight: 12,
											background: 'white',
											color: '#595959',
											fontWeight: 'normal',
										}}
									>
										<MappingIcon type="object" />
									</div>
								</Popover>
							) : null}
							{address === 'properties.properties' && hidePropertiesType
								? null
								: type}
						</span>
						{hideDelete ? null : (
							<a
								onClick={() => {
									deletePath(address, true);
								}}
							>
								<Icon type="delete" />
								Delete
							</a>
						)}
					</h4>
					{Object.keys(fields).map(field => {
						if (fields[field].properties) {
							return this.renderMapping(
								field,
								fields[field].properties,
								originalFields[field].properties,
								`${address ? `${address}.` : ''}${field}.properties`,
								fields[field].type,
							);
						}
						const properties = fields[field];
						const propertyType = properties.type ? properties.type : 'default';
						const flex = {
							display: 'flex',
							flexDirection: 'row',
							alignItems: 'center',
						};

						const mappingInfo = (
							<Popover content={<pre>{JSON.stringify(properties, null, 2)}</pre>}>
								<div
									css={{
										...flex,
										justifyContent: 'center',
										width: 30,
										height: 30,
										border: '1px solid #ddd',
										borderRadius: '50%',
										display: 'inline-flex',
										marginRight: 12,
									}}
								>
									<MappingIcon type={propertyType} />
								</div>
							</Popover>
						);

						const selected =
							fields[field] && fields[field].type === 'text' && fields[field].fields
								? getUsecase(fields[field].fields)
								: 'none';

						if (hideSearchType && selected === 'search') {
							return null;
						}

						if (hideAggsType && selected === 'aggs') {
							return null;
						}

						if (hideNoType && selected === 'none') {
							return null;
						}
						if (
							hideNoneTextType &&
							fields &&
							fields[field] &&
							fields[field].type === 'text' &&
							selected === 'none'
						) {
							return null;
						}
						return (
							<div key={field} className={item}>
								<div className={deleteBtn}>
									<span title={field} css={flex}>
										{mappingInfo}
										{field}
									</span>

									<a
										onClick={() => {
											const addressField = `${address}.${field}`;
											if (onDeleteField) {
												onDeleteField({
													address: addressField,
													type: fields[field].type,
												});
											} else {
												deletePath(addressField);
											}
										}}
									>
										<Icon type="delete" />
										Delete
									</a>
								</div>
								<div className={subItem}>
									{this.renderUsecase(fields[field], `${address}.${field}`)}
									{hideDataType
										? null
										: this.renderDropDown({
												name: `${field}-mapping`,
												value: fields[field].type,
												handleChange: e =>
													setMapping(`${address}.${field}`, e.key),
												options: this.renderOptions(
													originalFields,
													fields,
													field,
												),
										  })}
									{columnRender
										? columnRender({
												fields,
												address: `${address}.${field}`.startsWith(
													'properties.properties',
												)
													? `${address}.${field}`.replace(
															'properties.properties',
															'properties',
													  )
													: `${address}.${field}`,
												field,
												originalFields,
												settings: fields[field],
										  })
										: null}
								</div>
							</div>
						);
					})}
				</section>
			);
		}
		return null;
	};

	render() {
		const { mapping, originalMapping, esVersion, hasMappings } = this.props;

		if (!hasMappings || !mapping || !Object.keys(mapping).length) {
			return (
				<p style={{ padding: '40px 0', color: '#999', textAlign: 'center' }}>
					No data or mappings found
				</p>
			);
		}
		return (
			<React.Fragment>
				{Object.keys(mapping).map(field => {
					if (mapping[field]) {
						let currentMappingFields = mapping[field].properties;
						let originalMappingFields = originalMapping[field]
							? originalMapping[field].properties
							: mapping[field].properties;
						const fieldAddress = `${field}.properties`;
						const typeName = mapping[field].type;

						if (+esVersion >= 7) {
							if (field !== 'properties') {
								return null;
							}
							currentMappingFields = mapping[field];
							originalMappingFields = originalMapping[field]
								? originalMapping[field]
								: mapping[field];
						}

						return this.renderMapping(
							field,
							currentMappingFields,
							originalMappingFields,
							fieldAddress,
							typeName,
							true,
						);
					}
					return null;
				})}
			</React.Fragment>
		);
	}
}

export default MappingView;
