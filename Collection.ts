import { Identifiable } from "./Identifiable";

export class Collection<T extends Identifiable<T>> {
  hashSet: any; //  will change to prio queue
  array: Array<T>;

  constructor() {
    this.hashSet = {};
    this.array = [];
  }

  insert(value: T) {
    this.array.push(value);
    this.hashSet[value.getKey()] = value;
  }

  test(value: T) {
    return !!this.find(value);
  }

  find(value: T) {
    return this.hashSet[value.getKey()];
  }

  remove(value: T) {
    this.array = this.array.filter(x => x.getKey() !== value.getKey());
  }

  count() {
    return this.array.length;
  }
}
