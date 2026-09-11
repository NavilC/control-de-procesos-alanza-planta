import jsPDF from 'jspdf';
import { Piece, Shipment } from '../types';
import { generateQrDataUrl, getPieceQrPayload } from './qrCodeHelper';

/**
 * Generates an industrial technical label PDF (standard 4x6" / 100x150mm size) with QR code.
 */
export async function generateSinglePieceLabelPDF(
  piece: Piece,
  shipment?: Shipment | null
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [100, 150], // 100mm x 150mm standard industrial label
  });

  const qrText = getPieceQrPayload(piece, shipment, 'structured');
  const qrDataUrl = await generateQrDataUrl(qrText, { width: 350, margin: 1 });

  renderLabelOnPage(doc, piece, shipment, qrDataUrl);

  const cleanMark = piece.mark.replace(/[^a-zA-Z0-9-_]/g, '_');
  doc.save(`Etiqueta_QR_${cleanMark}_${piece.project.replace(/\s+/g, '_')}.pdf`);
}

/**
 * Generates a batch PDF containing labels for multiple pieces (one label per page).
 */
export async function generateBatchPieceLabelsPDF(
  pieces: Piece[],
  shipments: Shipment[]
) {
  if (pieces.length === 0) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [100, 150],
  });

  for (let i = 0; i < pieces.length; i++) {
    const piece = pieces[i];
    if (i > 0) {
      doc.addPage([100, 150], 'portrait');
    }

    const matchedShipment = shipments.find(s => 
      (piece.refId && piece.refId !== '-' && s.id === piece.refId) ||
      (s.pieces && s.pieces.includes(piece.mark))
    );

    const qrText = getPieceQrPayload(piece, matchedShipment, 'structured');
    const qrDataUrl = await generateQrDataUrl(qrText, { width: 300, margin: 1 });

    renderLabelOnPage(doc, piece, matchedShipment, qrDataUrl);
  }

  doc.save(`Lote_Etiquetas_QR_${pieces.length}_piezas.pdf`);
}

function renderLabelOnPage(
  doc: jsPDF,
  piece: Piece,
  shipment: Shipment | undefined | null,
  qrDataUrl: string
) {
  const width = 100;
  const height = 150;
  const margin = 5;

  // Outer border
  doc.setDrawColor(21, 28, 39);
  doc.setLineWidth(0.8);
  doc.rect(margin, margin, width - margin * 2, height - margin * 2);

  // Top header banner
  doc.setFillColor(0, 74, 198); // #004ac6
  doc.rect(margin, margin, width - margin * 2, 14, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('ALANZA ESTRUCTURAS S.A.', width / 2, margin + 6, { align: 'center' });

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.text('ETIQUETA TÉCNICA DE IDENTIFICACIÓN Y TRAZABILIDAD', width / 2, margin + 10.5, { align: 'center' });

  // Piece Mark Highlight Box
  doc.setFillColor(240, 244, 255);
  doc.setDrawColor(0, 74, 198);
  doc.setLineWidth(0.5);
  doc.rect(margin + 2, margin + 16, width - (margin + 2) * 2, 18, 'FD');

  doc.setTextColor(85, 95, 111);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.text('MARCA PRINCIPAL DE MONTAJE (PIECE MARK)', margin + 5, margin + 21);

  doc.setTextColor(21, 28, 39);
  doc.setFont('courier', 'bold');
  doc.setFontSize(18);
  doc.text(piece.mark, margin + 5, margin + 30);

  // Type & Profile Badge (top right of mark box)
  doc.setTextColor(0, 74, 198);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(piece.type.toUpperCase(), width - margin - 5, margin + 21, { align: 'right' });
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(9);
  doc.text(piece.profile, width - margin - 5, margin + 28, { align: 'right' });

  // Center Row: Technical Details (Left) + QR Code (Right)
  const qrSize = 36;
  const qrX = width - margin - 3 - qrSize;
  const qrY = margin + 36;

  // Render QR Code Image
  doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

  // QR Code Frame
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);
  doc.rect(qrX, qrY, qrSize, qrSize);

  doc.setTextColor(85, 95, 111);
  doc.setFontSize(5.5);
  doc.setFont('helvetica', 'normal');
  doc.text('ESCANEAR PARA TRAZABILIDAD', qrX + qrSize / 2, qrY + qrSize + 3.5, { align: 'center' });

  // Left Details Column
  const colX = margin + 3;
  let curY = margin + 41;
  const lineSpacing = 6.2;

  const renderField = (label: string, value: string) => {
    doc.setTextColor(115, 118, 134);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text(label + ':', colX, curY);

    doc.setTextColor(21, 28, 39);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(value, colX + 24, curY);
    curY += lineSpacing;
  };

  renderField('Proyecto', piece.project.length > 18 ? piece.project.substring(0, 17) + '...' : piece.project);
  renderField('Dimensiones', piece.dimensions || `${piece.lengthMeters.toFixed(2)} m`);
  renderField('Peso Unitario', `${piece.weightKg} kg`);
  renderField('Grado Acero', piece.steelGrade || 'ASTM A992 Gr 50');
  
  // QC Status Stamp
  doc.setTextColor(115, 118, 134);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text('Dictamen QC:', colX, curY);

  const isQcApproved = piece.qcStatus === 'Aprobada';
  doc.setTextColor(isQcApproved ? 16 : 180, isQcApproved ? 120 : 60, 40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(piece.qcStatus.toUpperCase(), colX + 24, curY);
  curY += lineSpacing + 1;

  // PASS / PASE DE SALIDA REFERENCE SECTION (CRITICAL)
  const paseY = margin + 80;
  const paseBoxHeight = 35;
  const paseId = shipment?.id || (piece.refId && piece.refId.startsWith('ENV-') ? piece.refId : null);

  if (paseId) {
    // Piece IS IN A PASS (Pase de Salida)
    doc.setFillColor(236, 253, 245); // Light emerald/mint
    doc.setDrawColor(16, 185, 129); // Emerald 500
    doc.setLineWidth(0.6);
    doc.roundedRect(margin + 2, paseY, width - (margin + 2) * 2, paseBoxHeight, 2, 2, 'FD');

    // Header of Pass Box
    doc.setFillColor(16, 185, 129);
    doc.roundedRect(margin + 2, paseY, width - (margin + 2) * 2, 7.5, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text('REFERENCIA A PASE DE SALIDA / DESPACHO ACTIVO', width / 2, paseY + 5, { align: 'center' });

    // Pass details
    doc.setTextColor(6, 78, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text('No. PASE DE SALIDA:', margin + 5, paseY + 13);
    doc.setFont('courier', 'bold');
    doc.setFontSize(10.5);
    doc.text(paseId, margin + 35, paseY + 13.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(50, 60, 70);

    const carrier = shipment?.carrier || 'Logística Rápida SA';
    doc.text(`Transportista: ${carrier}`, margin + 5, paseY + 19);

    const destination = shipment?.destination || 'Sitio de Obra';
    doc.text(`Destino: ${destination}`, margin + 5, paseY + 24);

    const shipStatus = shipment?.status || 'En tránsito';
    const driver = shipment?.driverName ? ` • Conductor: ${shipment.driverName}` : '';
    doc.text(`Estado Envío: ${shipStatus}${driver}`, margin + 5, paseY + 29);

    // Verified Pass Badge
    doc.setTextColor(16, 185, 129);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text('✓ EN PASE', width - margin - 5, paseY + 13, { align: 'right' });
  } else {
    // Piece is NOT in a pass (in shop / plant)
    doc.setFillColor(248, 250, 252); // Slate-50
    doc.setDrawColor(203, 213, 225); // Slate-300
    doc.setLineWidth(0.5);
    doc.roundedRect(margin + 2, paseY, width - (margin + 2) * 2, paseBoxHeight, 2, 2, 'FD');

    doc.setFillColor(226, 232, 240);
    doc.roundedRect(margin + 2, paseY, width - (margin + 2) * 2, 7.5, 2, 2, 'F');
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text('ESTADO DE DESPACHO / PASE DE SALIDA', width / 2, paseY + 5, { align: 'center' });

    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('SIN PASE DE SALIDA ASIGNADO', width / 2, paseY + 16, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text('Pieza ubicada físicamente en Planta / Taller de Fabricación.', width / 2, paseY + 22, { align: 'center' });
    doc.text('Al asignar esta pieza a un manifiesto o remisión de envío,', width / 2, paseY + 26.5, { align: 'center' });
    doc.text('su código QR reflejará automáticamente el número de pase correspondiente.', width / 2, paseY + 30.5, { align: 'center' });
  }

  // Footer section: Fabrication Date, Operator, Warning
  const footerY = height - margin - 15;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(margin + 2, footerY, width - margin - 2, footerY);

  doc.setTextColor(115, 118, 134);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.text(`Fecha Fab: ${piece.fabricationDate || '30/08/2026'}`, margin + 4, footerY + 5);
  doc.text(`ID Registro: ${piece.id}`, margin + 4, footerY + 9);
  doc.text(`OT / Orden: ${piece.workOrder || 'OT-2026-084'}`, margin + 4, footerY + 13);

  doc.text('AISC / AWS D1.1', width - margin - 4, footerY + 5, { align: 'right' });
  doc.text('INSPECCIÓN RIGUROSA', width - margin - 4, footerY + 9, { align: 'right' });
  doc.text('NO RETIRAR ETIQUETA EN OBRA', width - margin - 4, footerY + 13, { align: 'right' });
}
