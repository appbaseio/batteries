import AppConstants from '../constants';

const initialAppState = {};

function getAppSearchBoxes(state = initialAppState, action) {
	switch (action.type) {
		case AppConstants.APP.UI_BUILDERN.SEARCH_BOXES.GET:
			return {
				isFetching: true,
				success: false,
				error: false,
				results: state.results ?? [],
			};
		case AppConstants.APP.UI_BUILDERN.SEARCH_BOXES.GET_SUCCESS:
			return {
				isFetching: false,
				success: true,
				error: false,
				results: action.payload,
			};
		case AppConstants.APP.UI_BUILDERN.SEARCH_BOXES.GET_ERROR:
			return {
				isFetching: false,
				success: false,
				error: action.payload,
			};

		case AppConstants.APP.UI_BUILDERN.SEARCH_BOX.CREATE: {
			return {
				...state,
				create: {
					isLoading: true,
					error: null,
				},
			};
		}
		case AppConstants.APP.UI_BUILDERN.SEARCH_BOX.CREATE_SUCCESS: {
			return {
				...state,
				results: [...state.results, { ...action.payload }],
				create: {
					isLoading: false,
					error: null,
				},
			};
		}
		case AppConstants.APP.UI_BUILDERN.SEARCH_BOX.CREATE_ERROR: {
			return {
				...state,
				create: {
					isLoading: false,
					error: action.error,
				},
			};
		}

		case AppConstants.APP.UI_BUILDERN.SEARCH_BOX.UPDATE: {
			const updatedResults = state.results.map((item) => {
				return item.id === action.payload.id
					? {
							...item,
							update: {
								isLoading: true,
								error: null,
							},
					  }
					: item;
			});
			return {
				...state,
				results: updatedResults,
				...(state.results.find((item) => item.id === action.payload.id)
					? {}
					: {
							create: {
								isLoading: true,
								error: null,
							},
					  }),
			};
		}
		case AppConstants.APP.UI_BUILDERN.SEARCH_BOX.UPDATE_SUCCESS: {
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
				...(state.results.find((item) => item.id === action.payload.id)
					? {}
					: {
							create: {
								isLoading: false,
								error: null,
							},
					  }),
			};
		}
		case AppConstants.APP.UI_BUILDERN.SEARCH_BOX.UPDATE_ERROR: {
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
				...(state.results.find((item) => item.id === action.payload.id)
					? {}
					: {
							create: {
								isLoading: false,
								error: action.error,
							},
					  }),
			};
		}

		case AppConstants.APP.UI_BUILDERN.SEARCH_BOX.DELETE: {
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
		case AppConstants.APP.UI_BUILDERN.SEARCH_BOX.DELETE_SUCCESS: {
			const filteredResults = state.results.filter((item) => item.id !== action.payload.id);
			return {
				...state,
				results: filteredResults,
				deleted: action.payload.id,
			};
		}
		case AppConstants.APP.UI_BUILDERN.SEARCH_BOX.DELETE_ERROR: {
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
		case AppConstants.APP.UI_BUILDERN.SEARCH_BOX.CLONE: {
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
		case AppConstants.APP.UI_BUILDERN.SEARCH_BOX.CLONE_SUCCESS: {
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
		case AppConstants.APP.UI_BUILDERN.SEARCH_BOX.CLONE_ERROR: {
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

		default:
			return state;
	}
}

export default getAppSearchBoxes;
