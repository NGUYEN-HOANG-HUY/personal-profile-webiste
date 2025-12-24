/**
 * 74HC00 - Quad 2-input NAND Gate
 * DIP-14 package, CMOS logic family
 * 
 * Pin Configuration:
 *  1: 1A (Input)      14: VCC
 *  2: 1B (Input)      13: 4B (Input)
 *  3: 1Y (Output)     12: 4A (Input)
 *  4: 2A (Input)      11: 4Y (Output)
 *  5: 2B (Input)      10: 3B (Input)
 *  6: 2Y (Output)      9: 3A (Input)
 *  7: GND              8: 3Y (Output)
 * 
 * Each gate: Y = !(A & B)
 */

import { ICComponent } from '../ic-models.js';
import { createCMOSPin, PinType, PinBehavior } from '../ic-pin.js';

export class IC_74HC00 extends ICComponent {
  constructor(id, row, col, orientation = 'horizontal') {
    super(id, '74HC00', 'DIP-14', row, col, orientation);
    
    this.initializePins();
  }

  initializePins() {
    // Create pins with proper CMOS characteristics
    const vcc = 5.0;

    // Gate 1
    this.addPin(createCMOSPin(1, '1A', PinType.INPUT, vcc));
    this.addPin(createCMOSPin(2, '1B', PinType.INPUT, vcc));
    this.addPin(createCMOSPin(3, '1Y', PinType.OUTPUT, vcc));

    // Gate 2
    this.addPin(createCMOSPin(4, '2A', PinType.INPUT, vcc));
    this.addPin(createCMOSPin(5, '2B', PinType.INPUT, vcc));
    this.addPin(createCMOSPin(6, '2Y', PinType.OUTPUT, vcc));

    // GND
    this.addPin(createCMOSPin(7, 'GND', PinType.GND, vcc));

    // Gate 3
    this.addPin(createCMOSPin(8, '3Y', PinType.OUTPUT, vcc));
    this.addPin(createCMOSPin(9, '3A', PinType.INPUT, vcc));
    this.addPin(createCMOSPin(10, '3B', PinType.INPUT, vcc));

    // Gate 4
    this.addPin(createCMOSPin(11, '4Y', PinType.OUTPUT, vcc));
    this.addPin(createCMOSPin(12, '4A', PinType.INPUT, vcc));
    this.addPin(createCMOSPin(13, '4B', PinType.INPUT, vcc));

    // VCC
    this.addPin(createCMOSPin(14, 'VCC', PinType.POWER, vcc));
  }

  /**
   * Evaluate all 4 NAND gates
   * Called during MNA iteration to update output pin logic levels
   */
  evaluate() {
    if (!this.isPowered()) {
      // IC not powered: all outputs go to undefined/high-Z
      this.getPin(3).logicLevel = 'X';
      this.getPin(6).logicLevel = 'X';
      this.getPin(8).logicLevel = 'X';
      this.getPin(11).logicLevel = 'X';
      return;
    }

    // Gate 1: Y = !(A & B)
    const gate1 = this.evaluateNAND(
      this.getPin(1).logicLevel,
      this.getPin(2).logicLevel
    );
    this.getPin(3).logicLevel = gate1;

    // Gate 2
    const gate2 = this.evaluateNAND(
      this.getPin(4).logicLevel,
      this.getPin(5).logicLevel
    );
    this.getPin(6).logicLevel = gate2;

    // Gate 3
    const gate3 = this.evaluateNAND(
      this.getPin(9).logicLevel,
      this.getPin(10).logicLevel
    );
    this.getPin(8).logicLevel = gate3;

    // Gate 4
    const gate4 = this.evaluateNAND(
      this.getPin(12).logicLevel,
      this.getPin(13).logicLevel
    );
    this.getPin(11).logicLevel = gate4;
  }

  /**
   * NAND gate logic evaluation
   * @param {string} a - Logic level '0', '1', 'X'
   * @param {string} b - Logic level '0', '1', 'X'
   * @returns {string} Output logic level
   */
  evaluateNAND(a, b) {
    // Handle undefined inputs
    if (a === 'X' || b === 'X') {
      return 'X';
    }

    // NAND truth table
    if (a === '1' && b === '1') {
      return '0';
    } else {
      return '1';
    }
  }
}
