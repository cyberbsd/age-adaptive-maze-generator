import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Exports a target DOM element (PrintView) as a high-resolution A4 PDF document.
 * Handles both 1-page (Maze Worksheet) and 2-page (Worksheet + Answer Key) layouts.
 */
export async function exportToPDF(elementId, filename = 'maze-worksheet.pdf') {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`PDF Export target element #${elementId} not found`);
    return false;
  }

  try {
    // Temporary apply print scaling styles for high-dpi rendering
    const canvas = await html2canvas(element, {
      scale: 2, // High resolution (300 DPI equivalent)
      useCORS: true,
      logging: false,
      backgroundColor: '#FFFFFF',
      windowWidth: 1200
    });

    const imgData = canvas.toDataURL('image/png');
    
    // Standard A4 dimensions in mm: 210 x 297
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297

    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    if (imgHeight <= pdfHeight + 5) {
      // Single page
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    } else {
      // Multi-page (e.g. Worksheet page + Answer Key page)
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 5) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
    }

    pdf.save(filename);
    return true;
  } catch (err) {
    console.error('Failed to export PDF:', err);
    return false;
  }
}

/**
 * Triggers standard browser print window.
 */
export function triggerBrowserPrint() {
  window.print();
}
