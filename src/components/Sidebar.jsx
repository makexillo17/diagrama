import React from 'react';
import { ArrowUp, ArrowDown, Download, Settings2 } from 'lucide-react';
import { LAYOUT_PRESETS } from '../utils/layoutEngine';

const Sidebar = ({ 
  data, setData, onExport, preset, setPreset,
  globalWidth, setGlobalWidth,
  scaleFactor, setScaleFactor,
  gap, setGap,
  layoutOptions, setLayoutOptions
}) => {
  const handleChange = (id, field, value) => {
    setData(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const moveItem = (index, direction) => {
    if (direction === -1 && index === 0) return;
    if (direction === 1 && index === data.length - 1) return;
    setData(prev => {
      const newData = [...prev];
      const temp = newData[index];
      newData[index] = newData[index + direction];
      newData[index + direction] = temp;
      return newData;
    });
  };

  const updateOption = (key, value) => {
    setLayoutOptions(prev => ({ ...prev, [key]: value }));
  };

  return (
    <aside className="sidebar" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
      <div className="sidebar-header" style={{ position: 'sticky', top: 0, backgroundColor: 'var(--bg-sidebar)', zIndex: 10 }}>
        <h2>Configuración</h2>
        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
          <button className="export-btn" onClick={() => onExport('svg')} title="Descargar como SVG" style={{ flex: 1, padding: '8px', fontSize: '11px' }}>
            <Download size={14} />
            SVG
          </button>
          <button className="export-btn" onClick={() => onExport('pdf')} title="Descargar como PDF" style={{ flex: 1, padding: '8px', fontSize: '11px', background: '#3a3a3c' }}>
            <Download size={14} />
            PDF
          </button>
        </div>
      </div>

      <div className="layout-controls" style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        {/* Layout Preset */}
        <div className="input-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Settings2 size={12} /> Layout Preset
          </label>
          <select 
            value={preset} 
            onChange={(e) => setPreset(e.target.value)}
            style={{
              width: '100%', padding: '8px', backgroundColor: 'rgba(0,0,0,0.2)', 
              border: '1px solid var(--border-color)', color: 'var(--text-main)',
              borderRadius: '4px', outline: 'none', fontFamily: 'inherit'
            }}
          >
            {LAYOUT_PRESETS.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Global Parametric Controls */}
        <div className="input-group">
          <label>Ancho Global: {globalWidth}px</label>
          <input 
            type="range" min="20" max="300" 
            value={globalWidth} onChange={(e) => setGlobalWidth(Number(e.target.value))} 
            style={{ width: '100%' }}
          />
        </div>
        
        <div className="input-group">
          <label>Separación (Gap): {gap}px</label>
          <input 
            type="range" min="5" max="100" 
            value={gap} onChange={(e) => setGap(Number(e.target.value))} 
            style={{ width: '100%' }}
          />
        </div>
        
        <div className="input-group">
          <label>Factor de Escala: x{scaleFactor}</label>
          <input 
            type="range" min="1" max="50" 
            value={scaleFactor} onChange={(e) => setScaleFactor(Number(e.target.value))} 
            style={{ width: '100%' }}
          />
        </div>

        {/* Layout Specific Controls */}
        {(preset === 'Lineal' || preset === 'Apilamiento') && (
          <div className="input-group">
            <label>Ordenar Por</label>
            <select 
              value={layoutOptions.orderBy} 
              onChange={(e) => updateOption('orderBy', e.target.value)}
              style={{ padding: '8px', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
            >
              <option>Ninguno (Manual)</option>
              <option>Mayor Área</option>
              <option>Menor Área</option>
              <option>Alfabético</option>
            </select>
          </div>
        )}

        {(preset === 'Rejilla' || preset === 'Sincopado') && (
          <div className="input-group">
            <label>Columnas: {layoutOptions.gridCols}</label>
            <input 
              type="range" min="1" max="10" 
              value={layoutOptions.gridCols} onChange={(e) => updateOption('gridCols', Number(e.target.value))} 
              style={{ width: '100%' }}
            />
          </div>
        )}

        {(preset === 'Centralizado' || preset === 'Concéntrico' || preset === 'Orgánico' || preset === 'Explosión') && (
          <div className="input-group">
            <label>Radio Base: {layoutOptions.radiusBase}px</label>
            <input 
              type="range" min="50" max="500" 
              value={layoutOptions.radiusBase} onChange={(e) => updateOption('radiusBase', Number(e.target.value))} 
              style={{ width: '100%' }}
            />
          </div>
        )}

      </div>
      
      <div className="editor-list">
        {data.map((item, index) => (
          <div key={item.id} className="editor-item">
            <div className="item-controls">
              <button onClick={() => moveItem(index, -1)} disabled={index === 0} className="icon-btn" title="Mover arriba">
                <ArrowUp size={14} />
              </button>
              <button onClick={() => moveItem(index, 1)} disabled={index === data.length - 1} className="icon-btn" title="Mover abajo">
                <ArrowDown size={14} />
              </button>
            </div>
            <div className="item-inputs">
              <div className="input-group" style={{ minWidth: '100%' }}>
                <label>Nombre</label>
                <input type="text" value={item.name} onChange={(e) => handleChange(item.id, 'name', e.target.value)} />
              </div>
              <div className="input-group area-input">
                <label>Área (m²)</label>
                <input type="number" value={item.area} onChange={(e) => handleChange(item.id, 'area', Number(e.target.value) || 0)} />
              </div>
              <div className="input-group color-input">
                <label>Color</label>
                <input type="color" value={item.color} onChange={(e) => handleChange(item.id, 'color', e.target.value)} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
