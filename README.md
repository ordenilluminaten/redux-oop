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
    - [PreMiddlewareHandler](#preMiddlewareHandler)
    - [PostMiddlewareHandler](#postMiddlewareHandler)
    - [Middlewares inheritance](#middlewaresInheritance)
  - [Store](#store)
- [Example](#example)
- [Integration with third-party libs](#integrationWithThirdPartyLibs)

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

Let's create a simple Redux-architecture to fetch users from server and display them. We'll also take care about possible network (and others) errors.

### States

Let's describe users state

```ts
import { State } from 'redux-typed-kit';

export default class UsersState extends State {
  public users: Array<User> = [];
  public filter: UsersFilter = new UsersFilter();
  public isLoading: boolean = false;
  public error: ApiError;
}
```

AppState should include all other states

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

Let's create three actions for fetching users. Action to start fetching, action in case of success and in case of error.

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

Let's create users reducer. Every reducer must have two basic things: initial state and name. This name will be used to configure the global app state.

```ts
import { Reducer, ActionDecorator as Action } from 'redux-typed-kit';
import UsersState from '../models/states/users-state';
import { FetchUsersAction, FetchUsersSuccessAction, FetchUsersFailureAction } from '../actions/fetch-users-action';

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
  fetchUsersSuccess(state: UsersState, action: FetchUsersSuccessAction): UsersState {
    return state.rebuild(x => {
      x.users = action.response.users;
      x.isLoading = false;
    });
  }

  @Action
  fetchUsersFailure(state: UsersState, action: FetchUsersFailureAction): UsersState {
    return state.rebuild(x => {
      x.error = action.error;
      x.isLoading = false;
    });
  }
}
```

#### CombinedReducer

`CombinedReducer` combines several reducers into one complex reducer and state object just like `combineReducers` function does.

```ts
import { CombinedReducer } from 'redux-typed-kit';
export default new CombinedReducer('complexState', new SimpleReducer(), new AnotherSimpleReducer());
```

#### RootReducer

`RootReducer` combines others reducers (including `CombinedReducer`) and used by store.

```ts
import { RootReducer } from 'redux-typed-kit';
import UsersReducer from './users-reducer';

const rootReducer = new RootReducer(
  new UsersReducer() /*, new CombinedReducer(...), new AnotherReducer()*/
);
export default rootReducer;
```

## Middlewares

We will use middleware to make a request to the server, process the response, and send data to the reducers.

```ts
import { PostMiddlewareHandler, Middleware, Store } from 'redux-typed-kit';
import AppState from '../models/states/app-state';
import { FetchUsersAction, FetchUsersSuccessAction, FetchUsersFailureAction, FetchUsersCancelAction } from '../actions/fetch-users-action';

export default class UsersMiddleware extends Middleware<AppState> {
    @PostMiddlewareHandler
    async fetchUsers(store: Store<AppState>, action: FetchUsersAction) {
        const result = await api.fetchUsers(action.filter);
        if (result.error == null) {
            store.dispatch(new FetchUsersSuccessAction(result.response));
        } else {
            store.dispatch(new FetchUsersFailureAction(result.error));
        }
    }
}
```
### PreMiddlewareHandler

`PreMiddlewareHandler` decorator is used when we need to catch any dispached actions before they get to the reducers. So we can get state from `Store` before any changes are applied inside the reducers. 

### PostMiddlewareHandler

`PostMiddlewareHandler` decorator works exactly the opposite. All reducers already handled the action and changed the state.

Probably the best example I can give you is middlware for logging all actions and state's changes.

```ts
import { PostMiddlewareHandler, PreMiddlewareHandler, Middleware, Store } from 'redux-typed-kit';

export default class LoggerMiddleware extends Middleware<AppState> {
    @PreMiddlewareHandler
    preLog(store: Store<AppState>, action: any) {
        console.log('PRE', action, JSON.parse(JSON.stringify(store.getState())));
    }

    @PostMiddlewareHandler
    postLog(store: Store<AppState>, action: any) {
        console.log('POST', action, JSON.parse(JSON.stringify(store.getState())));
    }
}
```

## Store

`Store` is a combination of `RootReducer` and `Middlewares` that create a final state object.

```ts
import { Store } from 'vue-redux-ts';
import AppState from '../models/states/app-state';
import rootReducer from '../reducers/root-reducer';
import UsersMiddleware from '../middlewares/users-middleware';

const store = new Store<AppState>(rootReducer, new UsersMiddleware());
export default store.init();
```

# Documentation coming soon...