export const LAYOUT_PRESETS = [
  'Lineal', 'Rejilla', 'Explosión', 'Apilamiento', 
  'Centralizado', 'Agrupación', 'Anidado', 'Ortogonal', 
  'Orgánico', 'Simétrico', 'Asimétrico', 'Concéntrico', 
  'Sincopado', 'Sintáctico'
];

export const applyLayout = (blocks, preset, options = {}) => {
  // Global Parametric Config
  const scale = options.scaleFactor || 10;
  const width = options.globalWidth || 100;
  const gap = Math.max(5, typeof options.gap !== 'undefined' ? options.gap : 20);

  // Layout Specific Config
  const orderBy = options.orderBy || 'None';
  const gridCols = options.gridCols || Math.ceil(Math.sqrt(blocks.length));
  const radiusBase = options.radiusBase || 150;

  // Clone to avoid mutating state directly and ensure x,y exist
  let newBlocks = blocks.map(b => ({ ...b, x: b.x || 0, y: b.y || 0 }));
  
  // Helper to get block height
  const getHeight = (area) => (area * scale) / width;

  if (newBlocks.length === 0) return newBlocks;

  // Apply sorting if needed
  if (preset === 'Lineal' || preset === 'Apilamiento') {
    if (orderBy === 'Mayor Área') {
      newBlocks.sort((a, b) => b.area - a.area);
    } else if (orderBy === 'Menor Área') {
      newBlocks.sort((a, b) => a.area - b.area);
    } else if (orderBy === 'Alfabético') {
      newBlocks.sort((a, b) => a.name.localeCompare(b.name));
    }
  }

  const n = newBlocks.length;
  
  switch (preset) {
    case 'Lineal': {
      let currentX = 0;
      newBlocks.forEach((b) => {
        b.x = currentX;
        b.y = 0;
        currentX += width + gap;
      });
      break;
    }
    case 'Rejilla': {
      const cols = Math.max(1, gridCols);
      let currentY = 0;
      let rowMaxHeight = 0;
      
      newBlocks.forEach((b, i) => {
        const h = getHeight(b.area);
        const col = i % cols;
        
        if (col === 0 && i !== 0) {
          currentY += rowMaxHeight + gap;
          rowMaxHeight = 0;
        }
        
        if (h > rowMaxHeight) rowMaxHeight = h;
        
        b.x = col * (width + gap);
        b.y = currentY;
      });
      break;
    }
    case 'Apilamiento': {
      let currentY = 0;
      newBlocks.forEach((b) => {
        const h = getHeight(b.area);
        b.x = 0; 
        b.y = currentY;
        currentY += h + gap;
      });
      break;
    }
    case 'Explosión': {
      const centerX = 0;
      const centerY = 0;
      newBlocks.forEach((b, i) => {
        const angle = (i / n) * Math.PI * 2;
        const distance = radiusBase + i * gap;
        b.x = centerX + Math.cos(angle) * distance;
        b.y = centerY + Math.sin(angle) * distance;
      });
      break;
    }
    case 'Centralizado': {
      let largestIdx = 0;
      let maxArea = 0;
      newBlocks.forEach((b, i) => {
        if (b.area > maxArea) {
          maxArea = b.area;
          largestIdx = i;
        }
      });
      
      let angleStep = (Math.PI * 2) / Math.max(1, (n - 1));
      let angleObj = 0;
      
      newBlocks.forEach((b, i) => {
        if (i === largestIdx) {
          b.x = 0;
          b.y = 0;
        } else {
          const h = getHeight(b.area);
          const radius = radiusBase + Math.max(width, getHeight(maxArea)) / 2 + h/2 + gap;
          b.x = Math.cos(angleObj) * radius;
          b.y = Math.sin(angleObj) * radius;
          angleObj += angleStep;
        }
      });
      break;
    }
    case 'Agrupación': {
      let angle = 0;
      let radius = 0;
      const sortedIndices = [...Array(n).keys()].sort((a, b) => newBlocks[b].area - newBlocks[a].area);
      
      sortedIndices.forEach((origIdx, i) => {
        const b = newBlocks[origIdx];
        if (i === 0) {
          b.x = 0;
          b.y = 0;
        } else {
          angle += Math.PI / 2 + (Math.random() * 0.5);
          radius += (width / 2) + gap;
          b.x = Math.cos(angle) * radius;
          b.y = Math.sin(angle) * radius;
        }
      });
      break;
    }
    case 'Ortogonal': {
      const gridSize = width + gap;
      newBlocks.forEach((b, i) => {
        b.x = (i % 3) * gridSize;
        b.y = Math.floor(i / 3) * gridSize;
      });
      break;
    }
    case 'Orgánico': {
      const maxDist = radiusBase * 2;
      newBlocks.forEach((b) => {
        b.x = (Math.random() - 0.5) * maxDist;
        b.y = (Math.random() - 0.5) * maxDist;
      });
      break;
    }
    case 'Simétrico': {
      const half = Math.floor(n / 2);
      let currentY = 0;
      newBlocks.forEach((b, i) => {
        const h = getHeight(b.area);
        if (i < half) {
          b.x = -width - gap; // Left
          b.y = currentY;
        } else {
          b.x = gap; // Right
          b.y = i === half ? 0 : currentY; // reset Y for right side
        }
        currentY += (i === half - 1) ? 0 : h + gap;
      });
      break;
    }
    case 'Asimétrico': {
      let leftY = 0;
      let rightY = 0;
      newBlocks.forEach((b, i) => {
        const h = getHeight(b.area);
        if (i % 3 === 0) {
          b.x = gap * 2;
          b.y = rightY;
          rightY += h + gap;
        } else {
          b.x = -width - gap * 2;
          b.y = leftY;
          leftY += h + gap;
        }
      });
      break;
    }
    case 'Concéntrico': {
      let ring = 1;
      let inRing = 0;
      let capacity = 4;
      newBlocks.forEach((b, i) => {
        const angle = (inRing / capacity) * Math.PI * 2;
        const radius = ring * radiusBase + gap;
        b.x = Math.cos(angle) * radius;
        b.y = Math.sin(angle) * radius;
        inRing++;
        if (inRing >= capacity) {
          ring++;
          capacity += 4;
          inRing = 0;
        }
      });
      break;
    }
    case 'Sincopado': {
      const cols = Math.ceil(Math.sqrt(n));
      let currentY = 0;
      let rowMaxHeight = 0;
      
      newBlocks.forEach((b, i) => {
        const h = getHeight(b.area);
        const col = i % cols;
        
        if (col === 0 && i !== 0) {
          currentY += rowMaxHeight + gap;
          rowMaxHeight = 0;
        }
        if (h > rowMaxHeight) rowMaxHeight = h;
        
        const offsetX = (Math.random() - 0.5) * gap;
        const offsetY = (Math.random() - 0.5) * gap;
        b.x = col * (width + gap) + offsetX;
        b.y = currentY + offsetY;
      });
      break;
    }
    case 'Sintáctico': {
      newBlocks.forEach((b, i) => {
        b.x = i * (width + gap * 2);
        b.y = i * gap * 1.5;
      });
      break;
    }
    case 'Anidado': {
      let currentY = 0;
      newBlocks.forEach((b, i) => {
        b.x = (i % 2) * (gap || 10);
        b.y = currentY;
        currentY += (gap || 20); 
      });
      break;
    }
    default:
      break;
  }

  return newBlocks;
};
