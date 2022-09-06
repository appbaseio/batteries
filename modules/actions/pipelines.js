import yamlToJson from 'js-yaml';
import get from 'lodash/get';
import { createAction } from './utils';
import AppConstants from '../constants';
import {
	getPipelines as fetchPipelines,
	deletePipeline as removePipeline,
	updatePipeline,
	createPipeline,
	getPipelineScript,
	validatePipeline as validatePipelineFunc,
	getPipelinesUsageStats as fetchPipelinesUsageStats,
	getPipelineVersions as fetchPipelineVersions,
	makePipelineVersionLive as updatePipelineVersionLive,
	createPipelineVersion as postPipelineVersion,
	updatePipelineVersion as putPipelineVersion,
} from '../../utils/app';
import { generatePipelinePayload } from '../../utils/helpers';

export function getPipelinesScripts(pipelines) {
	return (dispatch) => {
		try {
			dispatch(createAction(AppConstants.APP.PIPELINES.GET_SCRIPTS));
			const scriptRefs = {};

			pipelines.forEach((pipeline) => {
				const pipelineJSON = yamlToJson.load(pipeline.content);
				if (Array.isArray(pipelineJSON.stages) && pipelineJSON.stages.length) {
					pipelineJSON.stages.forEach((stageItem) => {
						if (stageItem?.scriptRef) {
							scriptRefs[pipeline.id] = scriptRefs[pipeline.id]
								? [...scriptRefs[pipeline.id], stageItem?.scriptRef]
								: [stageItem?.scriptRef];
						}
					});
				}
			});
			if (Object.keys(scriptRefs).length) {
				const promises = [];
				Object.keys(scriptRefs).forEach((pipelineId) => {
					return scriptRefs[pipelineId].forEach((scriptRefName) =>
						promises.push(getPipelineScript(pipelineId, scriptRefName)),
					);
				});
				Promise.allSettled(promises)
					.then((values) => {
						const scriptContents = {};
						values.forEach((val) => {
							if (val.status === 'fulfilled') {
								scriptContents[val.value.id] = {
									...(scriptContents[val.value.id]
										? scriptContents[val.value.id]
										: {}),
									[val.value.key]: {
										content: val.value.content,
										extension: val.value.extension,
									},
								};
							}
						});
						return dispatch(
							createAction(
								AppConstants.APP.PIPELINES.GET_SCRIPTS_SUCCESS,
								scriptContents,
								null,
							),
						);
					})
					.catch((error) => {
						console.log(error);
						dispatch(
							createAction(AppConstants.APP.PIPELINES.GET_SCRIPTS_ERROR, null, error),
						);
					});
			}
		} catch (error) {
			console.log(error);
		}
	};
}

export function getPipelines() {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.PIPELINES.GET));
		return fetchPipelines()
			.then((res) => {
				dispatch(getPipelinesScripts(res));
				return dispatch(createAction(AppConstants.APP.PIPELINES.GET_SUCCESS, res, null));
			})
			.catch((error) => {
				console.log(error);
				dispatch(createAction(AppConstants.APP.PIPELINES.GET_ERROR, null, error));
			});
	};
}

export function getPipelinesUsageStats() {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.PIPELINES.GET_USAGE_STATS));
		return fetchPipelinesUsageStats()
			.then((res) => {
				dispatch(getPipelinesScripts(res));
				return dispatch(
					createAction(AppConstants.APP.PIPELINES.GET_USAGE_STATS_SUCCESS, res, null),
				);
			})
			.catch((error) => {
				dispatch(
					createAction(AppConstants.APP.PIPELINES.GET_USAGE_STATS_ERROR, null, error),
				);
			});
	};
}

export function addPipeline(pipeline) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.PIPELINES.CREATE, { ...pipeline }));
		return createPipeline(pipeline)
			.then((data) =>
				dispatch(
					createAction(AppConstants.APP.PIPELINES.CREATE_SUCCESS, { ...data }, null),
				),
			)
			.catch((error) =>
				dispatch(createAction(AppConstants.APP.PIPELINES.CREATE_ERROR, null, error)),
			);
	};
}

export function putPipeline(pipeline) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.PIPELINES.UPDATE_PIPELINE, { ...pipeline }));
		return updatePipeline(pipeline)
			.then(() =>
				dispatch(
					createAction(
						AppConstants.APP.PIPELINES.UPDATE_PIPELINE_SUCCESS,
						{ ...pipeline },
						null,
					),
				),
			)
			.catch((error) =>
				dispatch(
					createAction(
						AppConstants.APP.PIPELINES.UPDATE_PIPELINE_ERROR,
						{ ...pipeline },
						error,
					),
				),
			);
	};
}

export function deletePipeline(id) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.PIPELINES.DELETE, { id }));
		return removePipeline(id)
			.then(() => {
				return dispatch(
					createAction(AppConstants.APP.PIPELINES.DELETE_SUCCESS, { id }, null),
				);
			})
			.catch((error) =>
				dispatch(createAction(AppConstants.APP.PIPELINES.DELETE_ERROR, { id }, error)),
			);
	};
}

export function togglePipelineStatus(pipelineId, versionId, pipeline) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.PIPELINES.TOGGLE_STATUS, { ...pipeline }));
		return putPipelineVersion(pipelineId, versionId, pipeline)
			.then(() => {
				return dispatch(
					createAction(
						AppConstants.APP.PIPELINES.TOGGLE_STATUS_SUCCESS,
						{ ...pipeline },
						null,
					),
				);
			})
			.catch((error) =>
				dispatch(
					createAction(
						AppConstants.APP.PIPELINES.TOGGLE_STATUS_ERROR,
						{ ...pipeline },
						error,
					),
				),
			);
	};
}
export function clonePipeline(pipeline, newPipeline) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.PIPELINES.CLONE, { ...pipeline }));
		return createPipeline(newPipeline)
			.then((data) => {
				return dispatch(
					createAction(AppConstants.APP.PIPELINES.CLONE_SUCCESS, { ...data }, null, {
						...pipeline,
					}),
				);
			})
			.catch((error) =>
				dispatch(
					createAction(AppConstants.APP.PIPELINES.CLONE_ERROR, { ...pipeline }, error),
				),
			);
	};
}

export function reorderPipelines(id, versionId, priority) {
	return (dispatch, getState) => {
		const state = getState();
		const pipeline = get(state, '$getAppPipelines.results').find((item) => item.id === id);
		const pipelineScripts = get(state, '$getAppPipelines.scriptResults')?.[pipeline.id];
		const modifiedPipelineValue = JSON.stringify({
			...yamlToJson.load(pipeline.content),
			priority,
		});
		const pipelinePayload = generatePipelinePayload(
			modifiedPipelineValue,
			pipelineScripts,
			'content',
		);
		dispatch(createAction(AppConstants.APP.PIPELINES.REORDER, { id, priority }));
		return putPipelineVersion(id, versionId, pipelinePayload)
			.then(() => {
				dispatch(
					createAction(
						AppConstants.APP.PIPELINES.REORDER_SUCCESS,
						{ id, priority },
						null,
					),
				);
			})
			.catch((error) =>
				dispatch(
					createAction(AppConstants.APP.PIPELINES.REORDER_ERROR, { id, priority }, error),
				),
			);
	};
}

export function validatePipeline(pipelinePayload) {
	return (dispatch) => {
		dispatch(createAction(AppConstants.APP.PIPELINES.VALIDATE_PIPELINE, null));
		return validatePipelineFunc(pipelinePayload)
			.then((data) =>
				dispatch(
					createAction(
						AppConstants.APP.PIPELINES.VALIDATE_PIPELINE_SUCCESS,
						{ ...data },
						null,
					),
				),
			)
			.catch((error) =>
				dispatch(
					createAction(AppConstants.APP.PIPELINES.VALIDATE_PIPELINE_ERROR, null, error),
				),
			);
	};
}

export function getPipelineVersions(pipelineId) {
	return (dispatch) => {
		dispatch(
			createAction(AppConstants.APP.PIPELINES.GET_PIPELINE_VERSIONS, { id: pipelineId }),
		);
		return fetchPipelineVersions(pipelineId)
			.then((res) => {
				return dispatch(
					createAction(
						AppConstants.APP.PIPELINES.GET_PIPELINE_VERSIONS_SUCCESS,
						{ id: pipelineId, versions: res },
						null,
					),
				);
			})
			.catch((error) => {
				dispatch(
					createAction(
						AppConstants.APP.PIPELINES.GET_PIPELINE_VERSIONS_ERROR,
						null,
						error,
					),
				);
			});
	};
}

export function makePipelineVersionLive(pipelineId, versionId) {
	return (dispatch) => {
		dispatch(
			createAction(AppConstants.APP.PIPELINES.UPDATE_PIPELINE_VERSION_LIVE_STATUS, {
				id: pipelineId,
				versionId,
			}),
		);
		return updatePipelineVersionLive(pipelineId, versionId)
			.then((res) => {
				dispatch(getPipelines());
				return dispatch(
					createAction(
						AppConstants.APP.PIPELINES.UPDATE_PIPELINE_VERSION_LIVE_STATUS_SUCCESS,
						{ id: pipelineId, versionId, res },
						null,
					),
				);
			})
			.catch((error) => {
				return dispatch(
					createAction(
						AppConstants.APP.PIPELINES.UPDATE_PIPELINE_VERSION_LIVE_STATUS_ERROR,
						{ id: pipelineId },
						error,
					),
				);
			})
			.finally(() => {
				dispatch(getPipelineVersions(pipelineId));
			});
	};
}

export function createPipelineVersion(pipelineId, payload) {
	return (dispatch) => {
		dispatch(
			createAction(AppConstants.APP.PIPELINES.CREATE_VERSION, {
				id: pipelineId,
			}),
		);
		return postPipelineVersion(pipelineId, payload)
			.then((res) => {
				dispatch(getPipelineVersions(pipelineId));
				return dispatch(
					createAction(
						AppConstants.APP.PIPELINES.CREATE_VERSION_SUCCESS,
						{ id: pipelineId, ...res },
						null,
					),
				);
			})
			.catch((error) => {
				return dispatch(
					createAction(
						AppConstants.APP.PIPELINES.CREATE_VERSION_ERROR,
						{ id: pipelineId },
						error,
					),
				);
			})
			.finally(() => {
				dispatch(getPipelineVersions(pipelineId));
			});
	};
}

export function updateCurrentActiveVersion(pipelineId, version) {
	return (dispatch) => {
		dispatch(
			createAction(AppConstants.APP.PIPELINES.UPDATE_CURRENT_ACTIVE_VERSION, {
				id: pipelineId,
				version,
			}),
		);
	};
}

export function updatePipelineVersion(pipelineId, versionId, payload) {
	return (dispatch) => {
		dispatch(
			createAction(AppConstants.APP.PIPELINES.UPDATE_PIPELINE_VERSION, {
				id: pipelineId,
			}),
		);
		return putPipelineVersion(pipelineId, versionId, payload)
			.then((res) => {
				return dispatch(
					createAction(
						AppConstants.APP.PIPELINES.UPDATE_PIPELINE_VERSION_SUCCESS,
						{ id: pipelineId, ...res },
						null,
					),
				);
			})
			.catch((error) => {
				return dispatch(
					createAction(
						AppConstants.APP.PIPELINES.UPDATE_PIPELINE_VERSION_ERROR,
						{ id: pipelineId },
						error,
					),
				);
			});
	};
}
