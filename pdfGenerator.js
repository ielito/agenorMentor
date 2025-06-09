export async function generatePDF(text, images = []) {
  const jsPDF = window.jspdf?.jsPDF;
  if (!jsPDF) throw new Error("jsPDF não carregado.");

  const doc = new jsPDF();
  const margin = 10;
  const pageHeight = doc.internal.pageSize.height;
  const lines = doc.splitTextToSize(text, 180);
  let y = margin;

  lines.forEach(line => {
    if (y > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += 10;
  });

  for (const base64 of images) {
    doc.addPage();
    doc.addImage(`data:image/png;base64,${base64}`, 'PNG', 10, 20, 190, 160);
  }

  return doc.output('blob');
}