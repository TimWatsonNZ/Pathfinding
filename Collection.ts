import { Identifiable } from "./Identifiable";
import { PriorityQueue } from "./PriorityQueue";
import { Measurable } from "./Measurable";

export class Collection<T extends Measurable & Identifiable> {
  hashSet: any; //  will change to prio queue
  queue: PriorityQueue<T>;

  constructor() {
    this.hashSet = {};
    this.queue = new PriorityQueue();
  }

  insert(value: T) {
    this.queue.insert(value);
    this.hashSet[value.getKey()] = value;
  }

  test(value: T) {
    return !!this.find(value);
  }

  find(value: T) {
    return this.hashSet[value.getKey()];
  }

  pop(): T {
    const node = this.queue.pop();
    if (node) delete this.hashSet[node.getKey()];
    return node;
  }

  count() {
    return this.queue.count();
  }

  toArray() {
    return this.queue.heap;
  }
}
