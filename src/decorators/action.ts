
import State from '../state';
import Reducer from '../reducer';
import { METADATA_KEY_METHOD_PARAMS, METADATA_KEY_ACTION } from '../constants';

export default function Action<S extends State>(target: Reducer<S>, propertyKey: string, descriptor: PropertyDescriptor): void {
    const methodParamTypes: any[] = Reflect.getMetadata(METADATA_KEY_METHOD_PARAMS, target, propertyKey);
    const actionType: string = methodParamTypes[1].name;
    Reflect.defineMetadata(METADATA_KEY_ACTION, actionType, target, propertyKey)
}