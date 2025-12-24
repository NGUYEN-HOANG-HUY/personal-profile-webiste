/**
 * Breadboard Topology Model
 * Defines the physical structure and electrical connectivity of a breadboard
 * 
 * Standard breadboard layout:
 * - Top power rail (VCC)
 * - Top ground rail (GND)
 * - Component area: 30 rows × 10 columns (a-e, f-j)
 *   - Holes in same vertical strip (e.g., a1-e1) are electrically connected
 *   - Left side (a-e) and right side (f-j) are separated by center divider
 * - Bottom ground rail (GND)
 * - Bottom power rail (VCC)
 */

import { UnionFind } from './union-find.js';

// Breadboard dimensions
export const ROWS = 30;
export const COLS = 10; // 5 per side (a-e, f-j)
export const COLS_PER_SIDE = 5;

// Special rail positions
export const RAIL_TOP_VCC = -1;
export const RAIL_TOP_GND = -2;
export const RAIL_BOTTOM_GND = -3;
export const RAIL_BOTTOM_VCC = -4;

/**
 * Breadboard class manages node topology and connectivity
 */
export class Breadboard {
  constructor() {
    // Total nodes: ROWS * COLS + 4 rails
    this.totalNodes = ROWS * COLS + 4;
    this.uf = new UnionFind(this.totalNodes);
    
    // Initialize intrinsic breadboard connections
    this.initializeStripConnections();
  }

  /**
   * Initialize the intrinsic 5-hole strip connections
   * Each vertical strip of 5 holes is electrically connected
   */
  initializeStripConnections() {
    for (let row = 0; row < ROWS; row++) {
      // Left side: connect holes a-e (columns 0-4)
      for (let col = 1; col < COLS_PER_SIDE; col++) {
        const node1 = this.getNodeId(row, col - 1);
        const node2 = this.getNodeId(row, col);
        this.uf.union(node1, node2);
      }

      // Right side: connect holes f-j (columns 5-9)
      for (let col = COLS_PER_SIDE + 1; col < COLS; col++) {
        const node1 = this.getNodeId(row, col - 1);
        const node2 = this.getNodeId(row, col);
        this.uf.union(node1, node2);
      }
    }
  }

  /**
   * Convert (row, col) position to unique node ID
   * @param {number} row - Row index (0-29)
   * @param {number} col - Column index (0-9)
   * @returns {number} Unique node ID
   */
  getNodeId(row, col) {
    // Special handling for rails
    if (row === RAIL_TOP_VCC) return this.totalNodes - 4;
    if (row === RAIL_TOP_GND) return this.totalNodes - 3;
    if (row === RAIL_BOTTOM_GND) return this.totalNodes - 2;
    if (row === RAIL_BOTTOM_VCC) return this.totalNodes - 1;
    
    return row * COLS + col;
  }

  /**
   * Get the canonical node ID for a position (after wire merging)
   * @param {number} row - Row index
   * @param {number} col - Column index
   * @returns {number} Canonical node ID
   */
  getCanonicalNode(row, col) {
    const nodeId = this.getNodeId(row, col);
    return this.uf.find(nodeId);
  }

  /**
   * Connect two holes with a wire (merge their nodes)
   * @param {Object} pos1 - First position {row, col}
   * @param {Object} pos2 - Second position {row, col}
   */
  connectWire(pos1, pos2) {
    const node1 = this.getNodeId(pos1.row, pos1.col);
    const node2 = this.getNodeId(pos2.row, pos2.col);
    this.uf.union(node1, node2);
  }

  /**
   * Get all unique nodes in the circuit
   * @returns {Set<number>} Set of canonical node IDs
   */
  getUniqueNodes() {
    const nodes = new Set();
    for (let i = 0; i < this.totalNodes; i++) {
      nodes.add(this.uf.find(i));
    }
    return nodes;
  }

  /**
   * Reset the union-find structure (clear all wire connections)
   */
  reset() {
    this.uf = new UnionFind(this.totalNodes);
    this.initializeStripConnections();
  }
}
