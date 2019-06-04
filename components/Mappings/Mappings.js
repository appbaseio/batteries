import React, { Component } from 'react';
import {
 string, object, func, bool,
} from 'prop-types';
import {
	Tooltip,
	Icon,
	Input,
	Popover,
	Card,
	Button,
	Modal,
	Dropdown,
	Menu,
	Affix,
	Slider,
	message,
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
	updateSynonyms as updateSynonymsData,
	REMOVED_KEYS,
	getTypesFromMapping,
	getESVersion,
	putMapping,
	updateMappingES7,
} from '../../utils/mappings';
import conversionMap from '../../utils/conversionMap';
import mappingUsecase from '../../utils/mappingUsecase';
import analyzerSettings from '../../utils/analyzerSettings';
import {
	getRawMappingsByAppName,
	getAppPermissionsByName,
	getAppPlanByName,
} from '../../modules/selectors';
import {
	getPermission as getPermissionFromAppbase,
	setCurrentApp,
	getAppMappings as getMappings,
	clearMappings,
} from '../../modules/actions';

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
	promotionContainer,
} from './styles';
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

const shardsMessage = () => (
	<div style={{ maxWidth: 220 }}>
		Editing number of shards isn{"'"}t a native feature in Elasticsearch. All appbase.io paid
		plans offer setting number of Shards.
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
			The mappings have been updated and the data has been successfully re-indexed in{' '}
			{timeTaken}ms.
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
			isReIndexing: false,
			errorMessage: '',
			showError: false,
			errorLength: 0,
			deletedPaths: [],
			editable: false,
			showFeedback: false,
			timeTaken: '0',
			synonyms: [],
			synonymsLoading: false,
			showSynonymModal: false,
			esVersion: '5',
			shardsModal: false,
		};

		this.usecases = textUsecases;
		this.originalMapping = null;
	}

	static getDerivedStateFromProps(props, state) {
		// TODO: add logic for handling trial plans
		if (props.isPaid && !state.editable) {
			return {
				editable: true,
			};
		}

		return null;
	}

	async componentDidMount() {
		this.props.clearMappings(this.props.appName);
		this.init();

		const { appName } = this.props;
		const esVersion = await getESVersion(appName);

		this.setState({
			esVersion: esVersion.split('.')[0],
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

		const { isLoading } = this.state;

		if (!isEqual(prevProps.mapping, mapping) || (isLoading && mapping)) {
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
			this.initializeShards();
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
			appbaseCredentials,
		} = this.props;

		// initialise or update current app state
		updateCurrentApp(appName, appId);

		if (url) {
			// get mappings for non-appbase apps
			getAppMappings(appName, credentials, url);
		} else {
			// this executes only for appbase.io hosted apps
			const { getPermission } = this.props;

			if (appbaseCredentials) {
				// 2. get mappings if we have credentials
				getAppMappings(appName, appbaseCredentials);
				this.initializeSynonymsData();
				this.initializeShards();
			} else if (!appbaseCredentials) {
				// 2. get credentials (if not found) - before fetching mappings and synonyms
				getPermission(appName);
			}
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

		this.fetchSettings(appbaseCredentials).then((shards) => {
			this.setState({
				shards,
				allocated_shards: shards,
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
		const { mapping: currentMapping, esVersion } = this.state;
		let mapping = null;
		if (+esVersion >= 7) {
			mapping = updateMappingES7(currentMapping, field, type, usecase);
		} else {
			mapping = updateMapping(currentMapping, field, type, usecase, esVersion);
		}
		this.setState({
			mapping,
			dirty: true,
		});
	};

	handleMapping = async (res) => {
		if (res) {
			const { appName } = this.props;
			const {esVersion} = this.state;
			let mapping = res ? transformToES5(res) : res;

			if (!mapping.properties && esVersion >= 7) {
				// Default Value for Version 7 Mappings
				mapping = { properties: { } };
			}

			if ((!mapping._doc || !mapping._doc.properties) && esVersion >= 6 && esVersion < 7) {
				// Default Value for Version 6 Mappings
				mapping = { _doc: { properties: {} } };
			}

			this.originalMapping = mapping;
			this.setState({
				isLoading: false,
				mapping,
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

	handleShardsModal = () => {
		this.setState(prevState => ({
			shardsModal: !prevState.shardsModal,
		}));
	};

	handleSlider = (value) => {
		this.setState({
			shards: value,
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
		const { url, appName } = this.props;
		return getSettings(appName, credentials, url).then(data => get(data[appName], 'settings.index.number_of_shards'));
	};

	updateField = () => {
		const mapping = JSON.parse(JSON.stringify(this.state.mapping));
		const { activeType } = this.state;
		if (
			mapping
			&& activeType[0]
			&& mapping[activeType[0]]
			&& mapping[activeType[0]].properties
		) {
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
	};

	getUpdatedSettings = (settings) => {
		if (settings && settings.analyzer) {
			const { analyzer: currentAnalyzer, filter: currentFilter } = settings;
			const {
				analysis: { analyzer, filter },
			} = analyzerSettings;

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

			return settings;
		}

		return analyzerSettings.analysis;
	};

	addField = ({ name, type, usecase }) => {
		const mapping = JSON.parse(JSON.stringify(this.state.mapping));
		const fields = name.split('.');
		let newUsecase = {};

		if (usecase) {
			newUsecase = mappingUsecase[usecase];
		}

		if (+this.state.esVersion >= 7) {
			const fieldChanged = name.split('.')[1];
			mapping.properties[fieldChanged] = {
				type,
				...newUsecase,
			};
		} else {
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
		}

		this.setState({
			dirty: true,
			mapping,
		});
	};

	reIndex = async () => {
		this.setState({
			isReIndexing: true,
		});

		const {
 deletedPaths, activeType, esVersion, shards,
} = this.state;

		let { mapping } = this.state;

		const { appbaseCredentials, url, appName } = this.props;

		// Fetch latest settings so that we dont override settings.
		let settings = await getSettings(appName, appbaseCredentials, url).then(data => get(data[appName], 'settings.index.analysis'));

		settings = this.getUpdatedSettings(settings);

		// We need to update english search_analyzer to synonyms_analzer.
		// This is useful when we have the synonyms in place and change the mapping
		// the english field have english_analyzer so we need to change it to search_analyzer.

		if (get(settings, 'analyzer.english_synonyms_analyzer')) {
			mapping = this.updateField();
		}

		const excludedFields = deletedPaths
			.map(path => path.split('.properties.').join('.'))
			.map((path) => {
				const i = path.indexOf('.') + 1;
				return path.substring(i);
			});

		reIndex(mapping, appName, excludedFields, activeType, esVersion, shards, settings)
			.then((timeTaken) => {
				this.setState({
					showFeedback: true,
					timeTaken,
				});
			})
			.catch((err) => {
				this.setState({
					isReIndexing: false,
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

			return (
				<span style={{ boxShadow: 'none', border: 0 }} className={dropdown}>
					{this.usecases[selected]}
				</span>
			);
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
						{this.state.editable && this.state.esVersion < 6 ? (
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
									{this.state.editable ? (
										<a
											onClick={() => {
												const addressField = +this.state.esVersion >= 7 ? `properties.${field}` : `${address}.${field}`
												this.deletePath(addressField);
											}}
										>
											<Icon type="delete" />
											Delete
										</a>
									) : null}
								</div>
								<div className={subItem}>
									{this.renderUsecase(fields[field], field)}
									{this.state.editable ? (
										this.renderDropDown({
											name: `${field}-mapping`,
											value: fields[field].type,
											handleChange: e => this.setMapping(field, e.key),
											options: this.renderOptions(
												originalFields,
												fields,
												field,
											),
										})
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
				<Button href="https://appbase.io" className="promotional-button" target="_blank">
					Signup Now
				</Button>
			</div>
		) : (
			<div className={promotionContainer}>
				<p>
					Upgrade your plan to edit {type}
					<Tooltip title={message}>
						<span>
							<Icon type="info-circle" />
						</span>
					</Tooltip>
				</p>
				<Button
					href="/app?view=billing"
					className="promotional-button"
					target="_blank"
					type="primary"
				>
					Upgrade Now
				</Button>
			</div>
		));

	updateShards = () => {
		this.handleShardsModal();
		this.reIndex();
	};

	updateSynonyms = () => {
		const credentials = this.props.appbaseCredentials;
		const { url } = this.props;
		let synonymsUpdated = false;
		this.setState({
			synonymsLoading: true,
		});

		const synonyms = this.state.synonyms.split('\n').map(pair => pair
				.split(',')
				.map(synonym => synonym.trim())
				.join(','));

		closeIndex(this.props.appName, credentials, url)
			.then(() => updateSynonymsData(this.props.appName, credentials, url, synonyms))
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
						synonymsLoading: false,
					});
				}
			})
			.then(() => openIndex(this.props.appName, credentials, url))
			.then(() => {
				if (synonymsUpdated) {
					// If synonyms request is successful than update mapping via PUT request
					const { activeType } = this.state;
					const updatedMappings = this.updateField();
					putMapping(
						this.props.appName,
						credentials,
						url,
						updatedMappings[activeType[0]],
						activeType[0],
					).then(({ acknowledged }) => {
						if (acknowledged) {
							message.success('Synonyms Updated');
							this.setState({
								mapping: updatedMappings,
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
				console.error(e);
				openIndex(this.props.appName, credentials, url);
				this.setState({
					showSynonymModal: false,
					showError: true,
					errorMessage: 'Unable to update Synonyms',
					synonymsLoading: false,
				});
			});
	};

	getShardValues = (max, step = 3) => {
		const shards = {};

		for (let i = 3; i <= max; i += 3) {
			shards[i] = i;
		}
		return shards;
	};

	getShards = () => {
		const { isBootstrapPlan, isGrowthPlan } = this.props;
		if (isBootstrapPlan) {
			return this.getShardValues(9);
		} if (isGrowthPlan) {
			return this.getShardValues(21);
		}
		return 0;
	};

	getMaxShards = () => {
		const { isBootstrapPlan, isGrowthPlan } = this.props;
		if (isBootstrapPlan) {
			return 9;
		} if (isGrowthPlan) {
			return 21;
		}
		return 0;
	};

	handleClose = () => {
		window.location.reload();
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

		const { mapping } = this.state;
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
							{this.state.editable ? (
								<Button onClick={this.handleShardsModal} type="primary">
									Change Shards
								</Button>
							) : (
								this.renderPromotionalButtons('shards', shardsMessage)
							)}
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

							{this.state.editable ? (
								<Button type="primary" onClick={this.handleSynonymModal}>
									{`${this.state.synonyms ? 'Edit' : 'Add'} Synonyms`}
								</Button>
							) : (
								this.renderPromotionalButtons('synonyms', synonymMessage)
							)}
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
							{this.state.editable ? (
								<Button onClick={this.toggleModal} type="primary">
									Add New Field
								</Button>
							) : (
								this.renderPromotionalButtons('mappings', mappingMessage)
							)}
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
						{!mapping || !Object.keys(mapping).length ? (
							<p style={{ padding: '40px 0', color: '#999', textAlign: 'center' }}>
								No data or mappings found
							</p>
						) : null}
						{Object.keys(mapping).map((field) => {
							if (mapping[field]) {
								let currentMappingFields = mapping[field].properties;
								let originalMappingFields = this.originalMapping[field]
									? this.originalMapping[field].properties
									: mapping[field].properties;
								const fieldName = `${field}.properties`;

								if (+this.state.esVersion >= 7) {
									currentMappingFields = mapping[field];
									originalMappingFields = this.originalMapping[field] ? this.originalMapping[field] : mapping[field];
								}

								return this.renderMapping(
									field,
									currentMappingFields,
									originalMappingFields,
									fieldName,
								);
							}
							return null;
						})}
					</div>
					{this.state.dirty && this.state.editable ? (
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
								<Button size="large" onClick={this.cancelChanges}>
									Cancel
								</Button>
							</div>
						</Affix>
					) : null}
				</Card>

				<NewFieldModal
					types={Object.keys(this.state.mapping).filter(
						type => !REMOVED_KEYS.includes(type),
					)}
					esVersion={this.state.esVersion}
					show={this.state.showModal}
					addField={this.addField}
					onClose={this.toggleModal}
					deletedPaths={this.state.deletedPaths}
				/>
				<Loader
					show={this.state.isReIndexing}
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
					onClose={this.handleClose}
				/>
				<Modal
					visible={this.state.showSynonymModal}
					onOk={this.updateSynonyms}
					title="Add Synonym"
					okText={this.state.synonyms ? 'Save Synonym' : 'Update Synonym'}
					okButtonProps={{ loading: this.state.synonymsLoading }}
					onCancel={this.handleSynonymModal}
				>
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
				</Modal>
				{this.state.editable && (
					<Modal
						visible={this.state.shardsModal}
						onOk={this.updateShards}
						title="Configure Shards"
						okText="Update"
						okButtonProps={{
							disabled: this.state.allocated_shards == this.state.shards,
						}}
						onCancel={this.handleShardsModal}
					>
						<h4>
							Move slider to change the number of shards for your app. Read more{' '}
							<a href="https://docs.appbase.io/concepts/mappings.html#manage-shards" target="_blank" rel="noopener noreferrer">
								here
							</a>
							.
						</h4>
						<Slider
							tooltipVisible={false}
							step={null}
							max={this.getMaxShards()}
							value={+this.state.shards}
							marks={{
								[this.state.allocated_shards]: this.state.allocated_shards,
								...this.getShards(),
							}}
							onChange={this.handleSlider}
						/>
					</Modal>
				)}
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
	const appPlan = getAppPlanByName(state);
	return {
		appName: get(state, '$getCurrentApp.name'),
		appId: get(state, '$getCurrentApp.id'),
		mapping: getRawMappingsByAppName(state) || null,
		isFetchingMapping: get(state, '$getAppMappings.isFetching'),
		loadingError: get(state, '$getAppMappings.error', null),
		isPaid: get(appPlan, 'isPaid'),
		isBootstrapPlan: get(appPlan, 'isBootstrap'),
		isGrowthPlan: get(appPlan, 'isGrowth'),
		appbaseCredentials: username ? `${username}:${password}` : null,
	};
};

const mapDispatchToProps = dispatch => ({
	updateCurrentApp: (appName, appId) => dispatch(setCurrentApp(appName, appId)),
	getPermission: appName => dispatch(getPermissionFromAppbase(appName)),
	getAppMappings: (appName, credentials, url) => {
		dispatch(getMappings(appName, credentials, url));
	},
	clearMappings: appName => dispatch(clearMappings(appName)),
});

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(Mappings);
