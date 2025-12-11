import { jsPDF } from 'jspdf';
import type { Winner } from '@/types';

export function exportWinnersToPDF(winners: Winner[]): void {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Ganadores Sorteo Quimpac', 105, 20, { align: 'center' });
  
  // Group winners by prize
  const winnersByPrize = winners.reduce<Record<string, Winner[]>>((acc, winner) => {
    if (!acc[winner.prizeName]) {
      acc[winner.prizeName] = [];
    }
    acc[winner.prizeName].push(winner);
    return acc;
  }, {});
  
  let yPosition = 40;
  const pageHeight = 280;
  const leftMargin = 20;
  
  // Iterate through each prize type
  Object.entries(winnersByPrize).forEach(([prizeName, prizeWinners]) => {
    // Check if we need a new page
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Prize header
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(prizeName, leftMargin, yPosition);
    yPosition += 2;
    
    // Draw line under header
    doc.setLineWidth(0.5);
    doc.line(leftMargin, yPosition, 190, yPosition);
    yPosition += 8;
    
    // Winner entries
    doc.setFontSize(11);
    prizeWinners.forEach((winner, index) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Winner number and name
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${winner.fullName}`, leftMargin + 5, yPosition);
      
      // Position
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`   ${winner.position}`, leftMargin + 5, yPosition + 5);
      doc.setFontSize(11);
      
      yPosition += 14;
    });
    
    yPosition += 10; // Space between prize sections
  });
  
  // Save the PDF
  doc.save('Ganadores_Sorteo_Quimpac.pdf');
}
