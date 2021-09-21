import { createAction } from './utils';
import AppConstants from '../constants';

export function getMappings(payload) {
    return {
        type: AppConstants.APP.QUERY.GET_MAPPINGS,
        payload,
    };
}
