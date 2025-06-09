export async function generatePDF(text, images = []) {
  const jsPDF = window.jspdf?.jsPDF;
  if (!jsPDF) throw new Error("jsPDF not loaded.");

  const doc = new jsPDF();
  const margin = 15;
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const lineHeight = 8;

  // Add title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text("AI-Generated Flow Description", pageWidth / 2, margin, { align: 'center' });

  // Add description text
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
  let y = margin + 10;

  lines.forEach(line => {
    if (y > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += lineHeight;
  });

  // Add images with new pages
  images.forEach((base64, index) => {
    doc.addPage();
    doc.setFontSize(12);
    doc.text(`Screenshot ${index + 1}`, margin, margin);

    const imgProps = doc.getImageProperties(`data:image/png;base64,${base64}`);
    const ratio = Math.min(180 / imgProps.width, 140 / imgProps.height);
    const imgWidth = imgProps.width * ratio;
    const imgHeight = imgProps.height * ratio;
    const x = (pageWidth - imgWidth) / 2;
    const y = (pageHeight - imgHeight) / 2;

    doc.addImage(`data:image/png;base64,${base64}`, 'PNG', x, y, imgWidth, imgHeight);
  });

  // Add page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  }

  return doc.output('blob');
}