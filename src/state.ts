export default class State {
    public rebuild<T extends State>(action: (state: T) => void): T {
        let clone = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
        action(clone);
        return clone;
    }
}