import {
    Store as ReduxStore, StoreEnhancer,
    createStore, applyMiddleware, Dispatch, AnyAction, Unsubscribe
} from 'redux';
import State from './state';
import Action from './action';
import { Middleware } from './middleware';
import RootReducer from './root-reducer';

export default class Store<S extends State> {
    private p_store: ReduxStore<S>;
    private p_reducer: RootReducer;
    private p_middlewares: (Middleware<S> | any)[];
    constructor(reducer: RootReducer, ...middlewares: (Middleware<S> | any)[]) {
        this.p_reducer = reducer;
        this.p_middlewares = middlewares;
    }

    private getEnhancer(): StoreEnhancer {
        return applyMiddleware(...this.p_middlewares.map(x => x instanceof Middleware ? (x as Middleware<S>).create(this) : x));
    }

    public init(): Store<S> {
        this.p_store = createStore(this.p_reducer.create(), this.getEnhancer());
        return this;
    }

    public addMiddleware(middleware: Middleware<S> | any): void {
        if (this.p_store != null)
            return;
        this.p_middlewares.push(middleware);
    }

    public getMiddleware<M extends Middleware<S>>(type: string): M {
        return this.p_middlewares.find(x => x instanceof Middleware && x.constructor.name == type);
    }

    public subscribe(listener: () => void): Unsubscribe {
        return this.p_store.subscribe(listener);
    }

    public get state(): S {
        return this.p_store.getState();
    }

    public dispatch<A extends Action>(action: A): Dispatch<AnyAction> {
        return this.p_store.dispatch(action.toPlainObject());
    }
}