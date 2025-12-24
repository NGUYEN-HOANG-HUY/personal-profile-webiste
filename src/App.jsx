import { useState, useEffect, useRef } from 'react'
import './App.css'
import BreadboardCanvas from './components/BreadboardCanvas'
import ComponentPalette from './components/ComponentPalette'
import { Breadboard, RAIL_TOP_VCC, RAIL_TOP_GND, RAIL_BOTTOM_VCC, RAIL_BOTTOM_GND } from './engine/breadboard-topology'
import { CircuitSolver } from './engine/mna-solver'
import { Resistor, LED, VoltageSource, Wire } from './engine/components'
import { createIC, ICLibrary } from './engine/ic-library'

/**
 * Main Application Component
 * Manages circuit state and simulation
 */
function App() {
  // Circuit state
  const [breadboard] = useState(() => new Breadboard());
  const [components, setComponents] = useState([]);
  const [selectedTool, setSelectedTool] = useState(null);
  const [simulationResult, setSimulationResult] = useState(null);
  
  // Component ID counter
  const componentIdRef = useRef(0);

  /**
   * Run circuit simulation whenever components change
   */
  useEffect(() => {
    runSimulation();
  }, [components]);

  /**
   * Execute MNA solver on current circuit
   * Hybrid simulation: Analog (MNA) + Digital (IC logic)
   */
  const runSimulation = () => {
    // Reset breadboard union-find
    breadboard.reset();

    // Apply wire connections
    components
      .filter(c => c.type === 'wire')
      .forEach(wire => {
        breadboard.connectWire(
          { row: wire.row1, col: wire.col1 },
          { row: wire.row2, col: wire.col2 }
        );
      });

    // Build list of unique nodes
    const uniqueNodes = breadboard.getUniqueNodes();

    // Choose ground node (use bottom GND rail as reference)
    const groundNodeId = breadboard.getNodeId(RAIL_BOTTOM_GND, 0);
    const groundNode = breadboard.uf.find(groundNodeId);

    // Build node map (exclude ground)
    const solver = new CircuitSolver();
    const nodeMap = solver.buildNodeMap(uniqueNodes, groundNode);

    // Convert UI components to circuit components with canonical nodes
    const circuitComponents = components.map(c => {
      // Handle IC components separately
      if (c.type === 'ic') {
        // IC is already a circuit component, just map pins to nodes
        c.mapPinsToNodes(breadboard);
        return c;
      }

      const node1 = breadboard.getCanonicalNode(c.row1, c.col1);
      const node2 = c.row2 !== undefined ? breadboard.getCanonicalNode(c.row2, c.col2) : null;

      if (c.type === 'resistor') {
        return new Resistor(c.id, node1, node2, c.resistance);
      } else if (c.type === 'led') {
        return new LED(c.id, node1, node2, c.color);
      } else if (c.type === 'vcc') {
        return new VoltageSource(c.id, node1, 5.0); // 5V
      } else if (c.type === 'gnd') {
        return new VoltageSource(c.id, node1, 0.0); // 0V (same as ground)
      } else if (c.type === 'wire') {
        return new Wire(c.id, node1, node2);
      }
      return null;
    }).filter(Boolean);

    // Solve the circuit (MNA solver handles IC stamping internally)
    const result = solver.solve(circuitComponents, nodeMap, groundNode);
    
    // Attach component references for brightness/state calculation
    result.components = circuitComponents;

    setSimulationResult(result);

    // Debug output
    if (result.converged) {
      console.log(`✅ Simulation converged in ${result.iterations} iterations`);
    } else {
      console.warn(`⚠️ Simulation did not converge (${result.iterations} iterations)`);
    }
  };

  /**
   * Add a component to the circuit
   */
  const addComponent = (componentData) => {
    let newComponent;
    
    // IC components need special instantiation
    if (componentData.type === 'ic') {
      newComponent = createIC(
        componentData.model,
        componentIdRef.current++,
        componentData.row,
        componentData.col,
        componentData.orientation || 'horizontal'
      );
    } else {
      newComponent = {
        id: componentIdRef.current++,
        ...componentData
      };
    }
    
    setComponents(prev => [...prev, newComponent]);
  };

  /**
   * Remove a component by ID
   */
  const removeComponent = (id) => {
    setComponents(prev => prev.filter(c => c.id !== id));
  };

  /**
   * Clear all components
   */
  const clearCircuit = () => {
    setComponents([]);
    componentIdRef.current = 0;
  };

  /**
   * Export circuit as JSON
   */
  const exportCircuit = () => {
    const data = JSON.stringify({ components }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'circuit.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  /**
   * Import circuit from JSON
   */
  const importCircuit = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        // Reconstruct components, handling ICs specially
        const reconstructed = data.components.map(c => {
          if (c.type === 'ic') {
            return createIC(c.model, c.id, c.row, c.col, c.orientation);
          }
          return c;
        });
        
        setComponents(reconstructed || []);
        // Update component ID counter
        const maxId = Math.max(0, ...data.components.map(c => c.id));
        componentIdRef.current = maxId + 1;
      } catch (error) {
        console.error('Failed to import circuit:', error);
        alert('Invalid circuit file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🔌 Breadboard Circuit Simulator</h1>
        <p className="subtitle">Build and simulate electronic circuits in real-time</p>
      </header>

      <div className="app-layout">
        <aside className="sidebar">
          <ComponentPalette
            selectedTool={selectedTool}
            onSelectTool={setSelectedTool}
            onExport={exportCircuit}
            onImport={importCircuit}
            onClear={clearCircuit}
          />
          
          <div className="simulation-status glass-card">
            <h3>Simulation Status</h3>
            {simulationResult ? (
              <>
                <div className={`status-badge ${simulationResult.converged ? 'success' : 'warning'}`}>
                  {simulationResult.converged ? '✅ Converged' : '⚠️ Not Converged'}
                </div>
                <p className="status-detail">Iterations: {simulationResult.iterations}</p>
                <p className="status-detail">Nodes: {simulationResult.voltages.size}</p>
                <p className="status-detail">Components: {components.length}</p>
              </>
            ) : (
              <p className="status-detail">No active circuit</p>
            )}
          </div>
        </aside>

        <main className="main-content">
          <BreadboardCanvas
            breadboard={breadboard}
            components={components}
            selectedTool={selectedTool}
            simulationResult={simulationResult}
            onAddComponent={addComponent}
            onRemoveComponent={removeComponent}
          />
        </main>
      </div>
    </div>
  )
}

export default App
