import { useRef, useEffect, useState } from 'react';
import { ROWS, COLS, COLS_PER_SIDE, RAIL_TOP_VCC, RAIL_TOP_GND, RAIL_BOTTOM_VCC, RAIL_BOTTOM_GND } from '../engine/breadboard-topology';
import './BreadboardCanvas.css';

/**
 * BreadboardCanvas - Interactive canvas-based breadboard renderer
 * Handles two-click component placement and visual feedback
 */
const BreadboardCanvas = ({ breadboard, components, selectedTool, simulationResult, onAddComponent, onRemoveComponent }) => {
  const canvasRef = useRef(null);
  const [firstClick, setFirstClick] = useState(null);
  const [hoveredHole, setHoveredHole] = useState(null);

  // Canvas dimensions and layout constants
  const HOLE_RADIUS = 4;
  const HOLE_SPACING = 20;
  const GRID_PADDING = 40;
  const RAIL_HEIGHT = 15;
  const RAIL_SPACING = 10;
  const CENTER_GAP = 30;

  const CANVAS_WIDTH = GRID_PADDING * 2 + COLS * HOLE_SPACING;
  const CANVAS_HEIGHT = GRID_PADDING * 2 + ROWS * HOLE_SPACING + 2 * (RAIL_HEIGHT + RAIL_SPACING) + CENTER_GAP;

  /**
   * Convert grid position to canvas coordinates
   */
  const getHolePosition = (row, col) => {
    let x = GRID_PADDING + col * HOLE_SPACING;
    let y;

    if (row === RAIL_TOP_VCC) {
      y = GRID_PADDING - RAIL_SPACING - RAIL_HEIGHT / 2;
    } else if (row === RAIL_TOP_GND) {
      y = GRID_PADDING - RAIL_SPACING;
    } else if (row === RAIL_BOTTOM_GND) {
      y = GRID_PADDING + ROWS * HOLE_SPACING + RAIL_SPACING;
    } else if (row === RAIL_BOTTOM_VCC) {
      y = GRID_PADDING + ROWS * HOLE_SPACING + RAIL_SPACING + RAIL_HEIGHT / 2;
    } else {
      y = GRID_PADDING + row * HOLE_SPACING;
      // Add center gap for rows in bottom half
      if (col >= COLS_PER_SIDE) {
        y += CENTER_GAP;
      }
    }

    return { x, y };
  };

  /**
   * Convert canvas coordinates to grid position
   */
  const getGridPosition = (canvasX, canvasY) => {
    // Check rails first
    const railY1 = GRID_PADDING - RAIL_SPACING;
    const railY2 = GRID_PADDING + ROWS * HOLE_SPACING + RAIL_SPACING;

    if (canvasY < railY1 && canvasY > GRID_PADDING - RAIL_SPACING - RAIL_HEIGHT) {
      const col = Math.round((canvasX - GRID_PADDING) / HOLE_SPACING);
      if (col >= 0 && col < COLS) {
        return { row: RAIL_TOP_VCC, col };
      }
    }

    if (canvasY > railY2 && canvasY < railY2 + RAIL_HEIGHT) {
      const col = Math.round((canvasX - GRID_PADDING) / HOLE_SPACING);
      if (col >= 0 && col < COLS) {
        return { row: RAIL_BOTTOM_GND, col };
      }
    }

    // Check main grid
    const col = Math.round((canvasX - GRID_PADDING) / HOLE_SPACING);
    let adjustedY = canvasY;
    
    // Adjust for center gap
    if (col >= COLS_PER_SIDE) {
      adjustedY -= CENTER_GAP;
    }

    const row = Math.round((adjustedY - GRID_PADDING) / HOLE_SPACING);

    if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
      return { row, col };
    }

    return null;
  };

  /**
   * Draw the breadboard
   */
  const drawBreadboard = (ctx) => {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw breadboard background
    ctx.fillStyle = '#2a3142';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw power rails
    drawRail(ctx, RAIL_TOP_VCC, '#ef4444'); // Red for VCC
    drawRail(ctx, RAIL_BOTTOM_GND, '#3b82f6'); // Blue for GND

    // Draw main grid holes
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const { x, y } = getHolePosition(row, col);
        drawHole(ctx, x, y, row, col);
      }
    }

    // Draw center divider
    ctx.strokeStyle = '#1a1f2e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const dividerY = GRID_PADDING + ROWS * HOLE_SPACING / 2 + CENTER_GAP / 2;
    ctx.moveTo(GRID_PADDING, dividerY);
    ctx.lineTo(CANVAS_WIDTH - GRID_PADDING, dividerY);
    ctx.stroke();

    // Draw components
    components.forEach(comp => {
      drawComponent(ctx, comp);
    });

    // Draw first click indicator
    if (firstClick && selectedTool) {
      const { x, y } = getHolePosition(firstClick.row, firstClick.col);
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, HOLE_RADIUS + 4, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw hover indicator
    if (hoveredHole && selectedTool) {
      const { x, y } = getHolePosition(hoveredHole.row, hoveredHole.col);
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.arc(x, y, HOLE_RADIUS + 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  };

  /**
   * Draw a power rail
   */
  const drawRail = (ctx, railRow, color) => {
    for (let col = 0; col < COLS; col++) {
      const { x, y } = getHolePosition(railRow, col);
      ctx.fillStyle = '#1a1f2e';
      ctx.beginPath();
      ctx.arc(x, y, HOLE_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      
      // Rail stripe
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      if (col < COLS - 1) {
        const { x: x2 } = getHolePosition(railRow, col + 1);
        ctx.beginPath();
        ctx.moveTo(x + HOLE_RADIUS, y);
        ctx.lineTo(x2 - HOLE_RADIUS, y);
        ctx.stroke();
      }
    }
  };

  /**
   * Draw a single hole
   */
  const drawHole = (ctx, x, y, row, col) => {
    ctx.fillStyle = '#1a1f2e';
    ctx.beginPath();
    ctx.arc(x, y, HOLE_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    // Draw strip connections (subtle lines)
    if (col % COLS_PER_SIDE !== 0) {
      ctx.strokeStyle = '#151820';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - HOLE_SPACING / 2, y);
      ctx.lineTo(x - HOLE_RADIUS, y);
      ctx.stroke();
    }
  };

  /**
   * Draw a component
   */
  const drawComponent = (ctx, comp) => {
    // Handle IC components
    if (comp.type === 'ic') {
      drawIC(ctx, comp);
      return;
    }

    const pos1 = getHolePosition(comp.row1, comp.col1);
    const pos2 = comp.row2 !== undefined ? getHolePosition(comp.row2, comp.col2) : null;

    if (comp.type === 'wire') {
      drawWire(ctx, pos1, pos2);
    } else if (comp.type === 'resistor') {
      drawResistor(ctx, pos1, pos2, comp);
    } else if (comp.type === 'led') {
      drawLED(ctx, pos1, pos2, comp);
    } else if (comp.type === 'vcc') {
      drawVCC(ctx, pos1);
    } else if (comp.type === 'gnd') {
      drawGND(ctx, pos1);
    }
  };

  const drawWire = (ctx, pos1, pos2) => {
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pos1.x, pos1.y);
    ctx.lineTo(pos2.x, pos2.y);
    ctx.stroke();
  };

  const drawResistor = (ctx, pos1, pos2, comp) => {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    const angle = Math.atan2(dy, dx);
    const dist = Math.sqrt(dx * dx + dy * dy);

    ctx.save();
    ctx.translate(pos1.x, pos1.y);
    ctx.rotate(angle);

    // Leads
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(dist * 0.2, 0);
    ctx.moveTo(dist * 0.8, 0);
    ctx.lineTo(dist, 0);
    ctx.stroke();

    // Body
    const bodyLen = dist * 0.6;
    const bodyHeight = 8;
    ctx.fillStyle = '#d4a373';
    ctx.fillRect(dist * 0.2, -bodyHeight / 2, bodyLen, bodyHeight);
    ctx.strokeStyle = '#8b6f47';
    ctx.lineWidth = 1;
    ctx.strokeRect(dist * 0.2, -bodyHeight / 2, bodyLen, bodyHeight);

    ctx.restore();

    // Label
    ctx.fillStyle = '#f9fafb';
    ctx.font = '10px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(`${comp.resistance}Ω`, (pos1.x + pos2.x) / 2, (pos1.y + pos2.y) / 2 - 12);
  };

  const drawLED = (ctx, pos1, pos2, comp) => {
    // Get brightness from simulation
    let brightness = 0;
    if (simulationResult?.components) {
      const simComp = simulationResult.components.find(c => c.id === comp.id);
      if (simComp && simComp.getBrightness) {
        brightness = simComp.getBrightness(simulationResult.voltages);
      }
    }

    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    const angle = Math.atan2(dy, dx);
    const dist = Math.sqrt(dx * dx + dy * dy);

    ctx.save();
    ctx.translate(pos1.x, pos1.y);
    ctx.rotate(angle);

    // Leads
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(dist * 0.3, 0);
    ctx.moveTo(dist * 0.7, 0);
    ctx.lineTo(dist, 0);
    ctx.stroke();

    // LED body
    const ledRadius = 6;
    const ledX = dist / 2;
    
    // Glow effect if LED is on
    if (brightness > 0.1) {
      const glowRadius = ledRadius + brightness * 8;
      const gradient = ctx.createRadialGradient(ledX, 0, 0, ledX, 0, glowRadius);
      gradient.addColorStop(0, `rgba(239, 68, 68, ${brightness * 0.8})`);
      gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(ledX, 0, glowRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // LED dome
    const baseColor = brightness > 0.1 
      ? `rgb(${255}, ${Math.round(68 + brightness * 100)}, ${Math.round(68 + brightness * 100)})`
      : '#ef4444';
    ctx.fillStyle = baseColor;
    ctx.beginPath();
    ctx.arc(ledX, 0, ledRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#991b1b';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Anode marker (+)
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(dist * 0.25, -3);
    ctx.lineTo(dist * 0.25, 3);
    ctx.moveTo(dist * 0.25 - 3, 0);
    ctx.lineTo(dist * 0.25 + 3, 0);
    ctx.stroke();

    ctx.restore();
  };

  const drawVCC = (ctx, pos) => {
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('+', pos.x, pos.y);
  };

  const drawGND = (ctx, pos) => {
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pos.x - 4, pos.y);
    ctx.lineTo(pos.x + 4, pos.y);
    ctx.stroke();
  };

  /**
   * Draw an IC component (DIP package)
   */
  const drawIC = (ctx, ic) => {
    const pinCount = ic.pinCount;
    const pinsPerSide = pinCount / 2;
    
    // Calculate IC dimensions
    const icHeight = (pinsPerSide - 1) * HOLE_SPACING + 16;
    const icWidth = 45;
    
    // Get position of first pin (top-left)
    const firstPin = getHolePosition(ic.row, 4); // Column 'e'
    const x = firstPin.x - icWidth / 2 + HOLE_SPACING / 2;
    const y = firstPin.y - 8;
    
    // Draw IC body (black rectangle)
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x, y, icWidth, icHeight);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, icWidth, icHeight);
    
    // Draw pin 1 notch (semicircle at top center)
    ctx.beginPath();
    ctx.arc(x + icWidth / 2, y, 5, 0, Math.PI, true); // True for counterclockwise (notch)
    ctx.fillStyle = '#444';
    ctx.fill();
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw IC model label
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ic.model, x + icWidth / 2, y + icHeight / 2);
    
    // Draw pins
    if (ic.pins) {
      ic.pins.forEach((pin, idx) => {
        const pinPos = idx < pinsPerSide 
          ? getHolePosition(ic.row + idx, 4)  // Left side
          : getHolePosition(ic.row + (pinCount - idx - 1), 5); // Right side
        
        // Pin circle
        let pinColor = '#666';
        
        // Color by logic state if available
        if (pin.logicLevel === '1') {
          pinColor = '#ef4444'; // HIGH = red
        } else if (pin.logicLevel === '0') {
          pinColor = '#3b82f6'; // LOW = blue
        }
        
        ctx.fillStyle = pinColor;
        ctx.beginPath();
        ctx.arc(pinPos.x, pinPos.y, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Pin numbers (shown on hover/select)
        if (ic.selected || ic.hovered) {
          ctx.fillStyle = '#fff';
          ctx.font = '7px monospace';
          ctx.textAlign = 'center';
          const offset = idx < pinsPerSide ? -10 : 10;
          ctx.fillText(idx + 1, pinPos.x + offset, pinPos.y);
        }
      });
    }
  };

  /**
   * Handle canvas click for component placement
   */
  const handleClick = (event) => {
    if (!selectedTool) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const gridPos = getGridPosition(x, y);

    if (!gridPos) return;

    // IC components (single-click placement at column 'e')
    if (selectedTool === '74HC00') {
      // Ensure IC is placed at column 'e' (column 4)
      if (gridPos.col !== 4) {
        console.warn('ICs must be placed at column e (between center divider)');
        return;
      }
      
      onAddComponent({
        type: 'ic',
        model: selectedTool,
        row: gridPos.row,
        col: gridPos.col,
        orientation: 'horizontal'
      });
      return;
    }

    // Single-pin components (VCC, GND)
    if (selectedTool === 'vcc' || selectedTool === 'gnd') {
      onAddComponent({
        type: selectedTool,
        row1: gridPos.row,
        col1: gridPos.col
      });
      return;
    }

    // Two-pin components (wire, resistor, LED)
    if (!firstClick) {
      setFirstClick(gridPos);
    } else {
      // Add component
      const componentData = {
        type: selectedTool,
        row1: firstClick.row,
        col1: firstClick.col,
        row2: gridPos.row,
        col2: gridPos.col
      };

      // Add type-specific properties
      if (selectedTool === 'resistor') {
        componentData.resistance = 220; // Default 220Ω
      } else if (selectedTool === 'led') {
        componentData.color = 'red';
      }

      onAddComponent(componentData);
      
      // Keep wire mode active, clear others
      if (selectedTool !== 'wire') {
        setFirstClick(null);
      } else {
        setFirstClick(null); // Or keep first click for continuous wiring
      }
    }
  };

  /**
   * Handle mouse move for hover effects
   */
  const handleMouseMove = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const gridPos = getGridPosition(x, y);
    setHoveredHole(gridPos);
  };

  /**
   * Redraw canvas when state changes
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    drawBreadboard(ctx);
  }, [components, firstClick, hoveredHole, simulationResult]);

  return (
    <div className="breadboard-container">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="breadboard-canvas"
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredHole(null)}
      />
      {firstClick && (
        <div className="instruction-tooltip">
          Click second hole to place {selectedTool}
        </div>
      )}
    </div>
  );
};

export default BreadboardCanvas;
