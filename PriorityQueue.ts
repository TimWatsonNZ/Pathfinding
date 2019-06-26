import { Measurable } from "./Measurable";


export class PriorityQueue<T extends Measurable> {
  heap: Array<T>;

  constructor() {
    this.heap = new Array<T>();
  }

  insert(node: T) {
    this.heap.push(node);
    let currentNodeIdx = this.heap.length - 1;
    let currentNodeParentIdx = Math.floor(currentNodeIdx / 2);
    while (
      this.heap[currentNodeParentIdx] &&
      node.getMeasure() < this.heap[currentNodeParentIdx].getMeasure()
    ) {
      const parent = this.heap[currentNodeParentIdx];
      this.heap[currentNodeParentIdx] = node;
      this.heap[currentNodeIdx] = parent;
      currentNodeIdx = currentNodeParentIdx;
      currentNodeParentIdx = Math.floor(currentNodeIdx / 2);
    }
  }

  pop(): T {
    if (this.heap.length < 3) {
      const toReturn = this.heap.pop();
      this.heap[0] = null;
      return toReturn;
    }
    const toRemove = this.heap[1];
    this.heap[1] = this.heap.pop();
    let currentIdx = 1;
    let [left, right] = [2*currentIdx, 2*currentIdx + 1];
    let currentChildIdx = this.heap[right] && this.heap[right].getMeasure() >= this.heap[left].getMeasure() ? right : left;
    while (this.heap[currentChildIdx] && this.heap[currentIdx].getMeasure() > this.heap[currentChildIdx].getMeasure()) {
      let currentNode = this.heap[currentIdx]
      let currentChildNode = this.heap[currentChildIdx];
      this.heap[currentChildIdx] = currentNode;
      this.heap[currentIdx] = currentChildNode;
    }
    return toRemove;
  }

  count() {
    return this.heap.length;
  }
}