import React, { Component } from 'react';
import { string, object, func, bool } from 'prop-types';
import { InfoCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { Tooltip, Button, Affix, message, Typography, Alert } from 'antd';
import get from 'lodash/get';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import Loader from '../shared/Loader';
import textUsecases from './usecases';
import { isEqual } from '../../utils';
import {
	updateMapping,
	updateMappingES7,
	transformToES5,
	reIndex,
	getSettings,
	REMOVED_KEYS,
	getTypesFromMapping,
	getESVersion,
	getNodes,
	updateMappingsProperties,
	getUpdatedSettings,
	applySynonyms,
	getLanguage,
	fetchSettings,
	deleteMappingField,
	addMappingField,
} from '../../utils/mappings';
import conversionMap from '../../utils/conversionMap';
import { getRawMappingsByAppName } from '../../modules/selectors';
import { setCurrentApp, getAppMappings as getMappings, clearMappings, getSettings as getSearchSettings } from '../../modules/actions';

import { Header, footerStyles } from './styles';
import NewFieldModal from './NewFieldModal';
import ErrorModal from './ErrorModal';
import { getURL, getVersion } from '../../../constants/config';
import Synonyms from './components/Synonyms';
import Replicas from './components/Replicas';
import Shards from './components/Shards';
import FeedbackModal from './components/FeedbackModal';
import { synonymsSettings } from '../../utils/analyzerSettings';
import MappingView from './components/MappingView';
import MappingsContainer from './components/MappingsContainer';
import { appendApp, removeAppData } from '../../../actions';
import SearchPreviewModal from '../../../components/SearchPreviewModal';

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

class Mappings extends Component {
	state = {
		mapping: {},
		dirty: false,
		showModal: false,
		isLoading: false,
		errorMessage: '',
		showError: false,
		errorLength: 0,
		deletedPaths: [],
		showFeedback: false,
		timeTaken: '0',
		synonyms: [],
		credentials: '',
		esVersion: '5',
		shardsModal: false,
		replicasModal: false,
	};

	usecases = textUsecases;

	originalMapping = null;

	async componentDidMount() {
		this.init();

		const { appName, appbaseCredentials, showReplicas } = this.props;
		const esVersion = getVersion() || (await getESVersion(appName, appbaseCredentials));
		if (showReplicas) {
			const nodes = await getNodes(appName, appbaseCredentials);

			this.setState({
				esVersion: esVersion.split('.')[0],
				totalNodes: nodes._nodes.total,
			});
		} else {
			this.setState({
				esVersion: esVersion.split('.')[0],
			});
		}
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
				this.initializeSettings();
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
			mapping,
			url,
			getSettingsAction,
		} = this.props;

		// Fetch search relevancy
		getSettingsAction(appName);

		// initialise or update current app state
		updateCurrentApp(appName, appId);

		if (mapping && Object.keys(mapping).length > 0) {
			this.handleMapping(mapping);
		}

		if (url && (!mapping || Object.keys(mapping).length === 0)) {
			getAppMappings(appName, appbaseCredentials, url);
			this.initializeSettings();
		}
	}

	loadData = () => {
		const { appName, getAppMappings, appbaseCredentials, url } = this.props;
		getAppMappings(appName, appbaseCredentials, url);
		this.initializeSettings();
	};

	initializeSettings = () => {
		const { appbaseCredentials, appName } = this.props;

		fetchSettings({ appName, credentials: appbaseCredentials }).then(
			({ shards, replicas, synonyms }) => {
				this.setState({
					shards,
					allocated_shards: shards,
					replicas,
					allocated_replicas: replicas,
					synonyms,
				});
			},
		);
	};

	/**
	 * used for rendering types in mappings view
	 */
	getType = type => {
		if (type === 'string') return 'text';
		return type;
	};

	setMapping = (field, type, usecase, oldUsecase) => {
		const { mapping: currentMapping, esVersion } = this.state;
		const { onChange, onUsecaseChange } = this.props;
		let mapping = null;
		if (+esVersion >= 7) {
			mapping = updateMappingES7(currentMapping, field, type, usecase);
		} else {
			mapping = updateMapping(currentMapping, field, type, usecase, esVersion);
		}
		this.setState(
			{
				mapping,
				dirty: true,
			},
			() => {
				if (onChange) {
					onChange(mapping);
					if (onUsecaseChange) {
						onUsecaseChange(field, type, usecase, oldUsecase);
					}
				}
			},
		);
	};

	handleSlider = (name, value) => {
		this.setState({
			[name]: value,
		});
	};

	handleModal = name => {
		this.setState(prevState => ({
			[name]: !prevState[name],
		}));
	};

	handleMapping = async res => {
		if (res) {
			const { appName, appbaseCredentials } = this.props;
			const fullVersion = getVersion() || (await getESVersion(appName, appbaseCredentials));

			const esVersion = fullVersion.split('.')[0];
			let mapping = res ? transformToES5(res) : res;

			if ((!mapping || !mapping.properties) && +esVersion >= 7) {
				// Default Value for Version 7 Mappings
				mapping = { properties: {} };
			}

			if (
				(!mapping || !mapping._doc || !mapping._doc.properties) &&
				+esVersion >= 6 &&
				+esVersion < 7
			) {
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

	deletePath = (path, removeType = false) => {
		const {
			deletedPaths: _deletedPaths,
			mapping: _mapping,
			esVersion,
			activeType,
		} = this.state;

		const updatedValues = deleteMappingField({
			_deletedPaths,
			_mapping,
			types: activeType,
			esVersion,
			removeType,
			path,
		});

		this.setState({
			dirty: true,
			...updatedValues,
		});
	};

	cancelChanges = () => {
		const { onChange } = this.props;
		this.setState(
			{
				mapping: this.originalMapping,
				dirty: false,
				deletedPaths: [],
				activeType: getTypesFromMapping(this.originalMapping),
			},
			() => {
				if (onChange) {
					onChange(this.originalMapping);
				}
			},
		);
	};

	hideErrorModal = () => {
		this.setState({
			showError: false,
			errorMessage: '',
		});
	};

	handleChange = e => {
		const { name, value } = e.target;
		this.setState({
			[name]: value,
		});
	};

	addField = ({ name, type, usecase }) => {
		const { mapping: _mapping, esVersion } = this.state;
		let currentMappings = _mapping;
		if ((!currentMappings || !currentMappings.properties) && +esVersion >= 7) {
			// Default Value for Version 7 Mappings
			currentMappings = { properties: {} };
		}

		if (
			(!currentMappings || !currentMappings._doc || !currentMappings._doc.properties) &&
			+esVersion >= 6 &&
			+esVersion < 7
		) {
			// Default Value for Version 6 Mappings
			currentMappings = { _doc: { properties: {} } };
		}

		const updatedValues = addMappingField({
			name,
			type,
			usecase,
			_mapping: currentMappings,
			esVersion,
		});

		this.setState({
			dirty: true,
			...updatedValues,
		});
	};

	reIndex = async callback => {
		this.setState({
			isLoading: true,
		});

		const { deletedPaths, activeType, esVersion, shards, replicas } = this.state;

		const { appId, credentials, enableNgram, enableAutoSuggestion } = this.props;

		let { mapping } = this.state;

		let appSettings = await getSettings(appId, credentials).then(data => data[appId].settings);

		appSettings = getUpdatedSettings({ settings: appSettings, shards, replicas });

		const language = getLanguage(appSettings);
		if (language) {
			mapping = updateMappingsProperties({
				types: activeType,
				esVersion,
				mapping,
				language,
			});
		}

		const excludedFields = deletedPaths
			.map(path => path.split('.properties.').join('.'))
			.map(path => {
				const i = path.indexOf('.') + 1;
				return path.substring(i);
			});

		const currentTime = Date.now();

		reIndex({
			mappings: mapping,
			appId,
			excludeFields: excludedFields,
			type: activeType,
			version: esVersion,
			credentials,
			settings: appSettings,
			enableNgram,
			enableAutoSuggestion,
		})
			.then(async () => {
				if (callback && typeof callback === 'function') {
					await callback();
				}
				this.handleReindex();
			})
			.catch((err) => {
				const failedTime = Date.now();
				if (failedTime - currentTime >= 60000) {
					this.setState({
						showFeedback: true,
					});
				} else {
					this.setState({
						isLoading: false,
						showError: true,
						errorLength: Array.isArray(err) && err.length,
						errorMessage: JSON.stringify(err, null, 4),
					});
				}
			});
	};

	getConversionMap = field => conversionMap[field] || [];

	updateShards = () => {
		this.handleModal('shardsModal');
		this.reIndex();
	};

	updateReplicas = () => {
		this.handleModal('replicasModal');
		this.reIndex();
	};

	updateSynonyms = async () => {
		const credentials = this.props.credentials || this.state.credentials;
		const { url, appName, mapping, appId } = this.props;

		const synonyms = this.state.synonyms.split('\n').map(pair =>
			pair
				.split(',')
				.map(synonym => synonym.trim())
				.join(','),
		);

		const { esVersion, activeType } = this.state;

		this.setState({
			synonymsLoading: true,
		});

		try {
			const response = await applySynonyms({
				appName,
				credentials,
				url,
				synonyms,
				types: activeType,
				esVersion,
				appId,
				mapping,
			});
			if (response) {
				message.success('Synonyms Updated');
			}
			this.setState({
				synonymsLoading: false,
				showSynonymModal: false,
			});
		} catch (e) {
			if (e.message === 'AWS') {
				const appSettings = synonymsSettings(synonyms);
				reIndex({
					mappings: mapping,
					appId,
					excludeFields: [],
					type: activeType,
					version: esVersion,
					credentials,
					settings: appSettings,
				})
					.then(() => {
						this.handleReindex();
					})
					.catch(err => {
						console.log(err);
						this.setState({
							isLoading: false,
							showError: true,
							errorLength: Array.isArray(err) && err.length,
							errorMessage: JSON.stringify(err, null, 4),
						});
					});
			} else {
				this.setState({
					synonymsLoading: false,
					showSynonymModal: false,
					showError: true,
					errorMessage: 'Unable to update Synonyms',
				});
				console.error(e);
			}
		}
	};

	handleReindex = () => {
		this.setState({
			showFeedback: false,
			isLoading: false,
			dirty: false,
		});
		this.loadData();
	};

	handleTimeout = () => {
		this.handleReindex();
	};

	render() {
		const {
			loadingError,
			isFetchingMapping,
			showShards,
			showReplicas,
			showSynonyms,
			showMappingInfo,
			renderLoader,
			renderError,
			renderMappingError,
			showCardWrapper,
			hideSearchType,
			hideAggsType,
			hideNoType,
			hideDataType,
			hideDelete,
			column,
			renderFooter,
			hidePropertiesType,
			appName,
			renderMappingInfo,
			onDeleteField,
			hideNoneTextType,
			hideGeoType,
			deleteLabel,
		} = this.props;

		const {
			mapping,
			isLoading,
			mappingsError,
			showError,
			errorLength,
			errorMessage,
			dirty,
			esVersion,
		} = this.state;
		if (loadingError) {
			return <p style={{ padding: 20 }}>{JSON.stringify(loadingError)}</p>;
		}
		if (isFetchingMapping) {
			return <Loader show message="Fetching mappings... Please wait!" />;
		}
		if ((isFetchingMapping || isLoading) && !mapping) {
			if (renderLoader) {
				return renderLoader();
			}
			return <Loader show message="Fetching mappings... Please wait!" />;
		}
		if (mappingsError) {
			if (renderMappingError) {
				return renderMappingError({
					showError,
					error: mappingsError,
				});
			}
			return (
				<ErrorModal
					show={showError}
					message="Some error occured while fetching the mappings"
					error={JSON.stringify(mappingsError, null, 2)}
					onClose={this.hideErrorModal}
				/>
			);
		}
		if (!mapping) return null;
		let hasMappings = true;

		if (+esVersion >= 7 && JSON.stringify(mapping) === JSON.stringify({ properties: {} })) {
			hasMappings = false;
		}

		if (
			+esVersion >= 6 &&
			+esVersion < 7 &&
			JSON.stringify(mapping) === JSON.stringify({ _doc: { properties: {} } })
		) {
			hasMappings = false;
		}

		if (+esVersion < 6 && Object.keys(mapping).length === 0) {
			hasMappings = false;
		}

		return (
            <React.Fragment>
				{showShards ? (
					<Shards
						handleSlider={this.handleSlider}
						updateShards={this.updateShards}
						handleModal={this.handleModal}
						shardsModal={this.state.shardsModal}
						shards={this.state.shards}
						allocated_shards={this.state.allocated_shards}
					/>
				) : null}

				{showReplicas ? (
					<Replicas
						handleSlider={this.handleSlider}
						updateReplicas={this.updateReplicas}
						handleModal={this.handleModal}
						replicasModal={this.state.replicasModal}
						totalNodes={this.state.totalNodes}
						replicas={this.state.replicas}
						allocated_replicas={this.state.allocated_replicas}
					/>
				) : null}
				{showSynonyms ? (
					<Synonyms
						synonyms={this.state.synonyms}
						handleModal={this.handleModal}
						showSynonymModal={this.state.showSynonymModal}
						handleChange={this.handleChange}
						updateSynonyms={this.updateSynonyms}
						synonymsLoading={this.state.synonymsLoading}
					/>
				) : null}
				<MappingsContainer
					showCardWrapper={showCardWrapper}
					showMappingInfo={showMappingInfo}
					handleModal={this.handleModal}
				>
					<div style={{ padding: showCardWrapper ? '5px 20px' : 0 }}>
						<Tooltip title="Fetch latest mappings">
							<Typography.Text
								style={{
									display: 'inline-block',
									color: '#1890ff',
									cursor: 'pointer',
									padding: '10px 0',
								}}
								strong
								onClick={this.loadData}
							>
								<ReloadOutlined style={{ margin: 0, marginRight: 5 }} />
								Reload Mappings
							</Typography.Text>
						</Tooltip>
						{dirty ? (
							<Alert
								type="warning"
								style={{ marginBottom: 10 }}
								description="Re-indexing is required for applying the mappings."
							/>
						) : null}
						<Header>
							<span>
								Field Name
								<Tooltip title={fieldNameMessage}>
									<span style={{ marginLeft: 5 }}>
										<InfoCircleOutlined />
									</span>
								</Tooltip>
							</span>
							<div className="col-container">
								<span className="col">
									Use case
									<Tooltip title={usecaseMessage}>
										<span style={{ marginLeft: 5 }}>
											<InfoCircleOutlined />
										</span>
									</Tooltip>
								</span>
								{hideDataType ? null : (
									<span className="col">
										Data Type
										<Tooltip title="Type of data in the corresponding field.">
											<span style={{ marginLeft: 5 }}>
												<InfoCircleOutlined />
											</span>
										</Tooltip>
									</span>
								)}
								{column ? <span className="col">{column.title}</span> : null}
							</div>
						</Header>
						<MappingView
							getType={this.getType}
							getConversionMap={this.getConversionMap}
							mapping={this.state.mapping}
							originalMapping={this.originalMapping}
							esVersion={this.state.esVersion}
							hideGeoType={hideGeoType}
							setMapping={this.setMapping}
							dirty={dirty}
							deleteLabel={deleteLabel}
							onDeleteField={onDeleteField}
							hideNoneTextType={hideNoneTextType}
							usecases={this.usecases}
							hideAggsType={hideAggsType}
							hasMappings={hasMappings}
							renderMappingInfo={renderMappingInfo}
							hideDataType={hideDataType}
							hideNoType={hideNoType}
							hidePropertiesType={hidePropertiesType}
							columnRender={column && column.render}
							hideDelete={hideDelete}
							hideSearchType={hideSearchType}
							deletePath={this.deletePath}
						/>
					</div>
					{!renderFooter ? (
						<Affix offsetBottom={0}>
							<div className={footerStyles}>
								<SearchPreviewModal app={appName} />
								<div>
									<Button
										type="primary"
										size="large"
										style={{ margin: '0 10px' }}
										onClick={this.reIndex}
										disabled={!dirty}
									>
										Confirm Mapping Changes
									</Button>
									<Button
										size="large"
										disabled={!dirty}
										onClick={this.cancelChanges}
									>
										Cancel
									</Button>
								</div>
							</div>
						</Affix>
					) : null}

					{renderFooter
						? renderFooter({
								cancelChanges: this.cancelChanges,
								isDirty: dirty,
								confirmChanges: this.reIndex,
						  })
						: null}
				</MappingsContainer>
				<NewFieldModal
					types={Object.keys(this.state.mapping).filter(
						(type) => !REMOVED_KEYS.includes(type),
					)}
					show={this.state.showModal}
					addField={this.addField}
					onClose={() => this.handleModal('showModal')}
					esVersion={this.state.esVersion}
					deletedPaths={this.state.deletedPaths}
				/>
				<Loader show={isLoading} message="Re-indexing your data... Please wait!" />
				{renderError ? (
					renderError({
						showError,
						error: errorMessage,
						length: errorLength,
					})
				) : (
					<ErrorModal
						show={showError}
						errorLength={errorLength}
						error={errorMessage}
						onClose={this.hideErrorModal}
					/>
				)}
				<FeedbackModal
					show={this.state.showFeedback}
					timeTaken={this.state.timeTaken}
					onClose={this.handleTimeout}
				/>
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
	showReplicas: bool,
	showShards: bool,
	showSynonyms: bool,
	showMappingInfo: bool,
	showCardWrapper: bool,
	hideSearchType: bool,
	hideAggsType: bool,
	hideNoType: bool,
	hideDelete: bool,
	hideDataType: bool,
	hidePropertiesType: bool,
	hideNoneTextType: bool,
	hideGeoType: bool,
	column: object,
	onChange: func,
	renderFooter: func,
	renderMappingInfo: func,
	onUsecaseChange: func,
	onDeleteField: func,
	deleteLabel: string,
	enableNgram: bool,
	enableAutoSuggestion: bool,
};

Mappings.defaultProps = {
	appId: null,
	credentials: null,
	url: getURL(),
	appbaseCredentials: null,
	mapping: null,
	showReplicas: false,
	showShards: false,
	showSynonyms: false,
	showMappingInfo: true,
	showCardWrapper: true,
	hideSearchType: false,
	hideNoneTextType: false,
	hideAggsType: false,
	hideNoType: false,
	hideGeoType: false,
	hideDataType: false,
	hideDelete: false,
	hidePropertiesType: false,
	column: null,
	onChange: null,
	renderFooter: null,
	onDeleteField: null,
	renderMappingInfo: null,
	onUsecaseChange: null,
	deleteLabel: '',
	enableNgram: true,
	enableAutoSuggestion: true,
};

const mapStateToProps = (state, props) => {
	const { username, password } = get(state, 'user.data', {});
	const appName = get(state, '$getCurrentApp.name');
	const defaultSettings = get(state.$getAppSettings, `defaultSettings`);
	return {
		appName,
		appId: get(state, '$getCurrentApp.name'),
		mapping: getRawMappingsByAppName(state) || null,
		isFetchingMapping: get(state, '$getAppMappings.isFetching'),
		loadingError: get(state, '$getAppMappings.error', null),
		appbaseCredentials: username ? `${username}:${password}` : null,
		credentials: username ? `${username}:${password}` : null,
		enableNgram:
			props.forceNgram ||
			get(
				get(state, ['$getAppSettings', 'settings', appName], defaultSettings),
				'indexSettings.enableNgram',
				true,
			),
		enableAutoSuggestion: get(
			get(state, ['$getAppSettings', 'settings', appName], defaultSettings),
			'indexSettings.enableAutoSuggestion',
			true,
		),
	};
};

const mapDispatchToProps = dispatch => ({
	updateCurrentApp: (appName, appId) => dispatch(setCurrentApp(appName, appId)),
	getAppMappings: (appName, credentials, url) => {
		dispatch(getMappings(appName, credentials, url));
	},
	clearMappings: appName => dispatch(clearMappings(appName)),
	addApp: appName => dispatch(appendApp(appName)),
	deleteApp: appName => dispatch(removeAppData(appName)),
	getSettingsAction: (name) => dispatch(getSearchSettings(name)),
});

const withRouterRef = Wrapped => {
	const WithRouter = withRouter(({ forwardRef, ...otherProps }) => (
		<Wrapped ref={forwardRef} {...otherProps} />
	));
	const withRouterAndRef = React.forwardRef((props, ref) => (
		<WithRouter {...props} forwardRef={ref} />
	));
	const name = Wrapped.displayName || Wrapped.name;
	withRouterAndRef.displayName = `withRouterRef(${name})`;
	return withRouterAndRef;
};

export default withRouterRef(
	connect(mapStateToProps, mapDispatchToProps, null, { withRef: true })(Mappings),
);
