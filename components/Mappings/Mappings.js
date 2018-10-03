import React, { Component } from 'react';
import {
	string,
	object,
	func,
	bool,
} from 'prop-types';
import { Tooltip, Icon, Input } from 'antd';
import get from 'lodash/get';
import { connect } from 'react-redux';

import Loader from '../shared/Loader';
import textUsecases from './usecases';
import { isEqual } from '../../utils';
import {
	updateMapping,
	transformToES5,
	hasAggs,
	reIndex,
	closeIndex,
	openIndex,
	getSettings,
	updateSynonyms,
	REMOVED_KEYS,
} from '../../utils/mappings';
import conversionMap from '../../utils/conversionMap';
import mappingUsecase from '../../utils/mappingUsecase';
import { getRawMappingsByAppName, getAppPermissionsByName, getAppPlanByName } from '../../modules/selectors';
import {
	getPermission as getPermissionFromAppbase,
	setCurrentApp,
	getAppMappings as getMappings,
} from '../../modules/actions';

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
	promotionContainer,
} from './styles';
import Modal from '../shared/Modal';
import NewFieldModal from './NewFieldModal';
import ErrorModal from './ErrorModal';

const { TextArea } = Input;

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

const mappingMessage = () => (
	<div style={{ maxWidth: 220 }}>
		Editing mappings isn{"'"}t a native feature in Elasticsearch. All appbase.io paid plans
		offer editable mappings by performing a lossless re-indexing of your data whenever you edit
		them from this UI.
	</div>
);

const synonymMessage = () => (
	<div style={{ maxWidth: 220 }}>
		Editing synonyms isn{"'"}t a native feature in Elasticsearch. All appbase.io paid plans
		offer editable synonym.
	</div>
);

// eslint-disable-next-line
const FeedbackModal = ({ show, onClose, timeTaken }) => (
	<Modal show={show} onClose={onClose}>
		<h3>Re-index successful</h3>

		<p>
			The mappings have been updated and the data has been successfully re-indexed in{' '}
			{timeTaken}ms.
		</p>

		<div style={{ display: 'flex', flexDirection: 'row-reverse', margin: '10px 0' }}>
			<Button ghost onClick={onClose}>
				Done
			</Button>
		</div>
	</Modal>
);

class Mappings extends Component {
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
			showFeedback: false,
			timeTaken: '0',
			synonyms: [],
			credentials: '',
			showSynonymModal: false,
		};

		this.usecases = textUsecases;
		this.originalMapping = null;
	}

	static getDerivedStateFromProps(props, state) {
		// TODO: add logic for handling trial plans
		if (props.isPaid && !state.editable) {
			return ({
				editable: true,
			});
		}

		return null;
	}

	componentDidMount() {
		this.init();
	}

	componentDidUpdate(prevProps) {
		const {
			appName,
			appbaseCredentials,
			mapping,
			getAppMappings,
			isFetchingMapping,
		} = this.props;

		if (!isEqual(prevProps.mapping, mapping)) {
			this.handleMapping(mapping);
		}

		if (prevProps.appName !== appName) {
			this.init();
		}

		if (appbaseCredentials && prevProps.appbaseCredentials !== appbaseCredentials) {
			// handle mappings + synonyms if credentials have changed
			if (!isFetchingMapping) {
				getAppMappings(appName, appbaseCredentials);
			}
			this.initializeSynonymsData();
		}
	}

	// eslint-disable-next-line
	init() {
		const {
			appName,
			appId,
			updateCurrentApp,
			getAppMappings,
			credentials,
			url,
			mapping,
			appbaseCredentials,
			isFetchingMapping,
		} = this.props;

		// initialise or update current app state
		updateCurrentApp(appName, appId);

		if (mapping && !isFetchingMapping) {
			// if mapping already exists:
			// set existing mappings:
			this.handleMapping(mapping);

			// get synonyms
			this.initializeSynonymsData();
		} else if (url) {
			// get mappings for non-appbase apps
			getAppMappings(appName, credentials, url);
		} else {
			// this executes only for appbase.io hosted apps
			const { getPermission } = this.props;

			if (appbaseCredentials && !mapping) {
				// 2. get mappings if we have credentials
				getAppMappings(appName, appbaseCredentials);
			} else if (!appbaseCredentials) {
				// 2. get credentials (if not found) - before fetching mappings and synonyms
				getPermission(appName);
			}
		}
	}

	initializeSynonymsData = () => {
		const { appbaseCredentials } = this.props;

		this.fetchSynonyms(appbaseCredentials)
			.then((synonyms) => {
				this.setState({
					synonyms,
				});
			});
	};

	/**
	 * used for rendering types in mappings view
	 */
	getType = (type) => {
		if (type === 'string') return 'text';
		return type;
	};

	/**
	 * used for rendering usecase in mappings view
	 */
	getUsecase = (fields) => {
		const hasAggsFlag = hasAggs(fields);
		let hasSearchFlag = 0;
		if (fields.search) hasSearchFlag = 1;

		if (hasAggsFlag && hasSearchFlag) return 'searchaggs';
		if (!hasAggsFlag && hasSearchFlag) return 'search';
		if (hasAggsFlag && !hasSearchFlag) return 'aggs';
		return 'none';
	};

	setMapping = (field, type, usecase) => {
		const { mapping: currentMapping } = this.state;
		const mapping = updateMapping(currentMapping, field, type, usecase);
		this.setState({
			mapping,
			dirty: true,
		});
	};

	handleMapping = (res) => {
		this.originalMapping = res;
		this.setState({
			isLoading: false,
			mapping: res ? transformToES5(res) : res,
		});
	};

	handleSynonymModal = () => {
		this.setState({
			showSynonymModal: !this.state.showSynonymModal,
		});
	};

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

	handleChange = (e) => {
		const { name, value } = e.target;
		this.setState({
			[name]: value,
		});
	};

	fetchSynonyms = (credentials) => {
		const { url, appName } = this.props;
		return getSettings(appName, credentials, url).then((data) => {
			if (data[appName].settings && data[appName].settings.index) {
				const { index } = data[appName].settings;
				return (
					index.analysis && index.analysis.filter.synonyms_filter
						? index.analysis.filter.synonyms_filter.synonyms.join('\n')
						: ''
				);
			}
			return '';
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
			.map((path) => {
				const i = path.indexOf('.') + 1;
				return path.substring(i);
			});

		reIndex(this.state.mapping, this.props.appId, excludedFields)
			.then((timeTaken) => {
				this.setState({
					showFeedback: true,
					timeTaken,
				});
			})
			.catch((err) => {
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
						onChange={(e) => {
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
								<Icon type="delete" />
							</a>
						) : null}
					</h4>
					{Object.keys(fields).map((field) => {
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
											<Icon type="delete" />
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
											onChange={(e) => {
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

	renderPromotionalButtons = (type, message) => (this.props.url ? (
			<div className={promotionContainer}>
				<p>
					Get an appbase.io account to edit {type}
					<Tooltip title={message}>
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
			<div className={promotionContainer}>
				<p className="promotional-info">
					Upgrade your plan to edit {type}
					<Tooltip title={message}>
						<span>
							<Icon type="info-circle" />
						</span>
					</Tooltip>
				</p>
				<Button href="/billing" target="_blank" className="promotional-button">
					Upgrade Now
				</Button>
			</div>
		));

	updateSynonyms = () => {
		const credentials = this.props.credentials || this.state.credentials;
		const { url } = this.props;

		const synonyms = this.state.synonyms.split('\n').map(pair => pair
				.split(',')
				.map(synonym => synonym.trim())
				.join(','));

		closeIndex(this.props.appName, credentials, url)
			.then(() => updateSynonyms(this.props.appName, credentials, url, synonyms))
			.then(data => data.acknowledged)
			.then((isUpdated) => {
				if (isUpdated) {
					this.fetchSynonyms(credentials).then(newSynonyms => this.setState({
							synonyms: newSynonyms,
							showSynonymModal: false,
						}));
				} else {
					this.setState({
						showSynonymModal: false,
						showError: true,
						errorMessage: 'Unable to update Synonyms',
					});
				}
			})
			.then(() => openIndex(this.props.appName, credentials, url))
			.catch(() => {
				openIndex(this.props.appName, credentials, url);
				this.setState({
					showSynonymModal: false,
					showError: true,
					errorMessage: 'Unable to update Synonyms',
				});
			});
	};

	render() {
		if (this.props.loadingError) {
			return <p style={{ padding: 20 }}>{this.props.loadingError}</p>;
		}
		if ((this.props.isFetchingMapping || this.state.isLoading) && !this.state.mapping) {
			return <Loader show message="Fetching mappings... Please wait!" />;
		}
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
		if (!this.state.mapping) return null;
		return (
			<React.Fragment>
				<div className={card}>
					<div className="card-info">
						<HeaderWrapper>
							<h2 className={heading}>Manage Synonyms</h2>
							<p>Add new synonyms or edit the existing ones.</p>
						</HeaderWrapper>
						{this.state.editable ? (
							<Button ghost onClick={this.handleSynonymModal} className="card-button">
								{this.state.synonyms ? 'Edit' : 'Add'} Synonym
							</Button>
						) : (
							this.renderPromotionalButtons('synonyms', synonymMessage)
						)}
					</div>
				</div>
				<div className={card}>
					<div className="card-info">
						<HeaderWrapper>
							<h2 className={heading}>Manage Mappings</h2>
							<p>Add new fields or change the types of existing ones.</p>
						</HeaderWrapper>
						{this.state.editable ? (
							<Button ghost onClick={this.toggleModal} className="card-button">
								Add New Field
							</Button>
						) : (
							this.renderPromotionalButtons('mappings', mappingMessage)
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
							<div className="col-container">
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
						{
							(!this.state.mapping || !Object.keys(this.state.mapping).length)
								? (
									<p style={{ padding: '40px 0', color: '#999', textAlign: 'center' }}>
										No data or mappings found
									</p>
								)
								: null
						}
						{Object.keys(this.state.mapping).map((field) => {
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
						types={Object.keys(this.state.mapping).filter(type => !REMOVED_KEYS.includes(type))}
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
					<Modal show={this.state.showSynonymModal} onClose={this.handleSynonymModal}>
						<TextArea
							disabled={!this.state.editable}
							name="synonyms"
							value={this.state.synonyms}
							onChange={this.handleChange}
							placeholder={
								'Enter comma separated synonym pairs. Enter additional synonym pairs separated by new lines, e.g.\nbritish, english\nqueen, monarch'
							}
							autosize={{ minRows: 2, maxRows: 10 }}
						/>
						<Button
							onClick={this.updateSynonyms}
							style={{ float: 'right', margin: '10px 0' }}
						>
							{this.state.synonyms ? 'Save' : 'Add'} Synonym
						</Button>
						<Button
							ghost
							onClick={this.handleSynonymModal}
							style={{ float: 'right', margin: '10px' }}
						>
							Cancel
						</Button>
					</Modal>
				</div>
			</React.Fragment>
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
	appbaseCredentials: string,
	mapping: object,
	getAppMappings: func.isRequired,
	updateCurrentApp: func.isRequired,
	getPermission: func.isRequired,
	isFetchingMapping: bool.isRequired,
};

Mappings.defaultProps = {
	appId: null,
	credentials: null,
	url: undefined,
	appbaseCredentials: null,
	mapping: null,
};

const mapStateToProps = (state) => {
	const { username, password } = get(getAppPermissionsByName(state), 'credentials', {});
	return ({
		appName: get(state, '$getCurrentApp.name'),
		appId: get(state, '$getCurrentApp.id'),
		mapping: getRawMappingsByAppName(state) || null,
		isFetchingMapping: get(state, '$getAppMappings.isFetching'),
		loadingError: get(state, '$getAppMappings.error', null),
		isPaid: get(getAppPlanByName(state), 'isPaid'),
		appbaseCredentials: username ? `${username}:${password}` : null,
	});
};

const mapDispatchToProps = dispatch => ({
	updateCurrentApp: (appName, appId) => dispatch(setCurrentApp(appName, appId)),
	getPermission: appName => dispatch(getPermissionFromAppbase(appName)),
	getAppMappings: (appName, credentials, url) => {
		dispatch(getMappings(appName, credentials, url));
	},
});

export default connect(mapStateToProps, mapDispatchToProps)(Mappings);
