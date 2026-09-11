import QRCode from 'qrcode';
import { Piece, Shipment } from '../types';

export interface PieceQrInfo {
  structured: string;
  json: string;
  url: string;
}

/**
 * Finds the shipment (Pase de Salida) associated with a given piece.
 */
export function findShipmentForPiece(piece: Piece, shipments: Shipment[]): Shipment | undefined {
  if (!piece) return undefined;
  return shipments.find(s => {
    // Check if shipment ID matches refId
    if (piece.refId && piece.refId !== '-' && s.id === piece.refId) {
      return true;
    }
    // Check if piece mark is listed in shipment pieces
    if (s.pieces && s.pieces.includes(piece.mark)) {
      return true;
    }
    return false;
  });
}

/**
 * Formats QR payload strings for a piece, including its shipment reference if active.
 */
export function getPieceQrPayload(
  piece: Piece,
  shipment?: Shipment | null,
  format: 'structured' | 'json' | 'url' = 'structured'
): string {
  const paseId = shipment?.id || (piece.refId && piece.refId.startsWith('ENV-') ? piece.refId : null);
  const paseStatus = shipment?.status || (paseId ? 'Asignado a Despacho' : 'Sin Pase (En Planta)');
  const carrier = shipment?.carrier || '';
  const destination = shipment?.destination || '';

  if (format === 'json') {
    return JSON.stringify({
      app: 'ALANZA_ESTRUCTURAS',
      tipo: 'PIEZA_ESTRUCTURAL',
      marca: piece.mark,
      id: piece.id,
      proyecto: piece.project,
      tipoElemento: piece.type,
      perfil: piece.profile,
      longitudMts: piece.lengthMeters,
      pesoKg: piece.weightKg,
      gradoAcero: piece.steelGrade || 'ASTM A992 Gr 50',
      estadoQC: piece.qcStatus,
      estadoFabricacion: piece.status,
      // Información del Pase de Salida / Despacho
      enPase: Boolean(paseId),
      paseId: paseId || 'NINGUNO',
      paseEstado: paseStatus,
      despachoUnidad: carrier || 'Transporte ALANZA',
      despachoDpto: 'Dpto. de Despacho ALANZA',
      destino: destination || 'En Planta',
      fechaActualizacion: new Date().toISOString()
    }, null, 2);
  }

  if (format === 'url') {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://alanza-control.app';
    const params = new URLSearchParams();
    params.set('marca', piece.mark);
    params.set('proy', piece.project);
    if (paseId) params.set('pase', paseId);
    return `${baseUrl}/#piezas?${params.toString()}`;
  }

  // Industrial high-density compact format (fast to read by industrial 2D optical scanners)
  const parts: string[] = [
    `ALANZA`,
    `MK:${piece.mark}`,
    `PRJ:${piece.project}`,
    `PRF:${piece.profile}`,
    `DIM:${piece.lengthMeters}m`,
    `W:${piece.weightKg}kg`,
    `QC:${piece.qcStatus}`
  ];

  if (paseId) {
    parts.push(`PASE:${paseId}`);
    if (carrier) parts.push(`TR:${carrier}`);
  } else {
    parts.push(`PASE:SIN_PASE`);
  }

  return parts.join('|');
}

/**
 * Generates a base64 Data URL for a QR code using QRCode library.
 */
export async function generateQrDataUrl(
  text: string,
  options?: QRCode.QRCodeToDataURLOptions
): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      margin: 1.5,
      width: 400,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
      ...options,
    });
  } catch (err) {
    console.error('Error generating QR code data URL:', err);
    throw err;
  }
}

/**
 * Parses scanned QR text to detect piece mark and shipment/pass reference.
 */
export function parseScannedQr(rawText: string): {
  mark: string;
  shipmentId?: string;
  project?: string;
  isStructured: boolean;
} {
  const trimmed = rawText.trim();

  // Check JSON format
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed);
      return {
        mark: parsed.marca || parsed.mark || '',
        shipmentId: parsed.paseId && parsed.paseId !== 'NINGUNO' ? parsed.paseId : undefined,
        project: parsed.proyecto || parsed.project,
        isStructured: true
      };
    } catch {
      // Fallthrough
    }
  }

  // Check pipe-delimited industrial format
  if (trimmed.includes('|')) {
    const tokens = trimmed.split('|');
    let mark = '';
    let shipmentId: string | undefined;
    let project: string | undefined;

    for (const token of tokens) {
      const [key, val] = token.split(':');
      if (!val) continue;
      if (key === 'MK' || key === 'MARCA') mark = val;
      if (key === 'PASE' && val !== 'SIN_PASE') shipmentId = val;
      if (key === 'PRJ' || key === 'PROY') project = val;
    }

    if (mark) {
      return { mark, shipmentId, project, isStructured: true };
    }
  }

  // Plain string (e.g. directly entered piece mark)
  return {
    mark: trimmed,
    isStructured: false
  };
}
