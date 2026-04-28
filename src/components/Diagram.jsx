import React, { forwardRef, useMemo } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

const Diagram = forwardRef(({ data, globalWidth, scaleFactor, preset, textColor = '#f5f5f5', labelColor = '#f5f5f5', blockStyle = 'Solid', textAlignment = 'right' }, ref) => {
  const CANVAS_SIZE = 100000;
  const CENTER_OFFSET = CANVAS_SIZE / 2;

  // Pre-calculate label positions to prevent overlapping
  const { positions: labelPositions, diagramMaxX, diagramMinX } = useMemo(() => {
    const MIN_Y_DISTANCE = 20; 
    const positions = {};
    
    const diagramMaxX = data.length > 0 ? Math.max(...data.map(d => d.x + globalWidth)) : 0;
    const diagramMinX = data.length > 0 ? Math.min(...data.map(d => d.x)) : 0;

    // Sort indices by ideal Y (center of block) to process top to bottom
    const sortedIndices = data.map((_, i) => i).sort((a, b) => {
      const centerYA = data[a].y + ((data[a].area * scaleFactor) / globalWidth) / 2;
      const centerYB = data[b].y + ((data[b].area * scaleFactor) / globalWidth) / 2;
      return centerYA - centerYB;
    });

    const placedLabelsLeft = []; 
    const placedLabelsRight = [];

    sortedIndices.forEach(index => {
      const item = data[index];
      const height = (item.area * scaleFactor) / globalWidth;
      
      // Determine optimal side based on position
      const isLeft = item.x < 0;
      
      let idealY = item.y + height / 2;
      
      let hasCollision = true;
      let loopLimit = 150;
      
      const placedLabels = isLeft ? placedLabelsLeft : placedLabelsRight;
      
      while (hasCollision && loopLimit > 0) {
        loopLimit--;
        hasCollision = false;
        
        for (const placed of placedLabels) {
          if (Math.abs(idealY - placed.y) < (MIN_Y_DISTANCE - 0.1)) {
            idealY = placed.y + MIN_Y_DISTANCE;
            hasCollision = true;
            break; 
          }
        }
      }
      
      placedLabels.push({ id: item.id, y: idealY });
      positions[item.id] = { idealY, isLeft };
    });

    return { positions, diagramMaxX, diagramMinX };
  }, [data, globalWidth, scaleFactor]);

  const totalArea = data.reduce((sum, item) => sum + item.area, 0);
  const minAppY = data.length > 0 ? Math.min(...data.map(d => d.y)) : 0;

  return (
    <div className="diagram-container" style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <TransformWrapper
        initialScale={1}
        minScale={0.01}
        maxScale={15}
        limitToBounds={false}
        centerOnInit={true}
        wheel={{ step: 0.04, smoothStep: 0.005 }}
        panning={{ velocityDisabled: false }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <React.Fragment>
            <div className="zoom-controls" style={{ position: 'absolute', bottom: 20, right: 20, zIndex: 10, display: 'flex', gap: '8px' }}>
              <button onClick={() => zoomIn()} className="icon-btn" style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border-color)', padding: '8px' }}>+</button>
              <button onClick={() => zoomOut()} className="icon-btn" style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border-color)', padding: '8px' }}>-</button>
              <button onClick={() => resetTransform(300, "easeOutCubic")} className="icon-btn" style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border-color)', padding: '8px' }}>Reset</button>
            </div>
            
            <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }}>
              <svg
                ref={ref}
                width={CANVAS_SIZE}
                height={CANVAS_SIZE}
                className="diagram-svg"
                xmlns="http://www.w3.org/2000/svg"
                viewBox={`-${CENTER_OFFSET} -${CENTER_OFFSET} ${CANVAS_SIZE} ${CANVAS_SIZE}`}
              >
                {/* Subtle origin marker */}
                <circle cx="0" cy="0" r="4" fill="rgba(255,255,255,0.2)" />
                <line x1="-20" y1="0" x2="20" y2="0" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <line x1="0" y1="-20" x2="0" y2="20" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

                {data.length === 0 ? (
                  <text x="0" y="0" textAnchor="middle" dominantBaseline="middle" fill="var(--text-muted)" fontSize="16px" opacity="0.6">
                    Lienzo Vacío - Añade espacios en el panel lateral o importa un CSV
                  </text>
                ) : (
                  <>
                    {/* Total Area OMA Style */}
                    {(preset === 'Apilamiento' || preset === 'Intercalado') && (
                      <text
                        x={globalWidth / 2}
                        y={minAppY - 30}
                        textAnchor="middle"
                        fill={textColor}
                        className="oma-text"
                        style={{ fontSize: '14px', fontWeight: 'bold' }}
                      >
                        {totalArea.toLocaleString()} M²
                      </text>
                    )}

                    {data.map((item, index) => {
                      const height = (item.area * scaleFactor) / globalWidth;
                      const pos = labelPositions[item.id] || { idealY: 0, isLeft: false };
                      const { idealY, isLeft } = pos;
                      
                      // Calculate Polyline Points and Text Position
                      const lineStartX = isLeft ? 0 : globalWidth;
                      const lineMidX = isLeft ? diagramMinX - 40 - item.x : diagramMaxX + 40 - item.x;
                      const lineEndX = isLeft ? diagramMinX - 75 - item.x : diagramMaxX + 75 - item.x;
                      const textX = isLeft ? diagramMinX - 80 - item.x : diagramMaxX + 80 - item.x;
                      
                      return (
                        <g 
                          key={item.id} 
                          transform={`translate(${item.x}, ${item.y})`}
                          style={{ transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
                        >
                          <rect
                            width={globalWidth}
                            height={height}
                            fill={blockStyle === 'Solid' ? item.color : 'transparent'}
                            stroke={blockStyle === 'Outline' ? textColor : 'none'}
                            strokeWidth={blockStyle === 'Outline' ? 2 : 0}
                            style={{ transition: 'height 0.3s ease, fill 0.3s ease, width 0.3s ease, stroke 0.3s ease' }}
                          />
                          
                          {/* Unified External Label */}
                          <g>
                            <polyline
                              points={`${lineStartX},${height / 2} ${lineMidX},${idealY - item.y} ${lineEndX},${idealY - item.y}`}
                              fill="none"
                              stroke={labelColor || "var(--text-main)"}
                              strokeWidth="1"
                              style={{ transition: 'points 0.3s ease, stroke 0.3s ease', opacity: 0.6 }}
                            />
                            <text
                              x={textX}
                              y={idealY - item.y}
                              textAnchor={isLeft ? "end" : "start"}
                              fill={labelColor || "var(--text-main)"}
                              className="oma-text"
                              dominantBaseline="middle"
                              style={{ pointerEvents: 'none', transition: 'y 0.3s ease, x 0.3s ease, fill 0.3s ease' }}
                            >
                              {item.name} • {item.area} M²
                            </text>
                          </g>
                        </g>
                      );
                    })}
                  </>
                )}
              </svg>
            </TransformComponent>
          </React.Fragment>
        )}
      </TransformWrapper>
    </div>
  );
});

Diagram.displayName = 'Diagram';

export default Diagram;
