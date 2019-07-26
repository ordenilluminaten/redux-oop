import {
    Reducer as ReduxReducer, combineReducers, ReducersMapObject
} from 'redux';
import Reducer from './reducer';
import CombinedReducer from './combined-reducer';

export default class RootReducer {
    public p_reducers: (Reducer<any> | CombinedReducer)[];
    constructor(...reducers: (Reducer<any> | CombinedReducer)[]) {
        this.p_reducers = reducers;
    }

    create(): ReduxReducer {
        const map: ReducersMapObject<any, any> = {};
        for (const reducer of this.p_reducers) {
            if (reducer.name == null) {
                console.error(`Reducer doesn't have state name`, reducer);
                continue;
            }
            map[reducer.name] = reducer.create();
        }
        return combineReducers(map);
    }
}
