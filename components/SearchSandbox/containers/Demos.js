import React from 'react';

import { SandboxContext } from '../../SearchSandbox';

export default () => (
	<SandboxContext.Consumer>
		{props => props.profile}
	</SandboxContext.Consumer>
);
