import React, { Component } from 'react';
import { string } from 'prop-types';
import { Tooltip, Icon } from 'antd';
import Loader from '../shared/Loader';
import textUsecases from './usecases';
import { getCredentials, checkUserStatus } from '../../utils';
import {
	getMappings,
	updateMapping,
	transformToES5,
	hasAggs,
	reIndex,
	REMOVED_KEYS,
} from '../../utils/mappings';
import conversionMap from '../../utils/conversionMap';
import mappingUsecase from '../../utils/mappingUsecase';

import {
	card,
	HeaderWrapper,
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
import Modal from '../shared/Modal';
import NewFieldModal from './NewFieldModal';
import ErrorModal from './ErrorModal';

const fieldNameMessage = () => (
	<div style={{ maxWidth: 220 }}>
		Names of the fields and nested-fields are represented with relative indentation.
	</div>
);

const usecaseMessage = () => (
	<div style={{ maxWidth: 220 }}>
		We detect the appropriate analyzers and mappings here representing the usecase - search or
		aggregations.
	</div>
);

const hoverMessage = () => (
	<div style={{ maxWidth: 220 }}>
		Editing mappings isn{"'"}t a native feature in Elasticsearch. All appbase.io paid plans
		offer editable mappings by performing a lossless re-indexing of your data whenever you edit
		them from this UI.
	</div>
);

const FeedbackModal = props => (
	<Modal show={props.show} onClose={props.onClose}>
		<h3>Re-index successful</h3>

		<p>
			The mappings have been updated and the data has been successfully re-indexed in{' '}
			{props.timeTaken}ms.
		</p>

		<div style={{ display: 'flex', flexDirection: 'row-reverse', margin: '10px 0' }}>
			<Button ghost onClick={props.onClose}>
				Done
			</Button>
		</div>
	</Modal>
);

export default class Mappings extends Component {
	constructor(props) {
		super(props);

		this.state = {
			mapping: null,
			dirty: false,
			showModal: false,
			isLoading: true,
			errorMessage: '',
			showError: false,
			errorLength: 0,
			deletedPaths: [],
			editable: false,
			loadingError: null,
			showFeedback: false,
			timeTaken: '0',
		};

		this.usecases = textUsecases;
		this.originalMapping = null;
	}

	componentDidMount() {
		if (this.props.url) {
			getMappings(this.props.appName, this.props.credentials, this.props.url)
				.then(this.handleMapping)
				.catch(loadingError => {
					this.setState({
						loadingError,
						isLoading: false,
					});
				});
		} else {
			// check if it is a paid user
			checkUserStatus()
				.then(res => {
					if (res.isPaidUser) {
						this.setState({
							editable: true,
						});
					}
				})
				.catch(() => {
					this.setState({
						editable: false,
					});
				});

			getCredentials(this.props.appId)
				.then(user => {
					const { username, password } = user;
					return getMappings(this.props.appName, `${username}:${password}`);
				})
				.then(this.handleMapping)
				.catch(e => {
					console.error(e);
					this.setState({
						mappingsError: e,
						showError: true,
						isLoading: false,
					});
				});
		}
	}

	getType = type => {
		if (type === 'string') return 'text';
		return type;
	};

	getUsecase = fields => {
		const hasAggsFlag = hasAggs(fields);
		let hasSearchFlag = 0;
		if (fields.search) hasSearchFlag = 1;

		if (hasAggsFlag && hasSearchFlag) return 'searchaggs';
		if (!hasAggsFlag && hasSearchFlag) return 'search';
		if (hasAggsFlag && !hasSearchFlag) return 'aggs';
		return 'none';
	};

	setMapping = (field, type, usecase) => {
		const mapping = updateMapping(this.state.mapping, field, type, usecase);
		this.setState({
			mapping,
			dirty: true,
		});
	};

	handleMapping = res => {
		this.originalMapping = res;
		this.setState({
			isLoading: false,
			mapping: res ? transformToES5(res) : res,
		});
	};

	deletePath = path => {
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
			deletedPaths: [...this.state.deletedPaths, path],
		});
	};

	cancelChanges = () => {
		this.setState({
			mapping: this.originalMapping,
			dirty: false,
		});
	};

	toggleModal = () => {
		this.setState({
			showModal: !this.state.showModal,
		});
	};

	hideErrorModal = () => {
		this.setState({
			showError: false,
			errorMessage: '',
		});
	};

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
			if (!acc[val] || !acc[val].properties) {
				acc[val] = { properties: {} };
			}
			return acc[val].properties;
		}, mapping);

		this.setState({
			dirty: true,
			mapping,
		});
	};

	reIndex = () => {
		this.setState({
			isLoading: true,
		});

		const excludedFields = this.state.deletedPaths
			.map(path => path.split('.properties.').join('.'))
			.map(path => {
				const i = path.indexOf('.') + 1;
				return path.substring(i);
			});

		reIndex(this.state.mapping, this.props.appId, excludedFields)
			.then(timeTaken => {
				this.setState({
					showFeedback: true,
					timeTaken,
				});
			})
			.catch(err => {
				this.setState({
					isLoading: false,
					showError: true,
					errorLength: Array.isArray(err) && err.length,
					errorMessage: JSON.stringify(err, null, 4),
				});
			});
	};

	renderUsecase = (field, fieldname) => {
		if (field.type === 'text') {
			const selected = field.fields ? this.getUsecase(field.fields, this.usecases) : 'none';

			if (this.state.editable) {
				return (
					<select
						name="field-usecase"
						defaultValue={selected}
						className={dropdown}
						onChange={e => {
							this.setMapping(fieldname, 'text', e.target.value);
						}}
					>
						{Object.entries(this.usecases).map(value => (
							<option key={value[0]} value={value[0]}>
								{value[1]}
							</option>
						))}
					</select>
				);
			}

			return (
				<span style={{ boxShadow: 'none', border: 0 }} className={dropdown}>
					{this.usecases[selected]}
				</span>
			);
		}
		return null;
	};

	renderMapping = (type, fields, originalFields, address = '') => {
		if (fields) {
			return (
				<section key={type} className={row}>
					<h4 className={`${title} ${deleteBtn}`}>
						<span title={type}>{type}</span>
						{this.state.editable ? (
							<a
								onClick={() => {
									this.deletePath(address);
								}}
							>
								<i className="fas fa-trash-alt" />
							</a>
						) : null}
					</h4>
					{Object.keys(fields).map(field => {
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
									{this.state.editable ? (
										<a
											onClick={() => {
												this.deletePath(`${address}.${field}`);
											}}
										>
											<i className="fas fa-trash-alt" />
										</a>
									) : null}
								</div>
								<div className={subItem}>
									{this.renderUsecase(fields[field], field)}
									{this.state.editable ? (
										<select
											className={dropdown}
											name={`${field}-mapping`}
											defaultValue={fields[field].type}
											onChange={e => {
												this.setMapping(field, e.target.value);
											}}
										>
											{originalFields[field] ? (
												<option
													value={this.getType(originalFields[field].type)}
												>
													{this.getType(originalFields[field].type)}
												</option>
											) : (
												<option value={this.getType(fields[field].type)}>
													{this.getType(fields[field].type)}
												</option>
											)}
											{originalFields[field]
												? conversionMap[
														this.getType(originalFields[field].type)
												  ].map(itemType => (
														<option
															key={itemType}
															value={this.getType(itemType)}
														>
															{this.getType(itemType)
																.split('_')
																.join(' ')}
														</option>
												  ))
												: conversionMap[
														this.getType(fields[field].type)
												  ].map(itemType => (
														<option
															key={itemType}
															value={this.getType(itemType)}
														>
															{this.getType(itemType)
																.split('_')
																.join(' ')}
														</option>
												  ))}
										</select>
									) : (
										<span
											style={{ boxShadow: 'none', border: 0 }}
											className={dropdown}
										>
											{fields[field].type}
										</span>
									)}
								</div>
							</div>
						);
					})}
				</section>
			);
		}
		return null;
	};

	renderPromotionalButtons = () =>
		this.props.url ? (
			<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
				<p style={{ margin: '0 8px 0 0', color: '#888' }}>
					Get an appbase.io account to edit mappings
					<Tooltip title={hoverMessage}>
						<span>
							<Icon type="info-circle" />
						</span>
					</Tooltip>
				</p>
				<Button href="https://appbase.io" target="_blank">
					Signup Now
				</Button>
			</div>
		) : (
			<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
				<p style={{ margin: '0 8px 0 0', color: '#888' }}>
					Upgrade your plan to edit mappings
					<Tooltip title={hoverMessage}>
						<span>
							<Icon type="info-circle" />
						</span>
					</Tooltip>
				</p>
				<Button href="/billing" target="_blank">
					Upgrade Now
				</Button>
			</div>
		);

	render() {
		if (this.state.loadingError)
			return <p style={{ padding: 20 }}>{this.state.loadingError}</p>;
		if (this.state.isLoading && !this.state.mapping)
			return <Loader show message="Fetching mappings... Please wait!" />;
		if (this.state.mappingsError) {
			return (
				<ErrorModal
					show={this.state.showError}
					message="Some error occured while fetching the mappings"
					error={JSON.stringify(this.state.mappingsError, null, 2)}
					onClose={this.hideErrorModal}
				/>
			);
		}
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
					<HeaderWrapper>
						<h2 className={heading}>Manage Mappings</h2>
						<p>Add new fields or change the types of existing ones.</p>
					</HeaderWrapper>
					{this.state.editable ? (
						<Button ghost onClick={this.toggleModal}>
							Add New Field
						</Button>
					) : (
						this.renderPromotionalButtons()
					)}
				</div>
				<div style={{ padding: '5px 20px' }}>
					<Header>
						<span>
							Field Name
							<Tooltip title={fieldNameMessage}>
								<span>
									<Icon type="info-circle" />
								</span>
							</Tooltip>
						</span>
						<div>
							<span className="col">
								Use case
								<Tooltip title={usecaseMessage}>
									<span>
										<Icon type="info-circle" />
									</span>
								</Tooltip>
							</span>
							<span className="col">Data Type</span>
						</div>
					</Header>
					{Object.keys(this.state.mapping).map(field => {
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
					})}
				</div>
				{this.state.dirty && this.state.editable ? (
					<Footer>
						<Button onClick={this.reIndex}>Confirm Mapping Changes</Button>
						<Button ghost onClick={this.cancelChanges}>
							Cancel
						</Button>
					</Footer>
				) : null}
				<NewFieldModal
					types={Object.keys(this.state.mapping).filter(
						type => !REMOVED_KEYS.includes(type),
					)}
					show={this.state.showModal}
					addField={this.addField}
					onClose={this.toggleModal}
					deletedPaths={this.state.deletedPaths}
				/>
				<Loader
					show={this.state.isLoading}
					message="Re-indexing your data... Please wait!"
				/>
				<ErrorModal
					show={this.state.showError}
					errorLength={this.state.errorLength}
					error={this.state.errorMessage}
					onClose={this.hideErrorModal}
				/>
				<FeedbackModal
					show={this.state.showFeedback}
					timeTaken={this.state.timeTaken}
					onClose={() => window.location.reload()}
				/>
			</div>
		);
	}
}

// appId and appName are required for appbase ecosystem
// credentials (optional) and url are needed for non-appbase apps
Mappings.propTypes = {
	appId: string,
	appName: string.isRequired,
	credentials: string,
	url: string,
};
