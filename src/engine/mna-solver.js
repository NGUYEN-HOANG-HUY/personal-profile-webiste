/**
 * Modified Nodal Analysis (MNA) Circuit Solver
 * 
 * Solves the linear system: G * V = I
 * Where:
 * - G is the conductance (admittance) matrix [n×n]
 * - V is the unknown node voltage vector [n×1]
 * - I is the known current source vector [n×1]
 * 
 * For non-linear components (LEDs), we use iterative fixed-point iteration:
 * 1. Start with initial voltage guess
 * 2. Linearize non-linear components around current operating point
 * 3. Solve linear system
 * 4. Update voltage vector
 * 5. Repeat until convergence
 */

/**
 * Gaussian Elimination with Partial Pivoting
 * Solves Ax = b for x
 * @param {Array<Array>} A - Coefficient matrix
 * @param {Array} b - Right-hand side vector
 * @returns {Array} Solution vector x
 */
function gaussianElimination(A, b) {
  const n = A.length;
  
  // Create augmented matrix [A | b]
  const aug = A.map((row, i) => [...row, b[i]]);

  // Forward elimination
  for (let i = 0; i < n; i++) {
    // Find pivot (largest element in column i, from row i downward)
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(aug[k][i]) > Math.abs(aug[maxRow][i])) {
        maxRow = k;
      }
    }

    // Swap rows
    [aug[i], aug[maxRow]] = [aug[maxRow], aug[i]];

    // Check for singular matrix
    if (Math.abs(aug[i][i]) < 1e-10) {
      console.warn(`Pivot ${i} is near zero, matrix may be singular`);
      continue;
    }

    // Eliminate column i in rows below
    for (let k = i + 1; k < n; k++) {
      const factor = aug[k][i] / aug[i][i];
      for (let j = i; j <= n; j++) {
        aug[k][j] -= factor * aug[i][j];
      }
    }
  }

  // Back substitution
  const x = Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let sum = aug[i][n];
    for (let j = i + 1; j < n; j++) {
      sum -= aug[i][j] * x[j];
    }
    x[i] = Math.abs(aug[i][i]) < 1e-10 ? 0 : sum / aug[i][i];
  }

  return x;
}

/**
 * MNA Circuit Solver
 */
export class CircuitSolver {
  constructor() {
    this.maxIterations = 20;
    this.convergenceThreshold = 1e-6; // Volts
  }

  /**
   * Solve the circuit using Modified Nodal Analysis
   * @param {Array} components - List of circuit components
   * @param {Map} nodeMap - Map from canonical node ID to matrix index
   * @param {number} groundNode - Ground reference node ID
   * @returns {Object} { voltages: Map, converged: boolean, iterations: number }
   */
  solve(components, nodeMap, groundNode) {
    const n = nodeMap.size; // Number of unknown nodes
    
    if (n === 0) {
      return { voltages: new Map(), converged: true, iterations: 0 };
    }

    // Initialize voltage vector (initial guess: all zeros)
    let V = Array(n).fill(0);
    
    // Handle voltage sources: set fixed voltages
    const voltageSources = components.filter(c => c.type === 'voltage_source');
    const voltageMap = new Map();
    voltageSources.forEach(vs => {
      const idx = nodeMap.get(vs.node1);
      if (idx !== undefined) {
        voltageMap.set(idx, vs.voltage);
        V[idx] = vs.voltage;
      }
    });

    // Iterative solver for non-linear components
    let converged = false;
    let iteration = 0;

    for (; iteration < this.maxIterations; iteration++) {
      // Build G matrix and I vector
      const G = Array.from({ length: n }, () => Array(n).fill(0));
      const I = Array(n).fill(0);

      // Stamp each component
      components.forEach(comp => {
        if (comp.type !== 'voltage_source') {
          comp.stamp(G, I, V, groundNode);
        }
      });

      // Apply voltage source constraints
      // For each voltage source, replace that row with a constraint equation
      voltageMap.forEach((voltage, idx) => {
        // Clear the row
        G[idx].fill(0);
        I[idx] = voltage;
        // Set diagonal to 1 (V[idx] = voltage)
        G[idx][idx] = 1;
      });

      // Solve the linear system
      let V_new;
      try {
        V_new = gaussianElimination(G, I);
      } catch (error) {
        console.error('Solver failed:', error);
        return { voltages: new Map(), converged: false, iterations: iteration };
      }

      // Check for NaN or Infinity
      if (V_new.some(v => !isFinite(v))) {
        console.warn('Solver produced non-finite values');
        return { voltages: new Map(), converged: false, iterations: iteration };
      }

      // Apply voltage source constraints again (in case solver drifted)
      voltageMap.forEach((voltage, idx) => {
        V_new[idx] = voltage;
      });

      // Check convergence
      const maxChange = Math.max(...V_new.map((v, i) => Math.abs(v - V[i])));
      
      V = V_new;

      if (maxChange < this.convergenceThreshold) {
        converged = true;
        break;
      }
    }

    // Convert voltage array to Map
    const voltages = new Map();
    nodeMap.forEach((idx, nodeId) => {
      voltages.set(nodeId, V[idx]);
    });

    // Ground node is always 0V
    voltages.set(groundNode, 0);

    return { voltages, converged, iterations: iteration + 1 };
  }

  /**
   * Build node map: canonical node ID → matrix index
   * Excludes ground node (it's our reference, voltage = 0)
   * @param {Set} uniqueNodes - Set of canonical node IDs
   * @param {number} groundNode - Ground node ID (excluded from matrix)
   * @returns {Map} Node ID → matrix index
   */
  buildNodeMap(uniqueNodes, groundNode) {
    const nodeMap = new Map();
    let idx = 0;
    uniqueNodes.forEach(nodeId => {
      if (nodeId !== groundNode) {
        nodeMap.set(nodeId, idx++);
      }
    });
    return nodeMap;
  }
}
