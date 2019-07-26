
import State from '../state';
import { Middleware } from '../middleware';
import { METADATA_KEY_METHOD_PARAMS, METADATA_KEY_ACTION, METADATA_KEY_MIDDLEWARE_TYPE } from '../constants';

function _middlewarehandler<S extends State>(target: Middleware<S>, propertyKey: string, type: string) {
    const methodParamTypes: any[] = Reflect.getMetadata(METADATA_KEY_METHOD_PARAMS, target, propertyKey);
    const actionType: string = methodParamTypes[1].name;
    Reflect.defineMetadata(METADATA_KEY_ACTION, actionType, target, propertyKey);
    Reflect.defineMetadata(METADATA_KEY_MIDDLEWARE_TYPE, type, target, propertyKey);
}

export function PreMiddlewareHandler<S extends State>(target: Middleware<S>, propertyKey: string, descriptor: PropertyDescriptor) {
    _middlewarehandler(target, propertyKey, 'pre');
}

export function PostMiddlewareHandler<S extends State>(target: Middleware<S>, propertyKey: string, descriptor: PropertyDescriptor) {
    _middlewarehandler(target, propertyKey, 'post');
}