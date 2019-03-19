import React, { Component } from 'react';
import {
 string, object, func, bool,
} from 'prop-types';
import {
 Tooltip, Icon, Input, Popover, Card, Button, Modal, Dropdown, Menu, Affix, Slider, message,
} from 'antd';
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
	getTypesFromMapping,
	getESVersion,
	putMapping,
	getNodes,
} from '../../utils/mappings';
import conversionMap from '../../utils/conversionMap';
import mappingUsecase from '../../utils/mappingUsecase';
import { getRawMappingsByAppName } from '../../modules/selectors';
import { setCurrentApp, getAppMappings as getMappings, clearMappings } from '../../modules/actions';

import {
	card,
	cardTitle,
	Header,
	row,
	title,
	dropdown,
	item,
	subItem,
	footerStyles,
	deleteBtn,
} from './styles';
import NewFieldModal from './NewFieldModal';
import ErrorModal from './ErrorModal';
import { getURL } from '../../../constants/config';
import analyzerSettings from '../../utils/analyzerSettings';

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

// eslint-disable-next-line
const FeedbackModal = ({ show, onClose, timeTaken }) => (
	<Modal
		visible={show}
		title="Re-index successful"
		onOk={onClose}
		closable={false}
		onCancel={onClose}
		okText="Done"
	>
		<p>
			The mappings have been updated and the data has been successfully re-indexed.
		</p>
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
			showFeedback: false,
			timeTaken: '0',
			synonyms: [],
			credentials: '',
			showSynonymModal: false,
			esVersion: '5',
			shardsModal: false,
			replicasModal: false,
		};

		this.usecases = textUsecases;
		this.originalMapping = null;
	}

	async componentDidMount() {
		this.props.clearMappings(this.props.appName);
		this.init();

		const { appName, appbaseCredentials } = this.props;
		const esVersion = await getESVersion(appName, appbaseCredentials);
		const nodes = await getNodes(appName, appbaseCredentials);

		this.setState({
			esVersion: esVersion.split('.')[0],
			totalNodes: nodes._nodes.total,
		});
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
				this.initializeShards();
				this.initializeSynonymsData();
			}
		}
	}

	// eslint-disable-next-line
	init() {
		const {
			appName,
			appId,
			updateCurrentApp,
			getAppMappings,
			appbaseCredentials,
			url,
		} = this.props;

		// initialise or update current app state
		updateCurrentApp(appName, appId);

		if (url) {
			getAppMappings(appName, appbaseCredentials, url);
			this.initializeShards();
				this.initializeSynonymsData();
		}
	}

	initializeSynonymsData = () => {
		const { appbaseCredentials } = this.props;

		this.fetchSynonyms(appbaseCredentials).then((synonyms) => {
			this.setState({
				synonyms,
			});
		});
	};

	initializeShards = () => {
		const { appbaseCredentials } = this.props;

		this.fetchSettings(appbaseCredentials).then(({ shards, replicas }) => {
			this.setState({
				shards,
				allocated_shards: shards,
				replicas,
				allocated_replicas: replicas,
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

	handleShardsModal = () => {
		this.setState(prevState => ({
			shardsModal: !prevState.shardsModal,
		}));
	}

	handleReplicasModal = () => {
		this.setState(prevState => ({
			replicasModal: !prevState.replicasModal,
		}));
	}

	handleSlider = (name, value) => {
		this.setState({
			[name]: value,
		});
	}

	handleMapping = (res) => {
		if (res) {
			this.originalMapping = res;
			this.setState({
				isLoading: false,
				mapping: res ? transformToES5(res) : res,
				activeType: getTypesFromMapping(res),
			});
		}
	};

	handleSynonymModal = () => {
		this.setState({
			showSynonymModal: !this.state.showSynonymModal,
		});
	};

	deletePath = (path, removeType = false) => {
		let { activeType } = this.state;
		const { deletedPaths: _deletedPaths, mapping: _mapping } = this.state;
		const mapping = JSON.parse(JSON.stringify(_mapping));
		let deletedPaths = [..._deletedPaths];

		let fields = path.split('.');
		if (fields[fields.length - 1] === 'properties') {
			// when deleting an object
			fields = fields.slice(0, -1);
		}

		if (removeType) {
			const type = fields[0];
			// remove from active types
			activeType = activeType.filter(field => field !== type);

			// add all the fields to excludeFields
			const deletedTypesPath = Object.keys(_mapping[type].properties).map(
				property => `${type}.properties.${property}`,
			);
			deletedPaths = [...deletedPaths, ...deletedTypesPath];
		} else {
			deletedPaths = [..._deletedPaths, path];
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
			deletedPaths,
			activeType,
		});
	};

	cancelChanges = () => {
		this.setState({
			mapping: this.originalMapping,
			dirty: false,
			deletedPaths: [],
			activeType: getTypesFromMapping(this.originalMapping),
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
			if (get(data[appName], 'settings.index')) {
				const { index } = data[appName].settings;
				return index.analysis && index.analysis.filter.synonyms_filter
					? index.analysis.filter.synonyms_filter.synonyms.join('\n')
					: '';
			}
			return '';
		});
	};

	fetchSettings = (credentials) => {
		const { appName } = this.props;
		return getSettings(appName, credentials).then((data) => {
			const shards = get(data[appName], 'settings.index.number_of_shards');
			const replicas = get(data[appName], 'settings.index.number_of_replicas');

			return { shards, replicas };
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

	getUpdatedSettings = (settings) => {
		const { shards, replicas } = this.state;
		const updatedSettings = {
			index:{
				number_of_shards: shards,
				number_of_replicas: replicas,
			}
		};
		if (settings.index.analysis) {
			const { index: { analysis: { analyzer: currentAnalyzer, filter: currentFilter } } } = settings;
			const { analysis: { analyzer, filter } } = analyzerSettings;

			Object.keys(analyzer).forEach((key) => {
				if (!currentAnalyzer[key]) {
					currentAnalyzer[key] = analyzer[key];
				}
			});

			Object.keys(filter).forEach((key) => {
				if (!currentFilter[key]) {
					currentFilter[key] = filter[key];
				}
			});

			updatedSettings.index.analysis = settings.index.analysis;

			return updatedSettings;
		}
		updatedSettings.index.analysis = analyzerSettings.analysis;
		return updatedSettings;
	}

	reIndex = async () => {
		this.setState({
			isLoading: true,
		});

		const {
 deletedPaths, activeType, esVersion,
} = this.state;

		const { appId, credentials } = this.props;

		let { mapping } = this.state;

		let appSettings = await getSettings(appId, credentials).then((data) => {
			return data[appId].settings;
		});

		appSettings = this.getUpdatedSettings(appSettings);

		if (get(appSettings, 'index.analysis.analyzer.english_synonyms_analyzer')) {
			mapping = this.updateField();
		}

		const excludedFields = deletedPaths
			.map(path => path.split('.properties.').join('.'))
			.map((path) => {
				const i = path.indexOf('.') + 1;
				return path.substring(i);
			});

		reIndex(mapping, appId, excludedFields, activeType, esVersion, credentials, appSettings)
			.then(() => {
				this.setState({
					showFeedback: true,
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

			return this.renderDropDown({
				name: 'field-usecase',
				value: selected,
				handleChange: e => this.setMapping(fieldname, 'text', e.key),
				options: Object.entries(this.usecases).map(entry => ({
					value: entry[0],
					label: entry[1],
				})),
			});
		}
		return null;
	};

	getIcon = (type) => {
		const iconStyle = { margin: 0, fontSize: 13 };
		switch (type) {
			case 'text':
			case 'string':
			case 'keyword':
				return <Icon style={iconStyle} type="file-text" theme="outlined" />;
			case 'long':
			case 'integer':
				return <div style={iconStyle}>#</div>;
			case 'geo_point':
			case 'geo_shape':
				return <Icon style={iconStyle} type="environment" theme="outlined" />;
			case 'date':
				return <Icon style={iconStyle} type="calendar" theme="outlined" />;
			case 'double':
			case 'float':
				return <div style={iconStyle}>π</div>;
			case 'boolean':
				return <Icon style={iconStyle} type="check" theme="outlined" />;
			case 'object':
				return <div style={iconStyle}>{'{...}'}</div>;
			case 'image':
				return <Icon style={iconStyle} type="file-jpg" theme="outlined" />;
			default:
				return <Icon style={iconStyle} type="file-unknown" theme="outlined" />;
		}
	};

	getConversionMap = field => conversionMap[field] || [];

	getIcon = (type) => {
		const iconStyle = { margin: 0, fontSize: 13 };
		switch (type) {
			case 'text':
			case 'string':
			case 'keyword':
				return <Icon style={iconStyle} type="file-text" theme="outlined" />;
			case 'long':
			case 'integer':
				return <div style={iconStyle}>#</div>;
			case 'geo_point':
			case 'geo_shape':
				return <Icon style={iconStyle} type="environment" theme="outlined" />;
			case 'date':
				return <Icon style={iconStyle} type="calendar" theme="outlined" />;
			case 'double':
			case 'float':
				return <div style={iconStyle}>π</div>;
			case 'boolean':
				return <Icon style={iconStyle} type="check" theme="outlined" />;
			case 'object':
				return <div style={iconStyle}>{'{...}'}</div>;
			case 'image':
				return <Icon style={iconStyle} type="file-jpg" theme="outlined" />;
			default:
				return <Icon style={iconStyle} type="file-unknown" theme="outlined" />;
		}
	};

	updateShards = async () => {
		this.handleShardsModal();
		this.reIndex();
	}

	updateReplicas = async () => {
		this.handleReplicasModal();
		this.reIndex();
	}

	renderOptions = (originalFields, fields, field) => {
		const options = [];

		if (originalFields[field]) {
			options.push({
				label: this.getType(originalFields[field].type),
				value: this.getType(originalFields[field].type),
			});
			this.getConversionMap(this.getType(originalFields[field].type)).map(itemType => options.push({
					label: this.getType(itemType)
						.split('_')
						.join(' '),
					value: this.getType(itemType),
				}));
			return options;
		}
		options.push({
			label: this.getType(fields[field].type),
			value: this.getType(fields[field].type),
		});

		this.getConversionMap(this.getType(fields[field].type)).map(itemType => options.push({
				label: this.getType(itemType)
					.split('_')
					.join(' '),
				value: this.getType(itemType),
			}));
		return options;
	};

	renderDropDown = ({
		name,
		options,
		value,
		handleChange, // prettier-ignore
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
					{selectedOption.label || value}
					<Icon type="down" />
				</Button>
			</Dropdown>
		);
	};

	renderMapping = (type, fields, originalFields, address = '') => {
		if (fields) {
			return (
				<section key={type} className={row}>
					<h4 className={`${title} ${deleteBtn}`}>
						<span title={type}>{type}</span>
						<a
							type="danger"
							size="small"
							onClick={() => {
								this.deletePath(address, true);
							}}
						>
							<Icon type="delete" />
							Delete
						</a>
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
									{this.getIcon(propertyType)}
								</div>
							</Popover>
						);

						return (
							<div key={field} className={item}>
								<div className={deleteBtn}>
									<span title={field} css={flex}>
										{mappingInfo}
										{field}
									</span>
									<a
										onClick={() => {
											this.deletePath(`${address}.${field}`);
										}}
									>
										<Icon type="delete" />
										Delete
									</a>
								</div>
								<div className={subItem}>
									{this.renderUsecase(fields[field], field)}
									{this.renderDropDown({
										name: `${field}-mapping`,
										value: fields[field].type,
										handleChange: e => this.setMapping(field, e.key),
										options: this.renderOptions(originalFields, fields, field),
									})}
								</div>
							</div>
						);
					})}
				</section>
			);
		}
		return null;
	};

	updateField = () => {
		const mapping = JSON.parse(JSON.stringify(this.state.mapping));
		const { activeType } = this.state;
		if (mapping && activeType[0] && mapping[activeType[0]] && mapping[activeType[0]].properties) {
			const { properties } = mapping[activeType[0]];
			const keys = Object.keys(properties);

			keys.forEach((key) => {
				if (properties[key] && properties[key].fields && properties[key].fields.english) {
					properties[key].fields.english.search_analyzer = 'english_synonyms_analyzer';
					properties[key].fields.english.analyzer = 'english_analyzer';
				} else if (properties[key] && properties[key].fields) {
					properties[key].fields.english = {
						type: 'text',
						index: 'true',
						analyzer: 'english_analyzer',
						search_analyzer: 'english_synonyms_analyzer',
					};
				}
			});
		}
		return mapping;
	}

	updateSynonyms = () => {
		const credentials = this.props.credentials || this.state.credentials;
		const { url } = this.props;

		let synonymsUpdated = false;

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
						}));
					synonymsUpdated = true;
				} else {
					this.setState({
						showSynonymModal: false,
						showError: true,
						errorMessage: 'Unable to update Synonyms',
					});
				}
			})
			.then(() => openIndex(this.props.appName, credentials, url))
			.then(() => {
				if (synonymsUpdated) {
					// If synonyms request is successful than update mapping via PUT request
					const {activeType} = this.state;
					const updatedMappings = this.updateField();
					putMapping(this.props.appName, credentials, updatedMappings[activeType[0]], activeType[0]).then(({acknowledged}) => {
						if(acknowledged){
							message.success("Synonyms Updated")
							this.setState({
								mapping: updatedMappings
							});
						}
					});
				}
				this.setState({
					showSynonymModal: false,
					synonymsLoading: false,
				});
			})
			.catch((e) => {
				console.error(e)
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
				<Card
					hoverable
					title={(
						<div className={cardTitle}>
							<div>
								<h4>Manage Shards</h4>
								<p>Configure the number of shards for your app.</p>
							</div>
							<Button onClick={this.handleShardsModal} type="primary">
								Change Shards
							</Button>
						</div>
					)}
					bodyStyle={{ padding: 0 }}
					className={card}
				/>
				<Card
					hoverable
					title={(
						<div className={cardTitle}>
							<div>
								<h4>Manage Replicas</h4>
								<p>Configure the number of replicas for your app.</p>
							</div>
							<Button onClick={this.handleReplicasModal} type="primary">
								Change Replicas
							</Button>
						</div>
					)}
					bodyStyle={{ padding: 0 }}
					className={card}
				/>
				<Card
					hoverable
					title={(
<div className={cardTitle}>
							<div>
								<h4>Manage Synonyms</h4>
								<p>Add new synonyms or edit the existing ones.</p>
							</div>
							<Button type="primary" onClick={this.handleSynonymModal}>
								{this.state.synonyms ? 'Edit' : 'Add'} Synonym
							</Button>
</div>
)}
					bodyStyle={{ padding: 0 }}
					className={card}
				/>
				<Card
					hoverable
					title={(
<div className={cardTitle}>
							<div>
								<h4>Manage Mappings</h4>
								<p>Add new fields or change the types of existing ones.</p>
							</div>
							<Button onClick={this.toggleModal} type="primary">
								Add New Field
							</Button>
</div>
)}
					bodyStyle={{ padding: 0 }}
					className={card}
				>
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
						{!this.state.mapping || !Object.keys(this.state.mapping).length ? (
							<p style={{ padding: '40px 0', color: '#999', textAlign: 'center' }}>
								No data or mappings found
							</p>
						) : null}
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
					{this.state.dirty ? (
						<Affix offsetBottom={0}>
							<div className={footerStyles}>
								<Button
									type="primary"
									size="large"
									style={{ margin: '0 10px' }}
									onClick={this.reIndex}
								>
									Confirm Mapping Changes
								</Button>
								<Button size="large" onClick={this.cancelChanges}>Cancel</Button>
							</div>
						</Affix>
					) : null}
				</Card>
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
				<Modal
					visible={this.state.showSynonymModal}
					onOk={this.updateSynonyms}
					title="Add Synonym"
					okText={this.state.synonyms ? 'Save Synonym' : 'Add Synonym'}
					onCancel={this.handleSynonymModal}
				>
					<TextArea
						name="synonyms"
						value={this.state.synonyms}
						onChange={this.handleChange}
						placeholder={
							'Enter comma separated synonym pairs. Enter additional synonym pairs separated by new lines, e.g.\nbritish, english\nqueen, monarch'
						}
						autosize={{ minRows: 2, maxRows: 10 }}
					/>
				</Modal>
				<Modal
					visible={this.state.shardsModal}
					onOk={this.updateShards}
					title="Configure Shards"
					okText="Update"
					okButtonProps={{ disabled: this.state.allocated_shards == this.state.shards }}
					onCancel={this.handleShardsModal}
				>
					<h4>Move slider to change the number of shards for your app. Read more <a href="https://docs.appbase.io/concepts/mappings.html#manage-shards">here</a>.</h4>
					<Slider step={1} max={100} value={+this.state.shards} onChange={(value) => this.handleSlider('shards', value)} />
				</Modal>
				<Modal
					visible={this.state.replicasModal}
					onOk={this.updateReplicas}
					title="Configure Replicas"
					okText="Update"
					okButtonProps={{ disabled: this.state.allocated_replicas == this.state.replicas }}
					onCancel={this.handleReplicasModal}
				>
					<h4>Move slider to change the number of replicas for your app.</h4>
					<Slider step={null} marks={{ 0: '0', 1: '1', 2: '2' }} max={this.state.totalNodes - 1} value={+this.state.replicas} onChange={(value) => this.handleSlider('replicas', value)} />
				</Modal>
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
	isFetchingMapping: bool.isRequired,
};

Mappings.defaultProps = {
	appId: null,
	credentials: null,
	url: getURL(),
	appbaseCredentials: null,
	mapping: null,
};

const mapStateToProps = (state) => {
	const { username, password } = get(state, 'user.data', {});
	return {
		appName: get(state, '$getCurrentApp.name'),
		appId: get(state, '$getCurrentApp.name'),
		mapping: getRawMappingsByAppName(state) || null,
		isFetchingMapping: get(state, '$getAppMappings.isFetching'),
		loadingError: get(state, '$getAppMappings.error', null),
		appbaseCredentials: username ? `${username}:${password}` : null,
		credentials: username ? `${username}:${password}` : null,
	};
};

const mapDispatchToProps = dispatch => ({
	updateCurrentApp: (appName, appId) => dispatch(setCurrentApp(appName, appId)),
	getAppMappings: (appName, credentials, url) => {
		dispatch(getMappings(appName, credentials, url));
	},
	clearMappings: appName => dispatch(clearMappings(appName)),
});

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(Mappings);
