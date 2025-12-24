/**
 * Component Electrical Models
 * Each component knows how to contribute to the MNA system of equations
 * 
 * MNA Formulation:
 * G * V = I
 * Where:
 * - G is the conductance matrix (Y-matrix)
 * - V is the vector of unknown node voltages
 * - I is the vector of known current sources
 */

/**
 * Base Component class
 */
export class Component {
  constructor(id, type, node1, node2 = null) {
    this.id = id;
    this.type = type;
    this.node1 = node1; // First terminal node ID
    this.node2 = node2; // Second terminal node ID (null for 1-pin components)
  }

  /**
   * Stamp this component's contribution to the MNA matrices
   * @param {Array<Array>} G - Conductance matrix
   * @param {Array} I - Current source vector
   * @param {Array} V - Current voltage estimates (for non-linear components)
   * @param {number} groundNode - Reference ground node
   */
  stamp(G, I, V, groundNode) {
    throw new Error('stamp() must be implemented by component subclass');
  }
}

/**
 * Resistor - Linear passive element
 * Ohm's Law: V = I * R  →  I = V / R = G * V
 * Conductance: G = 1 / R
 */
export class Resistor extends Component {
  constructor(id, node1, node2, resistance) {
    super(id, 'resistor', node1, node2);
    this.resistance = resistance; // Ohms
    this.conductance = 1 / resistance;
  }

  stamp(G, I, V, groundNode) {
    const g = this.conductance;
    const n1 = this.node1;
    const n2 = this.node2;

    // Skip ground node (it's not in the matrix)
    if (n1 !== groundNode) {
      G[n1][n1] += g;
      if (n2 !== groundNode) {
        G[n1][n2] -= g;
      }
    }

    if (n2 !== groundNode) {
      G[n2][n2] += g;
      if (n1 !== groundNode) {
        G[n2][n1] -= g;
      }
    }
  }

  getCurrent(V) {
    const v1 = V[this.node1] || 0;
    const v2 = V[this.node2] || 0;
    return (v1 - v2) / this.resistance;
  }
}

/**
 * LED - Non-linear diode element
 * Simplified Shockley diode equation:
 * I = Is * (exp(V / (n * Vt)) - 1)
 * 
 * For simulation stability, we use piecewise linear approximation:
 * - If V < Vf_threshold: LED is off, acts as very high resistance
 * - If V >= Vf_threshold: LED is on, acts as Vf + R_on
 */
export class LED extends Component {
  constructor(id, node1, node2, color = 'red') {
    super(id, 'led', node1, node2);
    this.color = color;
    
    // LED characteristics (typical red LED)
    this.forwardVoltage = 1.8; // Volts
    this.onResistance = 10; // Ohms when conducting
    this.offResistance = 1e6; // Very high resistance when off
    this.isOn = false;
  }

  stamp(G, I, V, groundNode) {
    const n1 = this.node1; // Anode
    const n2 = this.node2; // Cathode

    // Get current voltage estimate across LED
    const v1 = V[n1] || 0;
    const v2 = V[n2] || 0;
    const vDiode = v1 - v2;

    // Determine LED state and effective resistance
    let r;
    if (vDiode > this.forwardVoltage) {
      // LED is on: use low on-resistance
      this.isOn = true;
      r = this.onResistance;
    } else {
      // LED is off: use high off-resistance
      this.isOn = false;
      r = this.offResistance;
    }

    const g = 1 / r;

    // Stamp like a resistor
    if (n1 !== groundNode) {
      G[n1][n1] += g;
      if (n2 !== groundNode) {
        G[n1][n2] -= g;
      }
    }

    if (n2 !== groundNode) {
      G[n2][n2] += g;
      if (n1 !== groundNode) {
        G[n2][n1] -= g;
      }
    }

    // For more accurate model, add voltage source contribution
    // This creates a Thevenin equivalent: Vf in series with R_on
    if (this.isOn && vDiode > this.forwardVoltage) {
      const iSource = this.forwardVoltage / r;
      if (n1 !== groundNode) I[n1] += iSource;
      if (n2 !== groundNode) I[n2] -= iSource;
    }
  }

  getCurrent(V) {
    const v1 = V[this.node1] || 0;
    const v2 = V[this.node2] || 0;
    const vDiode = v1 - v2;
    
    if (vDiode > this.forwardVoltage) {
      const r = this.onResistance;
      return (vDiode - this.forwardVoltage) / r;
    }
    return 0;
  }

  getBrightness(V) {
    const current = this.getCurrent(V);
    // Typical LED: 20mA for full brightness
    const maxCurrent = 0.020; // Amperes
    return Math.min(current / maxCurrent, 1.0);
  }
}

/**
 * Voltage Source - Fixed voltage constraint
 * Creates a known voltage at a node
 */
export class VoltageSource extends Component {
  constructor(id, node, voltage) {
    super(id, 'voltage_source', node, null);
    this.voltage = voltage; // Volts
  }

  stamp(G, I, V, groundNode) {
    // Voltage sources are handled separately as boundary conditions
    // They fix the voltage at their node
    // We'll handle this in the solver by modifying the matrix equations
  }
}

/**
 * Wire - Zero resistance connection
 * Wires don't stamp anything because they merge nodes in the topology
 */
export class Wire extends Component {
  constructor(id, node1, node2) {
    super(id, 'wire', node1, node2);
  }

  stamp(G, I, V, groundNode) {
    // Wires are handled by union-find in breadboard topology
    // No stamping needed
  }
}

// Note: IC components are in separate files due to complexity
// Import from ic-library.js instead
