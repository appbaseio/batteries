import React, { Component } from 'react';
import { getCredentials, getMappings, updateMapping } from '../utils';
import conversionMap from '../utils/conversionMap';

const styles = {
	card: {
		width: '100%',
		maxWidth: '980px',
		margin: '25px auto',
		backgroundColor: '#fff',
		borderRadius: '3px',
		boxShadow: '0 3px 5px 0 rgba(0,0,0,0.05)',
		boxSizing: 'border-box',
	},
	heading: {
		fontSize: '16px',
		letterSpacing: '0.015rem',
		fontWeight: 600,
		margin: 0,
		padding: 0,
	},
	row: {
		boxSizing: 'border-box',
		backgroundColor: 'rgba(0,0,0,0.02)',
		padding: '15px 0 15px 15px',
		margin: '15px 0',
		border: '1px solid rgba(0,0,0,0.05)',
	},
	title: {
		fontSize: '15px',
		letterSpacing: '0.015rem',
		fontWeight: 600,
		margin: '0 0 12px 0',
		padding: 0,
		whiteSpace: 'nowrap',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
	},
	dropdown: {
		width: 'auto',
		minWidth: '150px',
		height: '34px',
		border: '1px solid #f8f8f8',
		boxShadow: '0 3px 5px 0 rgba(0,0,0,0.05)',
		backgroundColor: '#fff',
		borderRadius: '2px',
		outlineColor: '#c7f4ff',
		marginLeft: 12,
		paddingRight: 15,
		textTransform: 'capitalize',
	},
	item: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
		padding: 10,
		marginBottom: 2,
		alignItems: 'center',
		backgroundColor: 'rgba(255,255,255,0.8)',
	},
	subItem: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
	},
};

export default class Mapping extends Component {
	constructor(props) {
		super(props);

		this.state = {
			loading: true,
			mapping: null,
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
					mapping: res,
				});
			})
			.catch((e) => {
				console.log(e);
				this.setState({
					loading: false,
				});
			});
	}

	getType = (type) => {
		if (type === 'string') return 'text';
		return type;
	};

	setMapping = (field, type) => {
		const mapping = updateMapping(this.state.mapping, field, type);
		this.setState({
			mapping,
		});
	};

	getUsecase = (fields, usecases) => {
		let hasAggs = 0;
		let hasSearch = 0;
		if (fields.raw) hasAggs = 1;
		if (fields.search) hasSearch = 1;

		if (hasAggs && hasSearch) return usecases.BOTH;
		if (hasAggs && !hasSearch) return usecases.AGGS;
		if (!hasAggs && hasSearch) return usecases.SEARCH;
		if (!hasAggs && !hasSearch) return usecases.NONE;
	}

	renderUsecase = (field) => {
		if (this.getType(field.type) === 'text') {
			const usecases = {
				SEARCH: 'Search',
				AGGS: 'Aggs',
				BOTH: 'Search and Aggs',
				NONE: 'None',
			};
			const selected = field.fields
				? this.getUsecase(field.fields, usecases)
				: 'None';
			return (
				<select name="usecase" defaultValue={selected} style={styles.dropdown}>
					{
						Object.values(usecases).map(item => (
							<option key={item} value={item}>{item}</option>
						))
					}
				</select>
			);
		}
		return null;
	};

	renderMapping = (type, fields, originalFields) => {
		if (fields) {
			return (
				<section
					key={type}
					style={styles.row}
				>
					<h4 style={styles.title}>{type}</h4>
					{
						Object.keys(fields).map((field) => {
							if (fields[field].properties) {
								return this.renderMapping(
									field,
									fields[field].properties,
									originalFields[field].properties,
								);
							}
							return (
								<div key={field} style={styles.item}>
									{field}
									<div style={styles.subItem}>
										{this.renderUsecase(fields[field])}
										<select
											style={styles.dropdown}
											name={`${field}-mapping`}
											defaultValue={this.getType(fields[field].type)}
											onChange={(e) => {
												this.setMapping(field, e.target.value);
											}}
										>
											<option value={this.getType(originalFields[field].type)}>
												{this.getType(originalFields[field].type)}
											</option>

											{
												conversionMap[this.getType(originalFields[field].type)]
													.map(item => (
														<option key={item} value={this.getType(item)}>
															{this.getType(item)}
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
		if (this.state.loading) return <div>Please wait...</div>;
		return (
			<div style={styles.card}>
				<div style={{ borderBottom: '1px solid #eee', padding: 20 }}>
					<h2 style={styles.heading}>Manage Mappings</h2>
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
									);
								}
								return null;
							})
					}
				</div>
			</div>
		);
	}
}
