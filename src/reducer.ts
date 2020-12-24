import 'reflect-metadata';
import State from './state';
import { Reducer as ReduxReducer } from 'redux';
import Action, { ActionType } from './action';
import { METADATA_KEY_ACTION } from './constants';

export default class Reducer<T extends State> {
    initialState: T;
    mapping: Map<ActionType, Array<(state: T, action: any) => T>> = new Map();
    name: string | null;

    private executeReducer(state: T, action: Action, actionType?: ActionType): T {
        const funcs = this.mapping.get(actionType || action.type);
        let resState = state;
        if (funcs != null) {
            for (const func of funcs) {
                resState = func.bind(this)(resState, action);
            }
        }
        return resState;
    }

    protected call(state: T = this.initialState, action: Action): T {
        const resState = this.executeReducer(state, action);
        // for 'any' action type
        return this.executeReducer(resState, action, Object.name);
    }

    create(): ReduxReducer<T, any> {
        // idk why all methods are in prototype class
        const proto = Object.getPrototypeOf(this);
        const methodNames: string[] = Object.getOwnPropertyNames(proto).filter(x => x != 'constructor' && !x.startsWith('_'));
        for (const key of methodNames) {
            const metaActionType: string = Reflect.getMetadata(METADATA_KEY_ACTION, this, key);
            if (metaActionType == null)
                continue;
            const func: (state: T, action: any) => T = (this as any)[key];
            if (!this.mapping.has(metaActionType))
                this.mapping.set(metaActionType, []);
            this.mapping.get(metaActionType)!.push(func);
        }
        return this.call.bind(this);
    }
}