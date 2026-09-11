import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Shipment, Piece } from '../types';

export function generateManifestPDF(shipment: Shipment, piecesList: any[]) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;

  // Header Background Accent Bar
  doc.setFillColor(0, 74, 198); // #004ac6
  doc.rect(margin, 12, 12, 12, 'F');
  
  // Logo text inside icon
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('AZ', margin + 6, 19.5, { align: 'center' });

  // Company Name
  doc.setTextColor(0, 43, 117);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('ALANZA CONSTRUCCIÓN & ESTRUCTURAS S.A.', margin + 16, 17);

  // Subtitles
  doc.setTextColor(85, 95, 111);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Departamento de Despacho y Logística', margin + 16, 21.5);
  doc.text('Planta de Fabricación • Parque Industrial Nave 4 • AISC & AWS D1.1', margin + 16, 25.5);

  // Document Info Box (Top Right)
  const boxWidth = 65;
  const boxX = pageWidth - margin - boxWidth;
  doc.setFillColor(240, 243, 255);
  doc.setDrawColor(0, 74, 198);
  doc.setLineWidth(0.5);
  doc.roundedRect(boxX, 12, boxWidth, 18, 2, 2, 'FD');

  doc.setTextColor(0, 74, 198);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('MANIFIESTO DE DESPACHO / REMISIÓN', boxX + boxWidth / 2, 16.5, { align: 'center' });

  doc.setTextColor(21, 28, 39);
  doc.setFontSize(12);
  doc.setFont('courier', 'bold');
  doc.text(shipment.id, boxX + boxWidth / 2, 22.5, { align: 'center' });

  doc.setTextColor(85, 95, 111);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Fecha de Emisión: ${shipment.date || '31/08/2026'}`, boxX + boxWidth / 2, 27, { align: 'center' });

  // Divider line
  doc.setDrawColor(200, 205, 215);
  doc.setLineWidth(0.3);
  doc.line(margin, 34, pageWidth - margin, 34);

  // Logistics & Project Grid Info
  const gridY = 38;
  const colWidth = (pageWidth - margin * 2) / 4;
  doc.setFillColor(250, 252, 255);
  doc.setDrawColor(220, 226, 243);
  doc.roundedRect(margin, gridY, pageWidth - margin * 2, 22, 2, 2, 'FD');

  // Col 1: Proyecto
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 110, 125);
  doc.text('PROYECTO DESTINO:', margin + 4, gridY + 5.5);
  doc.setFontSize(9);
  doc.setTextColor(21, 28, 39);
  doc.text(shipment.project || 'Proyecto General', margin + 4, gridY + 10.5);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(85, 95, 111);
  doc.text(shipment.destination || 'Sitio de Obra Principal', margin + 4, gridY + 15);

  // Col 2: Transportista
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 110, 125);
  doc.text('DPTO. DESPACHO (FLOTA):', margin + colWidth + 4, gridY + 5.5);
  doc.setFontSize(8);
  doc.setTextColor(21, 28, 39);
  doc.text(shipment.carrier || 'Flota Interna ALANZA', margin + colWidth + 4, gridY + 10.5);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(85, 95, 111);
  doc.text(`Chofer: ${shipment.driverName || 'Roberto Mendoza'}`, margin + colWidth + 4, gridY + 15);

  // Col 3: Unidad
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 110, 125);
  doc.text('CONDUCTOR / OPERADOR:', margin + colWidth * 2 + 4, gridY + 5.5);
  doc.setFontSize(8.5);
  doc.setTextColor(21, 28, 39);
  doc.setFont('helvetica', 'bold');
  doc.text(shipment.driverName || 'Roberto Mendoza', margin + colWidth * 2 + 4, gridY + 10.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(85, 95, 111);
  doc.text('Operador de Entrega', margin + colWidth * 2 + 4, gridY + 15);

  // Col 4: Carga y Peso
  const calculatedWeight = piecesList.reduce((acc: number, curr: any) => acc + (Number(curr.weightKg) || 0), 0);
  const totalWeightStr = shipment.totalWeightTons ? `${shipment.totalWeightTons} Ton` : `${(calculatedWeight / 1000).toFixed(2)} Ton`;

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 110, 125);
  doc.text('PESO & ELEMENTOS:', margin + colWidth * 3 + 4, gridY + 5.5);
  doc.setFontSize(10);
  doc.setTextColor(0, 74, 198);
  doc.text(totalWeightStr, margin + colWidth * 3 + 4, gridY + 11);
  doc.setFontSize(7.5);
  doc.setTextColor(21, 28, 39);
  doc.setFont('helvetica', 'bold');
  doc.text(`${piecesList.length} Piezas Estructurales`, margin + colWidth * 3 + 4, gridY + 16);

  // Section Title for Table
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(21, 28, 39);
  doc.text('DETALLE DE PIEZAS ESTRUCTURALES CARGADAS', margin, gridY + 28);
  doc.setFontSize(7.5);
  doc.setTextColor(0, 74, 198);
  doc.text('Inspección 100% Liberada por QC (Calidad)', pageWidth - margin, gridY + 28, { align: 'right' });

  // AutoTable
  const tableData = piecesList.map((p, index) => [
    index + 1,
    p.mark || '-',
    p.type || 'Estructural',
    p.profile || '-',
    `${p.lengthMeters || '-'} m`,
    `${p.weightKg ? p.weightKg.toLocaleString() : '-'} kg`,
  ]);

  autoTable(doc, {
    startY: gridY + 31,
    margin: { left: margin, right: margin },
    head: [['No.', 'Marca Estructural', 'Tipo', 'Perfil', 'Longitud (m)', 'Peso (kg)']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [0, 74, 198],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'left',
      cellPadding: 2.5,
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center', font: 'courier' },
      1: { cellWidth: 42, fontStyle: 'bold', font: 'courier', textColor: [0, 74, 198] },
      2: { cellWidth: 36 },
      3: { cellWidth: 40, font: 'courier' },
      4: { cellWidth: 26, halign: 'right', font: 'courier' },
      5: { cellWidth: 26, halign: 'right', font: 'courier', fontStyle: 'bold' },
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
      cellPadding: 2.2,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  // Position after table
  const finalY = (doc as any).lastAutoTable.finalY || 160;

  // Disclaimer Note Box
  const noteY = Math.min(finalY + 5, 225);
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, noteY, pageWidth - margin * 2, 13, 1.5, 1.5, 'FD');

  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('Certificación de Conformidad & Despacho:', margin + 3, noteY + 4.5);
  doc.setFont('helvetica', 'normal');
  const disclaimerText = 'Los elementos amparados en este documento han sido fabricados conforme a especificaciones técnicas aprobadas y normas AWS D1.1 / AISC 360. El Departamento de Despacho de la empresa se hace responsable del correcto estibado y traslado en flota interna hacia obra.';
  doc.text(doc.splitTextToSize(disclaimerText, pageWidth - margin * 2 - 6), margin + 3, noteY + 8.5);

  // Signatures section
  const sigY = Math.min(noteY + 20, 255);
  const sigColWidth = (pageWidth - margin * 2) / 3;

  // Signature 1: Despachador Planta
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.4);
  doc.line(margin + 5, sigY + 12, margin + sigColWidth - 5, sigY + 12);
  doc.setFontSize(7.5);
  doc.setFont('courier', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(shipment.manager || 'Carlos Gómez (Coord. Despacho)', margin + sigColWidth / 2, sigY + 10, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(21, 28, 39);
  doc.text('Dpto. de Despacho (Planta)', margin + sigColWidth / 2, sigY + 16, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('ALANZA Construcción S.A.', margin + sigColWidth / 2, sigY + 20, { align: 'center' });

  // Signature 2: Transportista
  doc.line(margin + sigColWidth + 5, sigY + 12, margin + sigColWidth * 2 - 5, sigY + 12);
  doc.setFont('courier', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(shipment.driverName || 'Roberto Mendoza', margin + sigColWidth * 1.5, sigY + 10, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(21, 28, 39);
  doc.text('Conductor / Operador Despacho', margin + sigColWidth * 1.5, sigY + 16, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(shipment.carrier || 'Flota Interna ALANZA', margin + sigColWidth * 1.5, sigY + 20, { align: 'center' });

  // Signature 3: Receptor Obra
  doc.line(margin + sigColWidth * 2 + 5, sigY + 12, margin + sigColWidth * 3 - 5, sigY + 12);
  doc.setFont('courier', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Ing. Residente de Obra', margin + sigColWidth * 2.5, sigY + 10, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(21, 28, 39);
  doc.text('Recibido Conforme (Obra)', margin + sigColWidth * 2.5, sigY + 16, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(shipment.project || 'Sitio de Obra', margin + sigColWidth * 2.5, sigY + 20, { align: 'center' });

  // Footer text
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(`Documento generado electrónicamente por Sistema de Trazabilidad ALANZA • ${new Date().toLocaleString()}`, margin, 290);
  doc.text('Página 1 de 1', pageWidth - margin, 290, { align: 'right' });

  // Save the generated PDF
  const safeId = (shipment.id || 'DESPACHO').replace(/[^a-zA-Z0-9-_]/g, '_');
  doc.save(`Manifiesto_${safeId}.pdf`);
}
