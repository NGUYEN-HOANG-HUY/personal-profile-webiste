/**
 * IC Pin Model - Professional electrical characteristics
 * 
 * Each IC pin is a full electrical model, not just a connection point.
 * This matches how real SPICE IC models define pins.
 */

export const PinType = {
  INPUT: 'INPUT',
  OUTPUT: 'OUTPUT',
  BIDIRECTIONAL: 'BIDIRECTIONAL',
  POWER: 'POWER',
  GND: 'GND'
};

export const PinBehavior = {
  PUSH_PULL: 'PUSH_PULL',       // Standard CMOS output
  OPEN_DRAIN: 'OPEN_DRAIN',     // Requires external pull-up
  TRI_STATE: 'TRI_STATE',       // Can be high-Z
  HIGH_Z: 'HIGH_Z',             // Always high impedance (input)
  PULL_UP: 'PULL_UP',           // Internal pull-up resistor
  PULL_DOWN: 'PULL_DOWN'        // Internal pull-down resistor
};

/**
 * IC Pin Class
 * Models the electrical characteristics of a single IC pin
 */
export class ICPin {
  constructor(config) {
    this.pinNumber = config.pinNumber;     // Physical pin number (1-based)
    this.name = config.name;               // Pin name (e.g., "1A", "VCC", "CLK")
    this.type = config.type;               // PinType enum
    this.behavior = config.behavior;       // PinBehavior enum
    
    // Electrical characteristics
    this.vth = config.vth || {
      VIL: 0.8,   // Input LOW threshold (volts)
      VIH: 2.0,   // Input HIGH threshold (volts)
      VOL: 0.4,   // Output LOW voltage (volts)
      VOH: 3.5    // Output HIGH voltage (volts)
    };
    
    // Output drive characteristics
    this.driveStrength = config.driveStrength || {
      rOn: 50,    // On-resistance (ohms) for output driver
      iMax: 0.025 // Maximum output current (amperes)
    };
    
    // Pull resistor (for inputs with pull-up/down)
    this.pullResistance = config.pullResistance || 50000; // 50kΩ typical
    
    // Current state
    this.node = null;           // Breadboard node ID
    this.logicLevel = null;     // Current logic level: 0, 1, 'Z' (high-Z), 'X' (undefined)
    this.voltage = 0;           // Current pin voltage
    this.isEnabled = true;      // For tri-state outputs
  }

  /**
   * Convert analog voltage to digital logic level
   * @param {number} voltage - Pin voltage in volts
   * @returns {string} Logic level: '0', '1', 'X' (undefined)
   */
  voltageToLogic(voltage) {
    if (voltage < this.vth.VIL) {
      return '0';
    } else if (voltage > this.vth.VIH) {
      return '1';
    } else {
      return 'X'; // Undefined region
    }
  }

  /**
   * Get output voltage for a given logic level
   * @param {string} logicLevel - '0' or '1'
   * @returns {number} Output voltage in volts
   */
  logicToVoltage(logicLevel) {
    if (logicLevel === '0') {
      return this.vth.VOL;
    } else if (logicLevel === '1') {
      return this.vth.VOH;
    }
    return null; // High-Z state
  }

  /**
   * Stamp this pin's contribution to MNA matrices
   * This integrates IC pin behavior into the analog solver
   */
  stamp(G, I, nodeMap, groundNode) {
    if (!this.node || this.node === groundNode) return;
    
    const nodeIdx = nodeMap.get(this.node);
    if (nodeIdx === undefined) return;

    // POWER and GND pins are handled by VoltageSource components
    if (this.type === PinType.POWER || this.type === PinType.GND) {
      return;
    }

    // INPUT pins
    if (this.type === PinType.INPUT) {
      // Inputs are high impedance, but may have pull resistors
      if (this.behavior === PinBehavior.PULL_UP) {
        // Add pull-up to VCC (assume 5V)
        const g = 1 / this.pullResistance;
        G[nodeIdx][nodeIdx] += g;
        I[nodeIdx] += g * 5.0; // Pull to VCC
      } else if (this.behavior === PinBehavior.PULL_DOWN) {
        // Add pull-down to GND
        const g = 1 / this.pullResistance;
        G[nodeIdx][nodeIdx] += g;
        // Current source to ground is zero (default)
      }
      // Otherwise, input is pure high-Z (no stamping)
      return;
    }

    // OUTPUT pins
    if (this.type === PinType.OUTPUT) {
      if (this.behavior === PinBehavior.TRI_STATE && !this.isEnabled) {
        // Tri-state disabled: high-Z (no stamping)
        return;
      }

      if (this.logicLevel === '0' || this.logicLevel === '1') {
        // Output drives the node like a voltage source with series resistance
        const vOut = this.logicToVoltage(this.logicLevel);
        const rOn = this.driveStrength.rOn;
        const g = 1 / rOn;

        G[nodeIdx][nodeIdx] += g;
        I[nodeIdx] += g * vOut;
      }
      // If logicLevel is 'Z' (high-Z), no stamping
    }

    // BIDIRECTIONAL pins are more complex (combined input/output)
    // For now, treat as output when driving, input otherwise
    if (this.type === PinType.BIDIRECTIONAL) {
      // TODO: Implement bidirectional pin logic
    }
  }

  /**
   * Update pin state from simulation results
   * @param {number} voltage - Simulated pin voltage
   */
  updateFromVoltage(voltage) {
    this.voltage = voltage;
    
    // For inputs, update logic level from voltage
    if (this.type === PinType.INPUT || this.type === PinType.BIDIRECTIONAL) {
      this.logicLevel = this.voltageToLogic(voltage);
    }
  }
}

/**
 * Create standard TTL pin configuration
 */
export function createTTLPin(pinNumber, name, type, behavior = PinBehavior.PUSH_PULL) {
  return new ICPin({
    pinNumber,
    name,
    type,
    behavior,
    vth: {
      VIL: 0.8,   // TTL standard
      VIH: 2.0,
      VOL: 0.4,
      VOH: 2.4    // TTL output HIGH (not full VCC)
    },
    driveStrength: {
      rOn: 50,
      iMax: 0.024  // 24mA typical TTL drive
    }
  });
}

/**
 * Create standard CMOS pin configuration
 */
export function createCMOSPin(pinNumber, name, type, vcc = 5.0, behavior = PinBehavior.PUSH_PULL) {
  return new ICPin({
    pinNumber,
    name,
    type,
    behavior,
    vth: {
      VIL: vcc * 0.3,   // CMOS: 30% VCC
      VIH: vcc * 0.7,   // CMOS: 70% VCC
      VOL: 0.1,         // CMOS output LOW (near 0V)
      VOH: vcc - 0.1    // CMOS output HIGH (near VCC)
    },
    driveStrength: {
      rOn: 100,
      iMax: 0.025  // 25mA typical CMOS drive
    }
  });
}
