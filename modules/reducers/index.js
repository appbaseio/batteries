import getUserStatus from './getUserStatus';
import getAppInfo from './getAppInfo';
import getAppMappings from './getAppMappings';
import getAppCredentials from './getAppCredentials';
import permission from './permission';

export default {
	$getUserStatus: getUserStatus,
	$getAppInfo: getAppInfo,
	$permission: permission,
	$getAppMappings: getAppMappings,
	$getAppCredentials: getAppCredentials,
};
