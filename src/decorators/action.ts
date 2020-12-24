
import Reducer from '../reducer';
import { METADATA_KEY_METHOD_PARAMS, METADATA_KEY_ACTION } from '../constants';
import { ActionType } from '../action';

export function ActionHandler(actionType?: ActionType) {
    return function (target: Reducer<any>, propertyKey: string): void {
        let resultType = actionType;
        if (!resultType) {
            const methodParamTypes: any[] = Reflect.getMetadata(METADATA_KEY_METHOD_PARAMS, target, propertyKey);
            resultType = methodParamTypes[1].name;
        }
        Reflect.defineMetadata(METADATA_KEY_ACTION, resultType, target, propertyKey)
    }
}