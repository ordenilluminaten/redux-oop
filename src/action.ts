export default class Action {
    public type: string = this.constructor.name;

    getJSON() {
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