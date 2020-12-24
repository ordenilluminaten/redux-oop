
import { Middleware } from '../middleware';
import { METADATA_KEY_METHOD_PARAMS, METADATA_KEY_ACTION, METADATA_KEY_MIDDLEWARE_TYPE } from '../constants';
import { ActionType } from '../action';

declare type MiddlewareType = 'pre' | 'post';

function _middlewarehandler(target: Middleware<any>, propertyKey: string, type: MiddlewareType, actionType?: ActionType) {
    let resultType = actionType;
    if (!resultType) {
        const methodParamTypes: any[] = Reflect.getMetadata(METADATA_KEY_METHOD_PARAMS, target, propertyKey);
        resultType = methodParamTypes[1].name;
    }
    Reflect.defineMetadata(METADATA_KEY_ACTION, resultType, target, propertyKey);
    Reflect.defineMetadata(METADATA_KEY_MIDDLEWARE_TYPE, type, target, propertyKey);
}

export function PreMiddlewareHandler(actionType?: ActionType) {
    return function (target: Middleware<any>, propertyKey: string) {
        _middlewarehandler(target, propertyKey, 'pre', actionType);
    }
}

export function PostMiddlewareHandler(actionType?: ActionType) {
    return function (target: Middleware<any>, propertyKey: string) {
        _middlewarehandler(target, propertyKey, 'post', actionType);
    }
}