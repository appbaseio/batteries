import React, { Component } from 'react';
import {
	getCredentials,
	getMappings,
	updateMapping,
	transformToES5,
	hasAggs,
} from '../../utils';
import conversionMap from '../../utils/conversionMap';

import {
	card,
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

export default class Mapping extends Component {
	constructor(props) {
		super(props);

		this.state = {
			loading: true,
			mapping: null,
			dirty: false,
		};
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

		console.log(this.state.dirty);

		this.setState({
			dirty: true,
			mapping,
		});
	}

	renderUsecase = (field, fieldname) => {
		if (field.type === 'text') {
			const usecases = {
				search: 'Search',
				aggs: 'Aggs',
				searchaggs: 'Search & Aggs',
				none: 'None',
			};
			const selected = field.fields
				? this.getUsecase(field.fields, usecases)
				: 'none';
			return (
				<select
					name="usecase"
					defaultValue={selected}
					className={dropdown}
					onChange={(e) => {
						this.setMapping(fieldname, 'text', e.target.value);
					}}
				>
					{
						Object.entries(usecases).map(value => (
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
											<option value={this.getType(originalFields[field].type)}>
												{this.getType(originalFields[field].type)}
											</option>

											{
												conversionMap[this.getType(originalFields[field].type)]
													.map(itemType => (
														<option key={itemType} value={this.getType(itemType)}>
															{this.getType(itemType)}
														</option>
													))
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
				<div style={{ borderBottom: '1px solid #eee', padding: 20 }}>
					<h2 className={heading}>Manage Mappings</h2>
				</div>
				<div style={{ padding: '5px 20px' }}>
					<header
						style={{
							display: 'flex',
							flexDirection: 'row',
							justifyContent: 'space-between',
							fontWeight: 600,
							paddingTop: 20,
						}}
					>
						<span>Field Name</span>
						<div>
							<span
								style={{
									minWidth: '150px',
									display: 'inline-block',
									margin: '0 10px',
									textAlign: 'center',
								}}
							>
								Use-case
							</span>
							<span
								style={{
									minWidth: '150px',
									display: 'inline-block',
									margin: '0 10px',
									textAlign: 'center',
								}}
							>
								Data Type
							</span>
						</div>
					</header>
					{
						Object.keys(this.state.mapping)
							.map((field) => {
								if (this.state.mapping[field]) {
									return this.renderMapping(
										field,
										this.state.mapping[field].properties,
										this.originalMapping[field].properties,
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
								<Button>
									Confirm Types
								</Button>
							</Footer>
						)
						: null
				}
			</div>
		);
	}
}
