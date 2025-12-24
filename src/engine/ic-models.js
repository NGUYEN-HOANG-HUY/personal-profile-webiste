/**
 * IC Component Base Class
 * 
 * Multi-pin component with internal logic/analog model
 * Extends the Component class to integrate with MNA solver
 */

import { Component } from './components.js';
import { ICPin, PinType } from './ic-pin.js';

/**
 * ICComponent - Base class for all Integrated Circuits
 */
export class ICComponent extends Component {
  constructor(id, model, packageType, row, col, orientation = 'horizontal') {
    super(id, 'ic', null, null);
    
    this.model = model;               // IC model name (e.g., "74HC00")
    this.packageType = packageType;   // "DIP-8", "DIP-14", "DIP-16"
    this.row = row;                   // Anchor row position
    this.col = col;                   // Anchor column position
    this.orientation = orientation;   // 'horizontal' or 'vertical'
    
    this.pins = [];                   // Array of ICPin objects
    this.pinCount = 0;
    
    this.selected = false;
    this.hovered = false;
  }

  /**
   * Add a pin to this IC
   */
  addPin(pin) {
    this.pins.push(pin);
    this.pinCount = this.pins.length;
  }

  /**
   * Map pins to breadboard nodes
   * Must be called after pins are added
   */
  mapPinsToNodes(breadboard) {
    const pinPositions = this.calculatePinPositions();
    
    pinPositions.forEach((pos, idx) => {
      if (this.pins[idx]) {
        const nodeId = breadboard.getNodeId(pos.row, pos.col);
        const canonicalNode = breadboard.uf.find(nodeId);
        this.pins[idx].node = canonicalNode;
      }
    });
  }

  /**
   * Calculate breadboard positions for all pins
   * @returns {Array} [{row, col}, ...]
   */
  calculatePinPositions() {
    const positions = [];
    const pinsPerSide = this.pinCount / 2;

    if (this.orientation === 'horizontal') {
      // Pins 1 to pinsPerSide: Left side (column e), top to bottom
      for (let i = 0; i < pinsPerSide; i++) {
        positions.push({
          row: this.row + i,
          col: 4  // Column 'e'
        });
      }

      // Pins (pinsPerSide+1) to pinCount: Right side (column f), bottom to top
      for (let i = pinsPerSide - 1; i >= 0; i--) {
        positions.push({
          row: this.row + i,
          col: 5  // Column 'f'
        });
      }
    }
    // TODO: Vertical orientation

    return positions;
  }

  /**
   * Stamp IC contribution to MNA matrices
   * Each pin stamps its own electrical behavior
   */
  stamp(G, I, V, groundNode) {
    // First, update pin voltages from previous iteration
    this.pins.forEach(pin => {
      if (pin.node !== null && V[pin.node] !== undefined) {
        pin.updateFromVoltage(V[pin.node]);
      }
    });

    // Evaluate internal IC logic
    this.evaluate();

    // Build node map for pin stamping
    const nodeMap = new Map();
    let idx = 0;
    for (let i = 0; i < V.length; i++) {
      if (i !== groundNode) {
        nodeMap.set(i, idx++);
      }
    }

    // Each pin stamps its electrical behavior
    this.pins.forEach(pin => {
      pin.stamp(G, I, nodeMap, groundNode);
    });
  }

  /**
   * Evaluate IC internal logic
   * Override in subclasses (e.g., 74HC00 implements NAND gates)
   */
  evaluate() {
    // Base class does nothing
    // Subclasses implement gate logic, flip-flops, etc.
  }

  /**
   * Get pin by number (1-indexed)
   */
  getPin(pinNumber) {
    return this.pins[pinNumber - 1];
  }

  /**
   * Get pin by name
   */
  getPinByName(name) {
    return this.pins.find(p => p.name === name);
  }

  /**
   * Find VCC and GND pins
   */
  getPowerPins() {
    const vcc = this.pins.find(p => p.type === PinType.POWER);
    const gnd = this.pins.find(p => p.type === PinType.GND);
    return { vcc, gnd };
  }

  /**
   * Check if IC is powered (VCC and GND connected properly)
   */
  isPowered() {
    const { vcc, gnd } = this.getPowerPins();
    if (!vcc || !gnd) return false;

    // Check if VCC is HIGH and GND is LOW
    return vcc.voltage > 4.0 && gnd.voltage < 0.5;
  }

  /**
   * Serialize IC to JSON for export
   */
  toJSON() {
    return {
      id: this.id,
      type: 'ic',
      model: this.model,
      packageType: this.packageType,
      row: this.row,
      col: this.col,
      orientation: this.orientation
    };
  }

  /**
   * Deserialize IC from JSON
   */
  static fromJSON(data, ICLibrary) {
    // Look up IC model in library and instantiate
    const ICClass = ICLibrary[data.model];
    if (!ICClass) {
      throw new Error(`Unknown IC model: ${data.model}`);
    }
    return new ICClass(data.id, data.row, data.col, data.orientation);
  }
}
