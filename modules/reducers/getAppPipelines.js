import AppConstants from '../constants';

const initialAppState = {};

function getAppPipelines(state = initialAppState, action) {
	switch (action.type) {
		case AppConstants.APP.PIPELINES.GET:
			return {
				isFetching: true,
				success: false,
				error: false,
			};
		case AppConstants.APP.PIPELINES.GET_SUCCESS:
			return {
				isFetching: false,
				success: true,
				error: false,
				results: action.payload,
			};
		case AppConstants.APP.PIPELINES.GET_ERROR:
			return {
				isFetching: false,
				success: false,
				error: action.payload,
			};

		case AppConstants.APP.PIPELINES.GET_PIPELINE_VERSIONS: {
			const { id } = action.payload;
			const pipelines = state.results.map((pipeline) => {
				if (pipeline.id === id) {
					return {
						...pipeline,
						isFetchingVersions: true,
						isFetchingVersionsError: false,
						versions: null,
					};
				}

				return pipeline;
			});
			return {
				...state,
				results: pipelines,
			};
		}
		case AppConstants.APP.PIPELINES.GET_PIPELINE_VERSIONS_SUCCESS: {
			const { id, versions } = action.payload;
			const pipelines = state.results.map((pipeline) => {
				if (pipeline.id === id) {
					return {
						...pipeline,
						isFetchingVersions: false,
						versions,
						isFetchingVersionsError: false,
					};
				}

				return pipeline;
			});
			return {
				...state,
				results: pipelines,
			};
		}
		case AppConstants.APP.PIPELINES.GET_PIPELINE_VERSIONS_ERROR: {
			const { id, error } = action.payload;
			const pipelines = state.results.map((pipeline) => {
				if (pipeline.id === id) {
					return {
						...pipeline,
						isFetchingVersions: false,
						versions: [],
						isFetchingVersionsError: error,
					};
				}

				return pipeline;
			});
			return {
				...state,
				results: pipelines,
			};
		}

		case AppConstants.APP.PIPELINES.GET_SCRIPTS:
			return {
				...state,
				isFetchingPipelineScripts: true,
				scriptFetchSuccess: false,
			};
		case AppConstants.APP.PIPELINES.GET_SCRIPTS_SUCCESS:
			return {
				...state,
				isFetchingPipelineScripts: false,
				scriptFetchSuccess: true,
				scriptFetchError: false,
				scriptResults: action.payload,
			};
		case AppConstants.APP.PIPELINES.GET_SCRIPTS_ERROR:
			return {
				...state,
				isFetchingPipelineScripts: false,
				scriptFetchSuccess: true,
				scriptFetchError: action.payload,
			};

		case AppConstants.APP.PIPELINES.CREATE: {
			return {
				...state,
				create: {
					isLoading: true,
					error: null,
				},
			};
		}
		case AppConstants.APP.PIPELINES.CREATE_SUCCESS: {
			return {
				...state,
				results: [...state.results, { ...action.payload }],
				create: {
					isLoading: false,
					error: null,
				},
			};
		}
		case AppConstants.APP.PIPELINES.CREATE_ERROR: {
			return {
				...state,
				create: {
					isLoading: false,
					error: action.error,
				},
			};
		}

		case AppConstants.APP.PIPELINES.TOGGLE_STATUS: {
			const updatedResults = state.results.map((item) =>
				item.id === action.payload.id
					? {
							...item,
							isToggling: true,
					  }
					: item,
			);
			return {
				...state,
				results: updatedResults,
			};
		}
		case AppConstants.APP.PIPELINES.TOGGLE_STATUS_SUCCESS: {
			const updatedResults = state.results.map((item) =>
				item.id === action.payload.id
					? {
							...item,
							enabled: action.payload.enabled,
							isToggling: false,
					  }
					: item,
			);
			return {
				...state,
				results: updatedResults,
			};
		}
		case AppConstants.APP.PIPELINES.TOGGLE_STATUS_ERROR: {
			const updatedResults = state.results.map((item) =>
				item.id === action.payload.id
					? {
							...item,
							isToggling: false,
							toggleError: action.error,
					  }
					: item,
			);
			return {
				...state,
				results: updatedResults,
			};
		}

		case AppConstants.APP.PIPELINES.UPDATE_PIPELINE: {
			const updatedResults = state.results.map((item) =>
				item.id === action.payload.id
					? {
							...item,
							update: {
								isLoading: true,
								error: null,
							},
					  }
					: item,
			);
			return {
				...state,
				results: updatedResults,
			};
		}
		case AppConstants.APP.PIPELINES.UPDATE_PIPELINE_SUCCESS: {
			const updatedResults = state.results.map((item) =>
				item.id === action.payload.id
					? {
							...item,
							...action.payload,
							update: {
								isLoading: false,
								error: null,
							},
					  }
					: item,
			);
			return {
				...state,
				results: updatedResults,
			};
		}
		case AppConstants.APP.PIPELINES.UPDATE_PIPELINE_ERROR: {
			const updatedResults = state.results.map((item) =>
				item.id === action.payload.id
					? {
							...item,
							update: {
								isLoading: false,
								error: action.error,
							},
					  }
					: item,
			);
			return {
				...state,
				results: updatedResults,
			};
		}

		case AppConstants.APP.PIPELINES.DELETE: {
			const updatedResults = state.results.map((item) =>
				item.id === action.payload.id
					? {
							...item,
							isDeleting: true,
					  }
					: item,
			);
			return {
				...state,
				results: updatedResults,
			};
		}
		case AppConstants.APP.PIPELINES.DELETE_SUCCESS: {
			const filteredResults = state.results.filter((item) => item.id !== action.payload.id);
			return {
				...state,
				results: filteredResults,
				deleted: action.payload.id,
			};
		}
		case AppConstants.APP.PIPELINES.DELETE_ERROR: {
			const updatedResults = state.results.map((item) =>
				item.id === action.payload.id
					? {
							...item,
							isDeleting: false,
							deleteError: action.error,
					  }
					: item,
			);
			return {
				...state,
				results: updatedResults,
			};
		}
		case AppConstants.APP.PIPELINES.CLONE: {
			const updatedResults = state.results.map((item) =>
				item.id === action.payload.id
					? {
							...item,
							isCloning: true,
					  }
					: item,
			);
			return {
				...state,
				results: updatedResults,
			};
		}
		case AppConstants.APP.PIPELINES.CLONE_SUCCESS: {
			const updatedResults = state.results.map((item) =>
				item.id === action.meta.id
					? {
							...item,
							isCloning: false,
					  }
					: item,
			);
			return {
				...state,
				results: [...updatedResults, { ...action.payload }],
			};
		}
		case AppConstants.APP.PIPELINES.CLONE_ERROR: {
			const updatedResults = state.results.map((item) =>
				item.id === action.payload.id
					? {
							...item,
							isCloning: false,
							cloneError: action.error,
					  }
					: item,
			);
			return {
				...state,
				results: updatedResults,
			};
		}

		case AppConstants.APP.PIPELINES.REORDER: {
			const { id, priority } = action.payload;
			const reorderedPipelines = state.results.map((pipeline) => {
				if (pipeline.id === id) {
					return {
						...pipeline,
						priority,
					};
				}

				return pipeline;
			});
			return {
				...state,
				results: reorderedPipelines,
				reordering: true,
			};
		}
		case AppConstants.APP.PIPELINES.REORDER_SUCCESS: {
			return {
				...state,
				reordering: false,
				error: null,
			};
		}
		case AppConstants.APP.PIPELINES.REORDER_ERROR: {
			const { id, priority } = action.payload;
			const revertedPipelines = state.results.map((pipeline) => {
				if (pipeline.id === id) {
					return {
						...pipeline,
						priority,
					};
				}
				return pipeline;
			});
			return {
				...state,
				results: revertedPipelines,
				reordering: false,
				error: action.error,
			};
		}
		case AppConstants.APP.PIPELINES.VALIDATE_PIPELINE: {
			return {
				...state,
				validationResponse: '',
				validating: true,
			};
		}
		case AppConstants.APP.PIPELINES.VALIDATE_PIPELINE_SUCCESS: {
			return {
				...state,
				validating: false,
				validationResponse: action.payload,
			};
		}
		case AppConstants.APP.PIPELINES.VALIDATE_PIPELINE_ERROR: {
			return {
				...state,
				validating: false,
				validationError: action.error,
			};
		}

		case AppConstants.APP.PIPELINES.UPDATE_PIPELINE_VERSION_LIVE_STATUS: {
			const updatedResults = state.results.map((item) => {
				const newItem = { ...item };

				if (newItem.id === action.payload.id && newItem?.versions) {
					const newVersions = newItem.versions.map((versionItem) => {
						return {
							...versionItem,
							updatingLiveStatus: versionItem._version === action.payload.versionId,
						};
					});

					return {
						...newItem,
						versions: newVersions,
					};
				}
				return newItem;
			});
			return {
				...state,
				results: updatedResults,
			};
		}
		case AppConstants.APP.PIPELINES.UPDATE_PIPELINE_VERSION_LIVE_STATUS_SUCCESS: {
			const updatedResults = state.results.map((item) => {
				const newItem = { ...item };

				if (newItem.id === action.payload.id && newItem?.versions) {
					const newVersions = newItem.versions.map((versionItem) => {
						return {
							...versionItem,
							is_live: versionItem._version === action.payload.versionId,
						};
					});

					return {
						...newItem,
						versions: newVersions,
					};
				}
				return newItem;
			});
			return {
				...state,
				results: updatedResults,
			};
		}
		case AppConstants.APP.PIPELINES.UPDATE_PIPELINE_VERSION_LIVE_STATUS_ERROR: {
			const updatedResults = state.results.map((item) => {
				const newItem = { ...item };

				if (newItem.id === action.payload.id && newItem?.versions) {
					const newVersions = newItem.versions.map((versionItem) => {
						return {
							...versionItem,
							updatingLiveStatus: false,
						};
					});

					return {
						...newItem,
						versions: newVersions,
					};
				}
				return newItem;
			});
			return {
				...state,
				results: updatedResults,
			};
		}
		default:
			return state;
	}
}

export default getAppPipelines;
