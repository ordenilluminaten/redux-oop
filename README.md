# redux-typed-kit

Powerful extensitions for building class-based Redux architecture powered by TypeScript.

Example of using [redux-typed-kit-example](https://github.com/ordenilluminaten/redux-typed-kit-example)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Installation](#installation)
- [Quick start](#quick-start)
  - [States](#states)
    - [RebuildState](#rebuildState)
  - [Actions](#actions)
  - [Reducers](#reducers)
    - [CombinedReducer](#combinedReducer)
    - [RootReducer](#rootReducer)
  - [Middlewares](#middlewares)
    - [PreHandlers](#pre-handlers)
    - [PostHandlers](#post-handlers)
  - [Store](#store)
- [Integration with third-party libs](#integration-with-3rd-party-libs)
- [Middlewares inheritance](#middlewares-inheritance)
- [Example](#example)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

1. Run
   ```
   npm i redux-typed-kit
   ```
1. Configure your Babel to support class properties and decorators inside `.babelrc`
   ```json
   "plugins": [
        ["@babel/plugin-proposal-decorators", { "legacy": true }],
        ["@babel/plugin-proposal-class-properties", { "loose": true }]
   ]
   ```
1. If you use TypeScript you should configure it inside `tsconfig.json`

   ```json
   "experimentalDecorators": true,
   "emitDecoratorMetadata": true,
   ```

1. If you use React you also should install reflect-metadata
   ```
   npm i reflect-metadata
   ```
   and then import it at the top of the entry file
   ```ts
   import 'reflect-metadata';
   ```

## Quick start

> Let's create a simple Redux-architecture to fetch users from server and display them. We'll also take care about possible network (and others) errors.

### States

> Let's describe users state

```ts
import { State } from 'redux-typed-kit';

export default class UsersState extends State {
  public users: Array<User> = [];
  public filter: UsersFilter = new UsersFilter();
  public isLoading: boolean = false;
  public error: ApiError;
}
```

> AppState should include all other states

```ts
import { State } from 'redux-typed-kit';

export default class AppState extends State {
  public usersState: UsersState;
}
```

#### RebuildState

The `State` class has the `Rebuild` method, which is needed to create an instance of the `State` class, based on the parent instance, but with some changes. It's very helpful to use in any reducers, especially when you need to save the type of your state class.

```ts
state.rebuild(x => {
  x.isLoading = true;
});
```

### Actions

> Let's create three actions for fetching users. Action to start fetching, action in case of success and in case of error.

```ts
import { Action } from 'redux-typed-kit';

export class FetchUsersAction extends Action {
  constructor(public filter: FetchUsersFilter) {
    super();
  }
}

export class FetchUsersSuccessAction extends Action {
  constructor(public response: FetchUsersResponse) {
    super();
  }
}

export class FetchUsersFailureAction extends Action {
  constructor(public error: ApiError) {
    super();
  }
}
```

### Reducers

> Let's create users reducer. Every reducer must have two basic things: initial state and name. This name will be used to configure the global app state.

```ts
import { Reducer, ActionDecorator as Action } from 'redux-typed-kit';
import UsersState from '../models/states/users-state';
import {
  FetchUsersAction,
  FetchUsersSuccessAction,
  FetchUsersFailureAction
} from '../actions/fetch-users-action';

export default class UsersReducer extends Reducer<UsersState> {
  initialState = new UsersState();
  name = 'usersState';

  @Action
  fetchUsers(state: UsersState, action: FetchUsersAction): UsersState {
    return state.rebuild(x => {
      x.isLoading = !action.isBackgroud;
    });
  }

  @Action
  fetchUsersSuccess(
    state: UsersState,
    action: FetchUsersSuccessAction
  ): UsersState {
    return state.rebuild(x => {
      x.users = action.response.users;
      x.isLoading = false;
    });
  }

  @Action
  fetchUsersFailure(
    state: UsersState,
    action: FetchUsersFailureAction
  ): UsersState {
    return state.rebuild(x => {
      x.error = action.error;
      x.isLoading = false;
    });
  }
}
```

#### CombinedReducer

> `CombinedReducer` combines several reducers into one complex reducer and state object just like `combineReducers` function does.

```ts
import { CombinedReducer } from 'redux-typed-kit';
export default new CombinedReducer(
  'complexState',
  new SimpleReducer(),
  new AnotherSimpleReducer()
);
```

#### RootReducer

> `RootReducer` combines others reducers (including `CombinedReducer`) and used by store.

```ts
import { RootReducer } from 'redux-typed-kit';
import UsersReducer from './users-reducer';

const rootReducer = new RootReducer(
  new UsersReducer() /*, new CombinedReducer(...), new AnotherReducer()*/
);
export default rootReducer;
```

# Documentation coming soon...
