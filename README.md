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

5. Usage:
### BaseContainer
Use this component to provide the basic data to `batteries` components.
By default it executes the following tasks.
- Sets the app name & app id in redux store.
- Fetches the basic app information
- Fetches the app plan
## Props
| Prop  | Required  | Type | Default Value | Description |
| :------------ |:---------------:| :---------------:|:---------------:| :-----|
| appName | `yes` | `string` | - | Name of the app.|
| appId | `no` | `string` | - | App id|
| shouldFetchAppPlan | `no` | `boolean` | `true` | To define that whether the component should fetch app plan or not |
| shouldFetchAppInfo | `no` |`boolean` | `true` | To define that whether the component should fetch app information or not|
|component | `no` | `function` | Render prop function |

## Example
```js
import Analytics from 'batteries/components/Analytics'
...
<BaseContainer appName="movies-xyz">
  <Analytics/>
</BaseContainer>
```
