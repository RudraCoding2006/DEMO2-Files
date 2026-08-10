import { jsPDF } from 'jspdf';
import { formatDateDisplay, formatKgOrTon } from './formatters';

export const generateDispatchPdf = (dispatch) => {
  const doc = new jsPDF();

  // Header Banner
  doc.setFillColor(18, 22, 43); // Dark Navy #12162B
  doc.rect(0, 0, 210, 38, 'F');

  // Title Text
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('SAHEB PAPER PVT. LTD.', 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(190, 195, 210);
  doc.text('DISPATCH RECEIPT & DELIVERY CHALLAN', 14, 28);
  doc.text(`Receipt #: ${dispatch.dispatchNo || 'DSP-2026-001'}`, 140, 28);

  // Metadata Card
  doc.setFillColor(245, 246, 250);
  doc.roundedRect(14, 45, 182, 38, 3, 3, 'F');

  doc.setFontSize(10);
  doc.setTextColor(100, 105, 120);
  doc.text('Party Name:', 20, 56);
  doc.text('Vehicle Number:', 20, 64);
  doc.text('Dispatch Date:', 20, 72);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 27, 38);
  doc.text(dispatch.party || 'N/A', 60, 56);
  doc.text(dispatch.vehicleNumber || 'N/A', 60, 64);
  doc.text(formatDateDisplay(dispatch.date), 60, 72);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 105, 120);
  doc.text('Remarks:', 120, 56);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 27, 38);
  doc.text(dispatch.remarks || 'Standard Delivery', 120, 64);

  // Table Header
  let startY = 95;
  doc.setFillColor(91, 79, 233); // Indigo accent #5B4FE9
  doc.rect(14, startY, 182, 10, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('Product Description', 18, startY + 7);
  doc.text('GSM / Size / Ply', 90, startY + 7);
  doc.text('Reel No(s)', 140, startY + 7);
  doc.text('Weight (kg)', 175, startY + 7);

  // Table Content
  let currentY = startY + 18;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(22, 27, 38);

  const reelText = Array.isArray(dispatch.reelNos) ? dispatch.reelNos.join(', ') : (dispatch.reelNos || 'RL-001');

  doc.text(dispatch.productName || 'Napkin Tissue', 18, currentY);
  doc.text(`${dispatch.gsm} GSM | ${dispatch.size} | ${dispatch.ply} Ply`, 90, currentY);
  doc.text(reelText, 140, currentY);
  doc.setFont('helvetica', 'bold');
  doc.text(`${dispatch.quantityKg || 0} kg`, 175, currentY);

  // Divider Line
  doc.setDrawColor(220, 225, 235);
  doc.line(14, currentY + 8, 196, currentY + 8);

  // Total Summary
  let summaryY = currentY + 22;
  doc.setFillColor(235, 238, 252);
  doc.roundedRect(120, summaryY, 76, 20, 2, 2, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 105, 120);
  doc.text('Total Dispatched:', 125, summaryY + 8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(91, 79, 233);
  doc.text(formatKgOrTon(dispatch.quantityKg), 125, summaryY + 16);

  // Signatures Footer
  let sigY = 240;
  doc.setDrawColor(200, 205, 220);
  doc.line(20, sigY, 70, sigY);
  doc.line(140, sigY, 190, sigY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(120, 125, 140);
  doc.text('Driver / Receiver Signature', 23, sigY + 6);
  doc.text('Authorized Signatory', 147, sigY + 6);

  // Save PDF
  doc.save(`Dispatch_${dispatch.dispatchNo || 'Receipt'}.pdf`);
};
