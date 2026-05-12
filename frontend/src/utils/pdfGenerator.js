import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generatePDFReport = (data) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(40);
  doc.text('Smart City Pollution Report', 14, 22);
  
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
  
  // Create table data
  const tableColumn = ["Zone", "AQI", "PM 2.5", "Risk Level", "Time"];
  const tableRows = [];

  data.forEach(item => {
    const timeString = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const rowData = [
      item.zone || 'Unknown',
      Math.round(item.aqi),
      item.pm25 ? item.pm25.toFixed(1) : 'N/A',
      item.risk_level,
      timeString
    ];
    tableRows.push(rowData);
  });

  // Table styling
  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 40,
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [241, 245, 249] }
  });

  // Save PDF
  doc.save('pollution_report.pdf');
};
