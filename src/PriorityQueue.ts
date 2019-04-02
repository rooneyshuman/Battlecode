interface HeapItem {
  coord: number[],
  priority: number,
}

export class PriorityQueue {
  // Taken from stackoverflow
  private comparator: (a: HeapItem, b: HeapItem) => boolean;
  private heap: HeapItem[];
  private readonly top: number = 0;

  constructor(comparator = (a: HeapItem, b: HeapItem) => a.priority > b.priority) {
    this.heap = [];
    // TODO: use the heuristic function for comparison(?)
    this.comparator = comparator;
  }

  public size(): number {
    return this.heap.length;
  }

  public insert(...values: HeapItem[]): void {
    values.forEach((value) => {
      this.heap.push(value);
      this.sortUp();
    });
  }

  public empty() {
    this.heap = [];
  }

  public peek(): HeapItem {
    return this.heap[this.top];
  }

  public pop(): HeapItem {
    const poppedValue = this.peek();
    const bottom = this.size() - 1;
    if(bottom > this.top) {
      this.swap(this.top, bottom);
    }
    this.heap.pop(); // Literally remove the item from the array.
    this.sortDown();
    return poppedValue;
  }

  public replace(val: HeapItem): HeapItem {
      const replacedValue = this.peek();
      this.heap[this.top] = val;
      this.sortDown();
      return replacedValue;
  }

  private greater(i: number, j: number): boolean {
    return this.comparator(this.heap[i], this.heap[j]);
  }

  private lesser(i: number, j:number): boolean {
    return !this.comparator(this.heap[i], this.heap[j]);
  }

  private sortUp(): void {
    let node = this.size() - 1;
    while(node > this.top && this.lesser(node, this.parent(node))) {
      const parent = this.parent(node);
      this.swap(node, parent);
      node = parent;
    }
  }

  private sortDown(): void {
    let node = this.top;
    while(
      (this.left(node) < this.size() && this.lesser(this.left(node), node)) ||
      (this.right(node) < this.size() && this.lesser(this.right(node), node))
    ) {
      const minChild = (this.right(node) < this.size() && this.lesser(this.right(node), this.left(node))) ? this.right(node) : this.left(node);
      this.swap(node, minChild);
      node = minChild;
    }
  }

  private swap(i: number, j: number): void {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  private parent: (i: number) => number = (i: number) => ((i + 1) >>> 1) - 1;
  private left: (i: number) => number = (i: number) => (i << 1) + 1;
  private right: (i: number) => number = (i: number) => (i + 1) << 1;

}