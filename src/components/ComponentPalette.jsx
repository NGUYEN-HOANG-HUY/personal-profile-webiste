import './ComponentPalette.css';

/**
 * ComponentPalette - Toolbar for selecting components and circuit actions
 */
const ComponentPalette = ({ selectedTool, onSelectTool, onExport, onImport, onClear }) => {
  const tools = [
    { id: 'wire', name: 'Wire', icon: '━', color: '#3b82f6' },
    { id: 'resistor', name: 'Resistor', icon: '⎍', color: '#d4a373' },
    { id: 'led', name: 'LED', icon: '◉', color: '#ef4444' },
    { id: 'vcc', name: 'VCC (+5V)', icon: '+', color: '#ef4444' },
    { id: 'gnd', name: 'GND', icon: '⏚', color: '#3b82f6' },
    { id: '74HC00', name: '74HC00 (NAND)', icon: '◧', color: '#8b5cf6', isIC: true },
  ];

  const handleImportClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = onImport;
    input.click();
  };

  return (
    <div className="component-palette glass-card">
      <h3>Components</h3>
      
      <div className="tool-grid">
        {tools.map(tool => (
          <button
            key={tool.id}
            className={`tool-button ${selectedTool === tool.id ? 'active' : ''}`}
            onClick={() => onSelectTool(selectedTool === tool.id ? null : tool.id)}
            style={{ '--tool-color': tool.color }}
          >
            <span className="tool-icon">{tool.icon}</span>
            <span className="tool-name">{tool.name}</span>
          </button>
        ))}
      </div>

      <div className="palette-actions">
        <button className="action-button" onClick={onExport}>
          💾 Export
        </button>
        <button className="action-button" onClick={handleImportClick}>
          📂 Import
        </button>
        <button className="action-button danger" onClick={onClear}>
          🗑️ Clear
        </button>
      </div>
    </div>
  );
};

export default ComponentPalette;
