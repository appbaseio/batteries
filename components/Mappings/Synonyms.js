import React, { Component } from 'react';
import {
 string, object, func, bool,
} from 'prop-types';
import {
	Tooltip,
	Icon,
	Input,
	Button,
	Modal,
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
	closeIndex,
	openIndex,
	getSettings,
	updateSynonyms as updateSynonymsData,
	getTypesFromMapping,
	getESVersion,
	putMapping,
	updateMappingES7,
} from '../../utils/mappings';
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
	promotionContainer,
} from './styles';
import ErrorModal from './ErrorModal';
import { css } from 'emotion';

const { TextArea } = Input;

const synonymMessage = () => (
	<div style={{ maxWidth: 220 }}>
		Editing synonyms isn{"'"}t a native feature in Elasticsearch. All appbase.io paid plans
		offer editable synonym.
	</div>
);

const orderedList = css`
	padding-left: 0;
	ol {
		padding-left: 0;
		margin-bottom: 15px;
	}
	h4,p {
		margin-bottom: 0;
	}
`

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

class Synonyms extends Component {
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

		return (
			<React.Fragment>
				
				<h2>Manage Synonyms</h2>
				<p>
					Synonyms allow users to find relevant content the way they actually search for it. We support the following synonym definition formats:
				</p>
				<ul className={orderedList}>
					<ol >
						<h4>Equivalent Synonyms:</h4> 
						<p>
							Synonyms separated by commas that have the same meaning. Searching for any of these terms will search for all its associated synonyms as well.
						</p>
							<strong>Examples:</strong><br />
							ipod, i-pod, i pod<br/>
							foozball, foosball<br/>
					</ol>
					<ol >
						<h4>Replacement Synonyms:</h4>
						<p>
							Search terms on the left hand side of `=>` are replaced by the terms on the right hand side.
						</p>
						<strong>Examples:</strong><br />
						"u s a, united states, united states of america ⇒ usa"<br />
						"cat, dog ⇒ pet"<br />
					</ol>
				</ul>

				<TextArea
					disabled={!this.state.editable}
					name="synonyms"
					value={this.state.synonyms}
					onChange={this.handleChange}
					placeholder={
						'Enter comma separated synonym pairs. Enter additional synonym pairs separated by new lines, e.g.\nbritish, english\nqueen, monarch'
					}
					style={{margin: '10px auto'}}
					autosize={{ minRows: 2, maxRows: 10 }}
				/>
				{this.state.editable ? (
					<Button loading={this.state.synonymsLoading}  type="primary" onClick={this.updateSynonyms}>
						Update Synonyms
					</Button>
				) : (
					this.renderPromotionalButtons('synonyms', synonymMessage)
				)}
				
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
			</React.Fragment>
		);
	}
}

// appId and appName are required for appbase ecosystem
// credentials (optional) and url are needed for non-appbase apps
Synonyms.propTypes = {
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

Synonyms.defaultProps = {
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
)(Synonyms);
