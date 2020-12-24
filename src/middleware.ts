import 'reflect-metadata';
import State from './state';
import Store from './store';
import Action, { ActionType } from './action';
import { Middleware as ReduxMiddleware, MiddlewareAPI, Dispatch } from 'redux';
import { METADATA_KEY_ACTION, METADATA_KEY_MIDDLEWARE_TYPE } from './constants';

export class Middleware<S extends State> {
    preActionsMap: Map<ActionType, Array<(Store: Store<S>, action: Action) => Store<S>>> = new Map();
    postActionsMap: Map<ActionType, Array<(Store: Store<S>, action: Action, prevState: S) => Store<S>>> = new Map();

    private executePre(store: Store<S>, action: Action, actionType?: ActionType) {
        const preFuncs = this.preActionsMap.get(actionType || action.type);
        if (preFuncs != null) {
            for (const preFunc of preFuncs) {
                preFunc.bind(this)(store, action);
            }
        }
    }

    private executePost(store: Store<S>, action: Action, prevState: S, actionType?: ActionType) {
        const postFuncs = this.postActionsMap.get(actionType || action.type);
        if (postFuncs != null) {
            for (const postFunc of postFuncs) {
                postFunc.bind(this)(store, action, prevState);
            }
        }
    }

    protected call(store: Store<S>): any {
        return ((reduxStore: MiddlewareAPI) => {
            return (next: Dispatch) => {
                return (action: Action) => {
                    this.executePre(store, action);
                    // for all listeners with 'any' type of action
                    this.executePre(store, action, Object.name);

                    const prevState = store.state;
                    next(action);

                    this.executePost(store, action, prevState);
                    // for all listeners with 'any' type of action
                    this.executePost(store, action, prevState, Object.name);
                };
            };
        }) as ReduxMiddleware;
    }

    create(store: Store<S>): ReduxMiddleware {
        // idk why all methods are in prototype class
        let proto = Object.getPrototypeOf(this);
        while (proto.constructor.name != Middleware.name) {
            const methodNames: string[] = Object.getOwnPropertyNames(proto).filter(x => x != 'constructor' && !x.startsWith('_'));
            for (const key of methodNames) {
                const metaActionType: ActionType = Reflect.getMetadata(METADATA_KEY_ACTION, this, key);
                if (metaActionType == null)
                    continue;
                const handlerType: string = Reflect.getMetadata(METADATA_KEY_MIDDLEWARE_TYPE, this, key);
                const func: (state: Store<S>, action: any) => Store<S> = (this as any)[key];
                if (handlerType === 'pre') {
                    if (!this.preActionsMap.has(metaActionType))
                        this.preActionsMap.set(metaActionType, []);
                    this.preActionsMap.get(metaActionType)!.push(func);
                } else {
                    if (!this.postActionsMap.has(metaActionType))
                        this.postActionsMap.set(metaActionType, []);
                    this.postActionsMap.get(metaActionType)!.push(func);
                }
            }
            proto = Object.getPrototypeOf(proto);
        }
        return this.call(store).bind(this);
    }
}

export class IsolatedMiddleware<S extends State, SRoot extends State> extends Middleware<S> {
    constructor(protected getState: (state: SRoot) => S) {
        super();
    }
}