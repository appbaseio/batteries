# batteries

Public pluggable modules for use within appbase.io dashboard, dejavu, and reactive apps.

## Setup

1. Setup the submodule:

```bash
git submodule init
git submodule sync
git submodule update --recursive --remote
```

2. Installation:

```bash
yarn add emotion react-emotion antd @appbaseio/reactivesearch react-expand-collapse codesandbox react-element-to-jsx-string appbase-js react-ace brace recharts moment lodash reselect
yarn add -D babel-plugin-emotion babel-plugin-import
```

Add `babel-plugin-import`:

```js
// .babelrc or babel-loader option
{
	"plugins": [
		[
			"import",
			{ "libraryName": "antd", "libraryDirectory": "es", "style": "css" }
		]
	]
}
```

> You will need to setup css-loader in your webpack config for react-select

3. Setup redux

```js
import {
 createStore, combineReducers,
} from 'redux';

// import your root reducer (optional)
import rootReducer from '../reducers';

// import batteries reducers
import batteriesReducers from 'batteries/modules/reducers';

// use it for creating the store:
createStore(combineReducers({ ...rootReducer, ...batteriesReducers })),
```

4. Import:

-   Desired actions from `batteries/modules/actions`
-   Selectors from `batteries/modules/selectors`

and connect your component to the redux store powered by batteries.
