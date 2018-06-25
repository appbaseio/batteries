import React, { Component } from 'react';
import textUsecases from './usecases';
import {
	getCredentials,
	getMappings,
	updateMapping,
	transformToES5,
	hasAggs,
	reIndex,
} from '../../utils';
import conversionMap from '../../utils/conversionMap';
import mappingUsecase from '../../utils/mappingUsecase';

import {
	card,
	Header,
	heading,
	row,
	title,
	dropdown,
	item,
	subItem,
	Footer,
	Button,
	deleteBtn,
} from './styles';
import NewFieldModal from './NewFieldModal';

export default class Mapping extends Component {
	constructor(props) {
		super(props);

		this.state = {
			loading: true,
			mapping: null,
			dirty: false,
			showModal: false,
		};

		this.usecases = textUsecases;
		this.originalMapping = null;
	}

	componentDidMount() {
		getCredentials(this.props.appId)
			.then((res) => {
				const { username, password } = res;
				return getMappings(this.props.appName, `${username}:${password}`);
			})
			.then((res) => {
				this.originalMapping = res;
				this.setState({
					loading: false,
					mapping: res ? transformToES5(res) : res,
				});
			})
			.catch((e) => {
				console.error(e);
				this.setState({
					loading: false,
				});
			});
	}

	getType = (type) => {
		if (type === 'string') return 'text';
		return type;
	};

	setMapping = (field, type, usecase) => {
		const mapping = updateMapping(this.state.mapping, field, type, usecase);
		this.setState({
			mapping,
			dirty: true,
		});
	};

	getUsecase = (fields) => {
		const hasAggsFlag = hasAggs(fields);
		let hasSearchFlag = 0;
		if (fields.search) hasSearchFlag = 1;

		if (hasAggsFlag && hasSearchFlag) return 'searchaggs';
		if (!hasAggsFlag && hasSearchFlag) return 'search';
		if (hasAggsFlag && !hasSearchFlag) return 'aggs';
		return 'none';
	}

	deletePath = (path) => {
		const mapping = JSON.parse(JSON.stringify(this.state.mapping));
		let fields = path.split('.');
		if (fields[fields.length - 1] === 'properties') {
			// when deleting an object
			fields = fields.slice(0, -1);
		}

		fields.reduce((acc, val, index) => {
			if (index === fields.length - 1) {
				delete acc[val];
				return true;
			}
			return acc[val];
		}, mapping);

		this.setState({
			dirty: true,
			mapping,
		});
	}

	cancelChanges = () => {
		this.setState({
			mapping: this.originalMapping,
			dirty: false,
		});
	}

	toggleModal = () => {
		this.setState({
			showModal: !this.state.showModal,
		});
	}

	addField = ({ name, type, usecase }) => {
		const mapping = JSON.parse(JSON.stringify(this.state.mapping));
		const fields = name.split('.');
		let newUsecase = {};

		if (usecase) {
			newUsecase = mappingUsecase[usecase];
		}

		fields.reduce((acc, val, index) => {
			if (index === fields.length - 1) {
				acc[val] = {
					type,
					...newUsecase,
				};
				return true;
			}
			return acc[val].properties;
		}, mapping);

		this.setState({
			dirty: true,
			mapping,
		});
	}

	reIndex = () => {
		reIndex(this.state.mapping, this.props.appId)
			.then((res) => {
				console.log(res);
			})
			.catch((err) => {
				console.log('error @reindexing', err);
			});
	};

	renderUsecase = (field, fieldname) => {
		if (field.type === 'text') {
			const selected = field.fields
				? this.getUsecase(field.fields, this.usecases)
				: 'none';
			return (
				<select
					name="field-usecase"
					defaultValue={selected}
					className={dropdown}
					onChange={(e) => {
						this.setMapping(fieldname, 'text', e.target.value);
					}}
				>
					{
						Object.entries(this.usecases).map(value => (
							<option key={value[0]} value={value[0]}>{value[1]}</option>
						))
					}
				</select>
			);
		}
		return null;
	};

	renderMapping = (type, fields, originalFields, address = '') => {
		if (fields) {
			return (
				<section
					key={type}
					className={row}
				>
					<h4 className={`${title} ${deleteBtn}`}>
						<span title={type}>{type}</span>
						<a onClick={() => { this.deletePath(address); }}>
							<i className="fas fa-trash-alt" />
						</a>
					</h4>
					{
						Object.keys(fields).map((field) => {
							if (fields[field].properties) {
								return this.renderMapping(
									field,
									fields[field].properties,
									originalFields[field].properties,
									`${address ? `${address}.` : ''}${field}.properties`,
								);
							}
							return (
								<div key={field} className={item}>
									<div className={deleteBtn}>
										<span title={field}>{field}</span>
										<a onClick={() => { this.deletePath(`${address}.${field}`); }}>
											<i className="fas fa-trash-alt" />
										</a>
									</div>
									<div className={subItem}>
										{this.renderUsecase(fields[field], field)}
										<select
											className={dropdown}
											name={`${field}-mapping`}
											defaultValue={fields[field].type}
											onChange={(e) => {
												this.setMapping(field, e.target.value);
											}}
										>
											{
												originalFields[field]
													? (
														<option value={this.getType(originalFields[field].type)}>
															{this.getType(originalFields[field].type)}
														</option>
													)
													: (
														<option value={this.getType(fields[field].type)}>
															{this.getType(fields[field].type)}
														</option>
													)
											}
											{
												originalFields[field]
													? (
														conversionMap[this.getType(originalFields[field].type)]
															.map(itemType => (
																<option key={itemType} value={this.getType(itemType)}>
																	{this.getType(itemType)}
																</option>
															))
													)
												: (
													conversionMap[this.getType(fields[field].type)]
														.map(itemType => (
															<option key={itemType} value={this.getType(itemType)}>
																{this.getType(itemType)}
															</option>
														))
												)
											}
										</select>
									</div>
								</div>
							);
						})
					}
				</section>
			);
		}
		return null;
	};

	render() {
		if (this.state.loading || !this.state.mapping) return <div>Please wait...</div>;
		return (
			<div className={card}>
				<div
					style={{
						borderBottom: '1px solid #eee',
						padding: 20,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
					}}
				>
					<h2 className={heading}>Manage Mappings</h2>
					<Button ghost onClick={this.toggleModal}>
						Add New Field
					</Button>
				</div>
				<div style={{ padding: '5px 20px' }}>
					<Header>
						<span>Field Name</span>
						<div>
							<span className="col">
								Use-case
							</span>
							<span className="col">
								Data Type
							</span>
						</div>
					</Header>
					{
						Object.keys(this.state.mapping)
							.map((field) => {
								if (this.state.mapping[field]) {
									const currentMappingFields = this.state.mapping[field].properties;
									const originalMappingFields = this.originalMapping[field]
										? this.originalMapping[field].properties
										: this.state.mapping[field].properties;
									return this.renderMapping(
										field,
										currentMappingFields,
										originalMappingFields,
										`${field}.properties`,
									);
								}
								return null;
							})
					}
				</div>
				{
					this.state.dirty
						? (
							<Footer>
								<Button onClick={this.reIndex}>
									Confirm Mapping Changes
								</Button>
								<Button ghost onClick={this.cancelChanges}>
									Cancel
								</Button>
							</Footer>
						)
						: null
				}
				<NewFieldModal
					show={this.state.showModal}
					addField={this.addField}
					onClose={this.toggleModal}
				/>
			</div>
		);
	}
}
