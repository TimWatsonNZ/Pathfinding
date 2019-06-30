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


  isSorted(): boolean {
    const arr = this.heap;
    const first = arr[0];
    return arr.reduce((sorted, curr) => sorted && curr.getMeasure() > first.getMeasure(), true);
  }

  pop(): T {
    if (this.heap.length < 3) {
      const toReturn = this.heap.shift();
      return toReturn;
    }
    const toRemove = this.heap.shift();
    
    let currentIdx = 0;
    let [left, right] = [2*currentIdx + 1, 2*currentIdx + 2];
    let smallestChild = this.heap[right] && this.heap[right].getMeasure() <= this.heap[left].getMeasure() ? right : left;
    
    while (this.heap[currentIdx] && this.heap[smallestChild] && this.heap[smallestChild].getMeasure() < this.heap[currentIdx].getMeasure()) {
      // let currentChildNode = this.heap[smallestChild];
      // this.heap[smallestChild] = currentNode;
      // this.heap[currentIdx] = currentChildNode;
      
      let currentNode = this.heap[currentIdx]
      this.heap[currentIdx] = this.heap[smallestChild];
      this.heap[smallestChild] = currentNode;
      currentIdx = smallestChild;
    }
    return toRemove;
  }

  count() {
    return this.heap.length;
  }
}