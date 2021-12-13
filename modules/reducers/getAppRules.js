import AppConstants from '../constants';

const initialAppState = {};

function getAppRules(state = initialAppState, action) {
	switch (action.type) {
		case AppConstants.APP.RULES.GET:
			return {
				isFetching: true,
				success: false,
				error: false,
			};
		case AppConstants.APP.RULES.GET_SUCCESS:
			return {
				isFetching: false,
				success: true,
				error: false,
				results: action.payload,
			};
		case AppConstants.APP.RULES.GET_ERROR:
			return {
				isFetching: false,
				success: false,
				error: action.payload,
			};

		case AppConstants.APP.RULES.REORDER: {
			const { toBePromoted, toBeDemoted } = action.payload;
			const reorderedRules = state.results.map((rule) => {
				if (rule.id === toBePromoted.id) {
					return {
						...rule,
						order: toBePromoted.order,
					};
				}
				if (rule.id === toBeDemoted.id) {
					return {
						...rule,
						order: toBeDemoted.order,
					};
				}
				return rule;
			});
			return {
				results: reorderedRules,
				reordering: true,
			};
		}
		case AppConstants.APP.RULES.REORDER_SUCCESS: {
			return {
				...state,
				reordering: false,
			};
		}
		case AppConstants.APP.RULES.REORDER_ERROR: {
			const { toBePromoted, toBeDemoted } = action.payload;
			const revertedRules = state.results.map((rule) => {
				if (rule.id === toBePromoted.id) {
					return {
						...rule,
						order: toBeDemoted.order,
					};
				}
				if (rule.id === toBeDemoted.id) {
					return {
						...rule,
						order: toBePromoted.order,
					};
				}
				return rule;
			});
			return {
				...state,
				results: revertedRules,
				reordering: false,
				error: action.error,
			};
		}

		case AppConstants.APP.RULES.DELETE: {
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
		case AppConstants.APP.RULES.DELETE_SUCCESS: {
			const filteredResults = state.results.filter((item) => item.id !== action.payload.id);
			return {
				...state,
				results: filteredResults,
				deleted: action.payload.id,
			};
		}
		case AppConstants.APP.RULES.DELETE_ERROR: {
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

		case AppConstants.APP.RULES.TOGGLE_STATUS: {
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
		case AppConstants.APP.RULES.TOGGLE_STATUS_SUCCESS: {
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
		case AppConstants.APP.RULES.TOGGLE_STATUS_ERROR: {
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

		case AppConstants.APP.RULES.UPDATE_RULE: {
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
		case AppConstants.APP.RULES.UPDATE_RULE_SUCCESS: {
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
		case AppConstants.APP.RULES.UPDATE_RULE_ERROR: {
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

		case AppConstants.APP.RULES.CREATE: {
			return {
				...state,
				create: {
					isLoading: true,
					error: null,
				},
			};
		}

		case AppConstants.APP.RULES.CREATE_SUCCESS: {
			return {
				...state,
				results: [...state.results, { ...action.payload }],
				create: {
					isLoading: false,
					error: null,
				},
			};
		}

		case AppConstants.APP.RULES.CREATE_ERROR: {
			return {
				...state,
				isCreating: false,

				create: {
					isLoading: false,
					error: action.error,
				},
			};
		}
		case AppConstants.APP.RULES.CLONE: {
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
		case AppConstants.APP.RULES.CLONE_SUCCESS: {
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
		case AppConstants.APP.RULES.CLONE_ERROR: {
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

export default getAppRules;
