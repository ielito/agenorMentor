export async function generatePDF(text) {
  const jsPDF = window.jspdf?.jsPDF;
  if (!jsPDF) throw new Error("jsPDF não carregado.");

  const doc = new jsPDF();
  const lines = doc.splitTextToSize(text, 180);
  doc.text(lines, 10, 10);

  return doc.output('blob');
}