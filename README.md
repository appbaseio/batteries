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
yarn add emotion react-emotion antd @appbaseio/reactivesearch react-expand-collapse codesandbox react-element-to-jsx-string appbase-js react-ace brace recharts moment lodash reselect redux-thunk
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

## Usage

### BaseContainer

Use this component to provide the basic data to `batteries` components.
By default it executes the following tasks.

-   Sets the app name & app id in redux store.
-   Fetches the basic app information
-   Fetches the app plan

## Props

| Prop               | Required |    Type    | Default Value | Description                                                              |
| :----------------- | :------: | :--------: | :-----------: | :----------------------------------------------------------------------- |
| appName            |  `yes`   |  `string`  |       -       | Name of the app.                                                         |
| appId              |   `no`   |  `string`  |       -       | App id                                                                   |
| shouldFetchAppPlan |   `no`   | `boolean`  |    `true`     | To define that whether the component should fetch app plan or not        |
| shouldFetchAppInfo |   `no`   | `boolean`  |    `true`     | To define that whether the component should fetch app information or not |
| component          |   `no`   | `function` |       -       | Render prop function                                                     |

## Example

```js
import Analytics from 'batteries/components/Analytics'
...
<BaseContainer appName="movies-xyz">
  <Analytics/>
</BaseContainer>
```

### SearchSandbox

Use this component to display the `SearchPreview` component.

## Props

| Prop              | Required |   Type    | Default Value | Description                                                                                                    |
| :---------------- | :------: | :-------: | :-----------: | :------------------------------------------------------------------------------------------------------------- |
| appName           |  `yes`   | `string`  |       -       | Name of the app.                                                                                               |
| appId             |   `no`   | `string`  |       -       | App id                                                                                                         |
| isDashboard       |   `no`   | `boolean` |    `false`    | Prefrences handling and profile view                                                                           |
| useCategorySearch |   `no`   | `boolean` |    `false`    | If true renders `CategorySearch` else `DataSearch`                                                             |
| showCodeSandbox   |   `no`   | `boolean` |    `true`     | If false hides `Open in CodeSandbox` button                                                                    |
| customProps       |   `no`   | `object`  |     `{}`      | To pass props directly to Reactive Components like `ReactiveList`, `MultiList`, `CategorySearch`, `DataSearch` |
| attribution       |   `no`   | `object`  |       -       | Pass `text` and `link` key in object to be displayed at bottom right in codesandbox                            |

## Example

```js
import SearchSandbox from 'batteries/components/SearchSandbox';
import Editor from 'batteries/components/SearchSandbox/containers/Editor';
...
<SearchSandbox
	appId={appId}
	appName={appName}
	credentials={credentials}
	isDashboard
	useCategorySearch={false}
	attribution={{
		text: 'Powered by Appbase',
		link: 'appbase.io'
	}}
	showCodeSandbox
	customProps={{
		ReactiveList: {
			onData: res => (
				<div style={{ background: 'aqua' }}>{JSON.stringify(res)}</div>
			),
			style: { background: 'red' },
		},
		DataSearch: {
			renderSuggestions: res => (
				<div style={{ background: 'yellow' }}>{JSON.stringify(res)}</div>
			),
		},
	}}
>
	<Editor />
</SearchSandbox>
```
