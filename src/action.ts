export declare type ActionType = string | number;
export default class Action {
    public type: ActionType = this.constructor.name;

    toPlainObject() {
        const obj: any = {};
        for (var x in this) {
            if (x === "toJSON" || x === "constructor") {
                continue;
            }
            obj[x] = this[x];
        }
        return obj;
    }
}