/**
 * IC Library Registry
 * Central registry of all available IC models
 */

import { IC_74HC00 } from './ic-library/74HC00.js';

/**
 * IC Library - maps model names to IC classes
 */
export const ICLibrary = {
  '74HC00': IC_74HC00
  // Add more ICs here as they're implemented:
  // '555': IC_555,
  // '74HC595': IC_74HC595,
  // '4017': IC_4017,
};

/**
 * Get list of available IC models
 */
export function getAvailableICs() {
  return Object.keys(ICLibrary).map(model => ({
    model,
    name: getICDescription(model),
    packageType: getICPackage(model)
  }));
}

/**
 * Get human-readable IC description
 */
function getICDescription(model) {
  const descriptions = {
    '74HC00': 'Quad 2-input NAND Gate',
    '555': '555 Timer',
    '74HC595': '8-bit Shift Register',
    '4017': 'Decade Counter'
  };
  return descriptions[model] || model;
}

/**
 * Get IC package type
 */
function getICPackage(model) {
  const packages = {
    '74HC00': 'DIP-14',
    '555': 'DIP-8',
    '74HC595': 'DIP-16',
    '4017': 'DIP-16'
  };
  return packages[model] || 'DIP-14';
}

/**
 * Create an IC instance from model name
 */
export function createIC(model, id, row, col, orientation = 'horizontal') {
  const ICClass = ICLibrary[model];
  if (!ICClass) {
    throw new Error(`Unknown IC model: ${model}`);
  }
  return new ICClass(id, row, col, orientation);
}
