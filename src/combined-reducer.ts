import {
    Reducer as ReduxReducer, combineReducers, ReducersMapObject
} from 'redux';
import Reducer from './reducer';

export default class CombinedReducer {
    private reducers: Reducer<any>[];
    public name: string;
    constructor(name: string, ...reducers: Reducer<any>[]) {
        this.name = name;
        this.reducers = reducers;
    }

    create(): ReduxReducer {
        const map: ReducersMapObject<any, any> = {};
        for (const reducer of this.reducers) {
            if (reducer.name == null) {
                console.error(`Reducer doesn't have state name`, reducer);
                continue;
            }
            map[reducer.name] = reducer.create();
        }
        return combineReducers(map);
    }
}
