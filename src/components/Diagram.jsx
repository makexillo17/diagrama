import React, { forwardRef, useMemo } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

const Diagram = forwardRef(({ data, globalWidth, scaleFactor }, ref) => {
  const CANVAS_SIZE = 3000;
  const CENTER_OFFSET = CANVAS_SIZE / 2;

  // Pre-calculate label positions to prevent overlapping
  const labelPositions = useMemo(() => {
    const MIN_Y_DISTANCE = 16; // Minimum vertical distance between label centers
    const positions = {};
    
    // Sort indices by ideal Y (center of block) to process top to bottom
    const sortedIndices = data.map((_, i) => i).sort((a, b) => {
      const centerYA = data[a].y + ((data[a].area * scaleFactor) / globalWidth) / 2;
      const centerYB = data[b].y + ((data[b].area * scaleFactor) / globalWidth) / 2;
      return centerYA - centerYB;
    });

    const placedLabels = []; // { id, x, y }

    sortedIndices.forEach(index => {
      const item = data[index];
      const height = (item.area * scaleFactor) / globalWidth;
      const startX = item.x + globalWidth + 15;
      let idealY = item.y + height / 2;
      
      // Resolve Y collisions
      let hasCollision = true;
      while (hasCollision) {
        hasCollision = false;
        for (const placed of placedLabels) {
          // If labels are horizontally close (within 300px), check vertical overlap
          if (Math.abs(startX - placed.x) < 300) {
            if (Math.abs(idealY - placed.y) < MIN_Y_DISTANCE) {
              idealY = placed.y + MIN_Y_DISTANCE;
              hasCollision = true;
            }
          }
        }
      }
      
      placedLabels.push({ id: item.id, x: startX, y: idealY });
      positions[item.id] = idealY;
    });

    return positions;
  }, [data, globalWidth, scaleFactor]);

  return (
    <div className="diagram-container" style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <TransformWrapper
        initialScale={1}
        minScale={0.1}
        maxScale={5}
        wheel={{ step: 0.1 }}
        panning={{ velocityDisabled: true }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <React.Fragment>
            <div className="zoom-controls" style={{ position: 'absolute', bottom: 20, right: 20, zIndex: 10, display: 'flex', gap: '8px' }}>
              <button onClick={() => zoomIn()} className="icon-btn" style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border-color)', padding: '8px' }}>+</button>
              <button onClick={() => zoomOut()} className="icon-btn" style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border-color)', padding: '8px' }}>-</button>
              <button onClick={() => resetTransform()} className="icon-btn" style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border-color)', padding: '8px' }}>Reset</button>
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

                {data.map((item) => {
                  const height = (item.area * scaleFactor) / globalWidth;
                  const labelY = labelPositions[item.id];
                  const lineEnd = globalWidth + 15;
                  
                  return (
                    <g 
                      key={item.id} 
                      transform={`translate(${item.x}, ${item.y})`}
                      style={{ transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
                    >
                      <rect
                        width={globalWidth}
                        height={height}
                        fill={item.color}
                        style={{ transition: 'height 0.3s ease, fill 0.3s ease, width 0.3s ease' }}
                      />
                      
                      {/* Unified External Label */}
                      <g>
                        <polyline
                          points={`${globalWidth},${height / 2} ${globalWidth + 8},${height / 2} ${lineEnd},${labelY - item.y}`}
                          fill="none"
                          stroke="var(--text-muted)"
                          strokeWidth="1"
                          style={{ transition: 'points 0.3s ease' }}
                        />
                        <text
                          x={lineEnd + 5}
                          y={labelY - item.y}
                          textAnchor="start"
                          fill="var(--text-main)"
                          className="oma-text"
                          dominantBaseline="middle"
                          style={{ pointerEvents: 'none', transition: 'y 0.3s ease' }}
                        >
                          {item.name} • {item.area} M²
                        </text>
                      </g>
                    </g>
                  );
                })}
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
