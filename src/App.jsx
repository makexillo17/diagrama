import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Diagram from './components/Diagram';
import { exportToVector } from './utils/exportSvg';
import { applyLayout } from './utils/layoutEngine';

const initialDataRaw = [
  { id: 1, name: "Gimnasio", area: 76, color: "#e63946" },
  { id: 2, name: "Sala / Comedor / Cocina", area: 64, color: "#f4a261" },
  { id: 3, name: "Baño Mujeres", area: 36, color: "#2a9d8f" },
  { id: 4, name: "Baño Hombres", area: 36, color: "#2a9d8f" },
  { id: 5, name: "Habitación Mujeres", area: 36, color: "#264653" },
  { id: 6, name: "Habitación Hombres", area: 36, color: "#264653" },
  { id: 7, name: "Guardia", area: 36, color: "#e9c46a" },
  { id: 8, name: "Lockers Mujeres", area: 18, color: "#8ab17d" },
  { id: 9, name: "Lockers Hombres", area: 18, color: "#8ab17d" },
  { id: 10, name: "Subestación", area: 12, color: "#6c757d" },
  { id: 11, name: "Compresor", area: 12, color: "#6c757d" },
  { id: 12, name: "Cuarto de lavado", area: 12, color: "#6c757d" }
];

function App() {
  // Global Parametric States
  const [globalWidth, setGlobalWidth] = useState(100);
  const [scaleFactor, setScaleFactor] = useState(10);
  const [gap, setGap] = useState(20);
  const [layoutOptions, setLayoutOptions] = useState({
    orderBy: 'Mayor Área',
    gridCols: 4,
    radiusBase: 150
  });

  const [preset, setPreset] = useState('Apilamiento');
  
  // Data State
  const [data, setData] = useState(() => {
    // Initialize data with coordinates
    const options = { globalWidth, scaleFactor, gap, ...layoutOptions };
    return applyLayout(initialDataRaw.map(b => ({ ...b, x: 0, y: 0 })), preset, options);
  });
  
  const svgRef = useRef(null);

  // Apply layout whenever any parameter changes
  useEffect(() => {
    setData(prev => {
      const options = { globalWidth, scaleFactor, gap: Math.max(5, gap), ...layoutOptions };
      const newLayout = applyLayout(prev, preset, options);
      // Only update if positions actually changed to avoid infinite renders
      const changed = newLayout.some((b, i) => b.x !== prev[i]?.x || b.y !== prev[i]?.y);
      return changed ? newLayout : prev;
    });
  }, [preset, globalWidth, scaleFactor, gap, layoutOptions.orderBy, layoutOptions.gridCols, layoutOptions.radiusBase]);

  const handleExport = async (format) => {
    await exportToVector(svgRef.current, 'diagrama-programa', format);
  };

  // Wrapper for setData (when editing a block's area from Sidebar)
  const handleDataChange = (newDataFunc) => {
    setData(prev => {
      const newData = newDataFunc(prev);
      const options = { globalWidth, scaleFactor, gap, ...layoutOptions };
      return applyLayout(newData, preset, options);
    });
  };

  return (
    <div className="app-container">
      <Sidebar 
        data={data} 
        setData={handleDataChange} 
        onExport={handleExport}
        preset={preset}
        setPreset={setPreset}
        // Parametric Props
        globalWidth={globalWidth}
        setGlobalWidth={setGlobalWidth}
        scaleFactor={scaleFactor}
        setScaleFactor={setScaleFactor}
        gap={gap}
        setGap={setGap}
        layoutOptions={layoutOptions}
        setLayoutOptions={setLayoutOptions}
      />
      <main className="main-canvas">
        <Diagram 
          data={data} 
          ref={svgRef} 
          globalWidth={globalWidth}
          scaleFactor={scaleFactor}
        />
      </main>
    </div>
  );
}

export default App;
