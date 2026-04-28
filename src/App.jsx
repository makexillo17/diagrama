import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Diagram from './components/Diagram';
import { exportToVector } from './utils/exportSvg';
import { applyLayout } from './utils/layoutEngine';

function App() {
  // Global Parametric States
  const [globalWidth, setGlobalWidth] = useState(100);
  const [scaleFactor, setScaleFactor] = useState(10);
  const [gap, setGap] = useState(20);
  const [textColor, setTextColor] = useState('#f5f5f5');
  const [labelColor, setLabelColor] = useState('#f5f5f5');
  const [blockStyle, setBlockStyle] = useState('Solid');
  const [layoutOptions, setLayoutOptions] = useState({
    orderBy: 'Manual',
    gridCols: 4,
    radiusBase: 150,
    offsetX: 50,
    textAlignment: 'Intercalado'
  });

  const [preset, setPreset] = useState('Apilamiento');
  
  // Data State
  const [data, setData] = useState([]);
  
  const svgRef = useRef(null);

  // Apply layout whenever any parameter changes
  useEffect(() => {
    setData(prev => {
      const options = { globalWidth, scaleFactor, gap, ...layoutOptions };
      const newLayout = applyLayout(prev, preset, options);
      // Only update if positions actually changed to avoid infinite renders
      const changed = newLayout.some((b, i) => b.x !== prev[i]?.x || b.y !== prev[i]?.y);
      return changed ? newLayout : prev;
    });
  }, [preset, globalWidth, scaleFactor, gap, layoutOptions]);

  const handleExport = async (format) => {
    await exportToVector(svgRef.current, 'diagrama-programa', format);
  };

  // Wrapper for setData (when editing a block's area from Sidebar)
  const handleDataChange = (newDataFunc) => {
    setData(prev => {
      // Validar si recibimos una función o un arreglo directamente
      const newData = typeof newDataFunc === 'function' ? newDataFunc(prev) : newDataFunc;
  
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
        textColor={textColor}
        setTextColor={setTextColor}
        labelColor={labelColor}
        setLabelColor={setLabelColor}
        blockStyle={blockStyle}
        setBlockStyle={setBlockStyle}
      />
      <main className="main-canvas">
        <Diagram 
          data={data} 
          ref={svgRef} 
          globalWidth={globalWidth}
          scaleFactor={scaleFactor}
          preset={preset}
          textColor={textColor}
          labelColor={labelColor}
          blockStyle={blockStyle}
          textAlignment={layoutOptions.textAlignment}
        />
      </main>
    </div>
  );
}

export default App;
