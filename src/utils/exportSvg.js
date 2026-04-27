import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportToVector = async (svgElement, baseFilename = 'diagrama-madriguera', format = 'svg') => {
  if (!svgElement) return;

  if (format === 'svg') {
    // Clone the SVG element to not modify the DOM directly
    const clone = svgElement.cloneNode(true);
    
    if (!clone.getAttribute('xmlns')) {
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    }

    // Inyectar estilo para fuentes seguras en SVG
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      text { font-family: Arial, Helvetica, sans-serif !important; }
      .oma-text { font-family: Arial, Helvetica, sans-serif !important; }
    `;
    clone.insertBefore(styleEl, clone.firstChild);

    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(clone);
    svgString = '<?xml version="1.0" encoding="utf-8"?>\n' + svgString;

    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${baseFilename}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } else if (format === 'pdf') {
    // Utilizar la impresión nativa del sistema para vector PDF
    window.print();
  }
};
