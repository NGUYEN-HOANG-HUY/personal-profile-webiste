/**
 * Union-Find (Disjoint Set Union) Data Structure
 * Used to efficiently merge electrical nodes connected by wires
 * 
 * This is critical for breadboard simulation because:
 * - Wires create zero-resistance connections
 * - Multiple holes can be part of the same electrical node
 * - We need O(log n) find and union operations for performance
 */

export class UnionFind {
  constructor(size) {
    // parent[i] = parent of node i (initially itself)
    this.parent = Array.from({ length: size }, (_, i) => i);
    // rank[i] = depth of tree rooted at i (for union by rank optimization)
    this.rank = Array(size).fill(0);
  }

  /**
   * Find the root representative of the set containing x
   * Uses path compression for O(α(n)) amortized time complexity
   * @param {number} x - Node to find root of
   * @returns {number} Root node ID
   */
  find(x) {
    if (this.parent[x] !== x) {
      // Path compression: make every node point directly to root
      this.parent[x] = this.find(this.parent[x]);
    }
    return this.parent[x];
  }

  /**
   * Merge the sets containing x and y
   * Uses union by rank to keep tree balanced
   * @param {number} x - First node
   * @param {number} y - Second node
   */
  union(x, y) {
    const rootX = this.find(x);
    const rootY = this.find(y);

    if (rootX === rootY) return; // Already in same set

    // Union by rank: attach smaller tree under larger tree
    if (this.rank[rootX] < this.rank[rootY]) {
      this.parent[rootX] = rootY;
    } else if (this.rank[rootX] > this.rank[rootY]) {
      this.parent[rootY] = rootX;
    } else {
      this.parent[rootY] = rootX;
      this.rank[rootX]++;
    }
  }

  /**
   * Check if two nodes are in the same set
   * @param {number} x - First node
   * @param {number} y - Second node
   * @returns {boolean} True if connected
   */
  connected(x, y) {
    return this.find(x) === this.find(y);
  }
}
