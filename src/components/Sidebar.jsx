import React from 'react';
import { ArrowUp, ArrowDown, Download, Settings2, Trash2, Plus, FileSpreadsheet, Trash } from 'lucide-react';
import { LAYOUT_PRESETS } from '../utils/layoutEngine';

const hslToHex = (h, s, l) => {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

const Sidebar = ({ 
  data, setData, onExport, preset, setPreset,
  globalWidth, setGlobalWidth,
  scaleFactor, setScaleFactor,
  gap, setGap,
  layoutOptions, setLayoutOptions,
  textColor, setTextColor,
  labelColor, setLabelColor,
  blockStyle, setBlockStyle
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

  const handleAddBlock = () => {
    setData(prev => [{
      id: Date.now(),
      name: "Nuevo Espacio",
      area: 20,
      color: "#8ab17d",
      intercaladoDir: 'auto'
    }, ...prev]);
  };

  const handleDeleteBlock = (id) => {
    setData(prev => prev.filter(b => b.id !== id));
  };

  const handleClearProgram = () => {
    setData([]);
  };

  const handleDownloadTemplate = () => {
    const csvContent = "Nombre,Area\nGimnasio,76\nOficina,45";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "plantilla.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
      
      let validLines = lines;
      if (validLines.length > 0 && (validLines[0].toLowerCase().includes('nombre') || validLines[0].toLowerCase().includes('area'))) {
        validLines = validLines.slice(1);
      }

      if (validLines.length === 0) return;

      const angleStep = 360 / validLines.length;
      const startAngle = Math.floor(Math.random() * 360);

      const newBlocks = validLines.map((line, index) => {
        const parts = line.split(',');
        const name = parts[0] ? parts[0].trim() : `Espacio ${index + 1}`;
        let area = parseFloat(parts[1]);
        if (isNaN(area) || area <= 0) area = 10;

        const h = (startAngle + (index * angleStep)) % 360;
        const color = hslToHex(h, 70, 50);

        return {
          id: Date.now() + index,
          name,
          area,
          color,
          intercaladoDir: 'auto',
          x: 0,
          y: 0
        };
      });

      setData(newBlocks);
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
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

      <div className="program-management" style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h3 style={{ fontSize: '13px', margin: '0 0 5px 0', opacity: 0.8 }}>Gestión de Programa</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleClearProgram} className="export-btn" style={{ flex: 1, padding: '8px', fontSize: '11px', background: '#3a3a3c' }}>
            <Trash size={14} />
            Limpiar
          </button>
          <button onClick={handleDownloadTemplate} className="export-btn" style={{ flex: 1, padding: '8px', fontSize: '11px', background: '#3a3a3c' }}>
            <Download size={14} />
            Plantilla
          </button>
        </div>
        <label className="export-btn" style={{ padding: '8px', fontSize: '11px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
          <FileSpreadsheet size={14} />
          Importar CSV
          <input type="file" accept=".csv" onChange={handleFileUpload} style={{ display: 'none' }} />
        </label>
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
            type="range" min="0" max="100" 
            value={gap} onChange={(e) => setGap(Number(e.target.value))} 
            style={{ width: '100%' }}
          />
        </div>

        <div className="input-group">
          <label>Color de Texto</label>
          <input 
            type="color" 
            value={textColor} onChange={(e) => setTextColor(e.target.value)} 
            style={{ width: '100%', height: '30px', padding: '0', border: 'none' }}
          />
        </div>

        <div className="input-group">
          <label>Color de Etiquetas y Líneas</label>
          <input 
            type="color" 
            value={labelColor} onChange={(e) => setLabelColor(e.target.value)} 
            style={{ width: '100%', height: '30px', padding: '0', border: 'none' }}
          />
        </div>

        <div className="input-group">
          <label>Estilo de Bloque</label>
          <select 
            value={blockStyle} 
            onChange={(e) => setBlockStyle(e.target.value)}
            style={{ padding: '8px', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'var(--text-main)', width: '100%' }}
          >
            <option value="Solid">Solid</option>
            <option value="Outline">Outline</option>
          </select>
        </div>

        <div className="input-group">
          <label>Alineación de Etiquetas</label>
          <select 
            value={layoutOptions.textAlignment || 'Intercalado'} 
            onChange={(e) => updateOption('textAlignment', e.target.value)}
            style={{ padding: '8px', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'var(--text-main)', width: '100%' }}
          >
            <option value="Izquierda">Izquierda</option>
            <option value="Derecha">Derecha</option>
            <option value="Intercalado">Intercalado</option>
          </select>
        </div>

        <div className="input-group">
          <label>Ordenar Por</label>
          <select 
            value={layoutOptions.orderBy} 
            onChange={(e) => updateOption('orderBy', e.target.value)}
            style={{ padding: '8px', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'var(--text-main)', width: '100%' }}
          >
            <option value="Manual">Manual</option>
            <option value="Mayor a menor">Mayor a menor</option>
            <option value="Menor a mayor">Menor a mayor</option>
          </select>
        </div>

        {preset === 'Intercalado' && (
          <div className="input-group">
            <label>Desplazamiento X (Offset) %: {layoutOptions.offsetX !== undefined ? layoutOptions.offsetX : 50}</label>
            <input 
              type="range" min="0" max="150" 
              value={layoutOptions.offsetX !== undefined ? layoutOptions.offsetX : 50} 
              onChange={(e) => updateOption('offsetX', Number(e.target.value))} 
              style={{ width: '100%' }}
            />
          </div>
        )}
        
        <div className="input-group">
          <label>Factor de Escala: x{scaleFactor}</label>
          <input 
            type="range" min="1" max="50" 
            value={scaleFactor} onChange={(e) => setScaleFactor(Number(e.target.value))} 
            style={{ width: '100%' }}
          />
        </div>

        {/* Layout Specific Controls */}
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
        <button 
          onClick={handleAddBlock}
          style={{ 
            margin: '0 15px 15px 15px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
            gap: '8px', backgroundColor: 'transparent', border: '1px dashed var(--border-color)', 
            color: 'var(--text-main)', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s',
            opacity: 0.8
          }}
          onMouseOver={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
          onMouseOut={(e) => { e.currentTarget.style.opacity = '0.8'; e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <Plus size={16} /> Añadir Nuevo Bloque
        </button>

        {data.map((item, index) => (
          <div key={item.id} className="editor-item">
            <div className="item-controls">
              <button onClick={() => moveItem(index, -1)} disabled={index === 0} className="icon-btn" title="Mover arriba">
                <ArrowUp size={14} />
              </button>
              <button onClick={() => moveItem(index, 1)} disabled={index === data.length - 1} className="icon-btn" title="Mover abajo">
                <ArrowDown size={14} />
              </button>
              <button 
                onClick={() => handleDeleteBlock(item.id)} 
                className="icon-btn" 
                title="Eliminar bloque"
                onMouseOver={(e) => e.currentTarget.style.color = '#ff6b6b'}
                onMouseOut={(e) => e.currentTarget.style.color = ''}
              >
                <Trash2 size={14} />
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
              {preset === 'Intercalado' && (
                <div className="input-group" style={{ minWidth: '100%', marginTop: '8px' }}>
                  <label>Lado</label>
                  <select 
                    value={item.intercaladoDir || 'auto'} 
                    onChange={(e) => handleChange(item.id, 'intercaladoDir', e.target.value)}
                    style={{ padding: '4px', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'var(--text-main)', borderRadius: '4px' }}
                  >
                    <option value="auto">Auto</option>
                    <option value="left">Izquierda</option>
                    <option value="right">Derecha</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
