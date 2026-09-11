import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  QrCode, 
  Printer, 
  Download, 
  Copy, 
  Check, 
  Truck, 
  ExternalLink, 
  Layers, 
  ShieldCheck, 
  Calendar, 
  MapPin, 
  Info,
  FileText,
  AlertCircle
} from 'lucide-react';
import { playFeedbackSound } from '../../utils/audioFeedback';
import { findShipmentForPiece, generateQrDataUrl, getPieceQrPayload } from '../../utils/qrCodeHelper';
import { generateSinglePieceLabelPDF } from '../../utils/generatePieceLabelPdf';

export const PieceQRModal: React.FC = () => {
  const { 
    selectedPieceForQR, 
    setSelectedPieceForQR, 
    shipments, 
    setSelectedShipmentForPrint,
    setIsNewShipmentModalOpen 
  } = useApp();

  const [qrFormat, setQrFormat] = useState<'structured' | 'json' | 'url'>('structured');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);

  const piece = selectedPieceForQR;

  // Find linked shipment / pass
  const matchedShipment = piece ? findShipmentForPiece(piece, shipments) : undefined;
  const paseId = matchedShipment?.id || (piece?.refId && piece.refId.startsWith('ENV-') ? piece.refId : null);

  useEffect(() => {
    if (!piece) {
      setQrDataUrl('');
      return;
    }

    let isMounted = true;
    setIsGenerating(true);

    const payload = getPieceQrPayload(piece, matchedShipment, qrFormat);
    generateQrDataUrl(payload, { width: 380, margin: 1 })
      .then(url => {
        if (isMounted) {
          setQrDataUrl(url);
          setIsGenerating(false);
        }
      })
      .catch(err => {
        console.error('Error generating QR:', err);
        if (isMounted) setIsGenerating(false);
      });

    return () => {
      isMounted = false;
    };
  }, [piece, matchedShipment, qrFormat]);

  if (!piece) return null;

  const currentPayload = getPieceQrPayload(piece, matchedShipment, qrFormat);

  const handleCopyPayload = () => {
    playFeedbackSound('click');
    navigator.clipboard.writeText(currentPayload).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleDownloadPng = () => {
    if (!qrDataUrl) return;
    playFeedbackSound('success');
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `QR_${piece.mark}_${piece.project.replace(/\s+/g, '_')}.png`;
    link.click();
  };

  const handleDownloadPdfLabel = async () => {
    try {
      playFeedbackSound('success');
      setIsPdfLoading(true);
      await generateSinglePieceLabelPDF(piece, matchedShipment);
      setIsPdfLoading(false);
    } catch (err) {
      console.error('Error generating label PDF:', err);
      setIsPdfLoading(false);
    }
  };

  const handlePrint = () => {
    playFeedbackSound('click');
    window.print();
  };

  const handleGoToShipmentManifest = () => {
    if (matchedShipment) {
      playFeedbackSound('click');
      setSelectedPieceForQR(null);
      setSelectedShipmentForPrint(matchedShipment);
    }
  };

  return (
    <div 
      id="piece-qr-modal-overlay"
      className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static"
    >
      <div 
        id="piece-qr-modal-container"
        className="bg-white rounded-2xl max-w-3xl w-full border border-[#c3c6d7] shadow-2xl overflow-hidden flex flex-col max-h-[94vh] animate-in zoom-in-95 my-auto print:max-h-none print:shadow-none print:border-none print:w-full print:rounded-none"
      >
        {/* Header (Hidden on print) */}
        <div className="p-4 sm:p-5 border-b border-[#e2e8f8] bg-[#f8fafc] flex items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#004ac6] text-white flex items-center justify-center shadow-xs">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[16px] sm:text-[18px] text-[#151c27] font-mono">
                  Código QR: {piece.mark}
                </h3>
                {paseId ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <Truck className="w-3 h-3" /> En Pase: {paseId}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-300">
                    En Planta / Taller
                  </span>
                )}
              </div>
              <p className="text-[12px] text-[#555f6f]">
                {piece.type} • {piece.profile} • {piece.project}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playFeedbackSound('click');
              setSelectedPieceForQR(null);
            }}
            className="p-1.5 text-[#737686] hover:text-[#151c27] hover:bg-[#e2e8f8] rounded-lg transition-colors cursor-pointer"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          
          {/* REFERENCE TO PASS / SHIPMENT SECTION (HIGHLIGHTED) */}
          <div className="rounded-xl border overflow-hidden transition-all shadow-xs">
            {paseId ? (
              <div className="bg-emerald-50/70 border-emerald-300 p-4 border rounded-xl">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
                        Pieza Vinculada a Pase de Salida / Despacho
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[16px] font-mono font-bold text-emerald-950">
                          {paseId}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-200 text-emerald-900">
                          {matchedShipment?.status || 'Despachado'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {matchedShipment && (
                    <button
                      onClick={handleGoToShipmentManifest}
                      className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[12px] font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      title="Ver manifiesto y hoja de ruta de este pase"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Ver Manifiesto del Pase</span>
                    </button>
                  )}
                </div>

                {/* Shipment Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-emerald-200/80 text-[12px]">
                  <div>
                    <span className="text-emerald-800/80 text-[11px] block">Transportista:</span>
                    <span className="font-semibold text-emerald-950">
                      {matchedShipment?.carrier || 'Logística Rápida SA'}
                    </span>
                  </div>
                  <div>
                    <span className="text-emerald-800/80 text-[11px] block">Destino de Entrega:</span>
                    <span className="font-semibold text-emerald-950">
                      {matchedShipment?.destination || 'Sitio de Obra'}
                    </span>
                  </div>
                  <div>
                    <span className="text-emerald-800/80 text-[11px] block">Conductor / Placas:</span>
                    <span className="font-semibold text-emerald-950">
                      {matchedShipment?.driverName || 'Asignado'} {matchedShipment?.truckPlates ? `(${matchedShipment.truckPlates})` : ''}
                    </span>
                  </div>
                  <div>
                    <span className="text-emerald-800/80 text-[11px] block">Fecha de Salida:</span>
                    <span className="font-semibold text-emerald-950">
                      {matchedShipment?.date || 'Hoy'}
                    </span>
                  </div>
                </div>

                <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-emerald-800 bg-emerald-100/60 p-2 rounded-md">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>
                    El código QR de esta pieza incluye directamente el número de pase <strong>{paseId}</strong>. Al ser escaneada en obra por el residente o receptor, el sistema valida su ingreso contra este despacho automáticamente.
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border-slate-200 p-4 border rounded-xl">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center font-bold">
                      <Info className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                        Estado de Despacho
                      </span>
                      <span className="text-[14px] font-bold text-slate-800">
                        Pieza en Planta / Sin Pase de Salida Asignado
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      playFeedbackSound('click');
                      setSelectedPieceForQR(null);
                      setIsNewShipmentModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 bg-[#004ac6] hover:bg-[#2563eb] text-white rounded-lg text-[12px] font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Crear Pase de Salida</span>
                  </button>
                </div>
                <p className="text-[12px] text-slate-600 mt-2">
                  Esta pieza se encuentra en etapa de taller o almacenamiento. Al incorporarla a una remisión o pase de despacho, su código QR vinculará inmediatamente el número de pase para control de transporte y recepción.
                </p>
              </div>
            )}
          </div>

          {/* TWO COLUMNS: QR Visual Card (Left) & Physical Tag Blueprint Preview (Right) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Left Col: High-Res QR & Payload (5 cols) */}
            <div className="md:col-span-5 flex flex-col items-center bg-[#f8fafc] p-4 rounded-xl border border-[#c3c6d7] text-center">
              <span className="text-[12px] font-bold text-[#434655] uppercase tracking-wider mb-2">
                Código QR de Trazabilidad
              </span>

              {/* QR Image Container */}
              <div className="w-52 h-52 bg-white rounded-xl p-3 border border-slate-300 shadow-sm flex items-center justify-center relative overflow-hidden">
                {isGenerating || !qrDataUrl ? (
                  <div className="flex flex-col items-center gap-2 text-[#737686]">
                    <div className="w-8 h-8 border-2 border-[#004ac6] border-t-transparent rounded-full animate-spin" />
                    <span className="text-[11px]">Generando QR...</span>
                  </div>
                ) : (
                  <img 
                    src={qrDataUrl} 
                    alt={`Código QR ${piece.mark}`} 
                    className="w-full h-full object-contain"
                  />
                )}
              </div>

              <span className="font-mono text-[14px] font-bold text-[#151c27] mt-2">
                {piece.mark}
              </span>
              <span className="text-[11px] text-[#555f6f]">
                Escaneo 100% compatible con lectores ópticos y smartphones
              </span>

              {/* Format Switcher */}
              <div className="w-full mt-4 pt-3 border-t border-slate-200">
                <span className="text-[11px] font-semibold text-slate-600 block text-left mb-1.5">
                  Formato de codificación en el QR:
                </span>
                <div className="grid grid-cols-3 gap-1 bg-slate-200 p-1 rounded-lg text-[11px] font-semibold">
                  <button
                    onClick={() => {
                      playFeedbackSound('click');
                      setQrFormat('structured');
                    }}
                    className={`py-1 rounded cursor-pointer transition-colors ${
                      qrFormat === 'structured' ? 'bg-white text-[#004ac6] shadow-xs' : 'text-slate-600 hover:text-black'
                    }`}
                  >
                    Industrial
                  </button>
                  <button
                    onClick={() => {
                      playFeedbackSound('click');
                      setQrFormat('json');
                    }}
                    className={`py-1 rounded cursor-pointer transition-colors ${
                      qrFormat === 'json' ? 'bg-white text-[#004ac6] shadow-xs' : 'text-slate-600 hover:text-black'
                    }`}
                  >
                    JSON
                  </button>
                  <button
                    onClick={() => {
                      playFeedbackSound('click');
                      setQrFormat('url');
                    }}
                    className={`py-1 rounded cursor-pointer transition-colors ${
                      qrFormat === 'url' ? 'bg-white text-[#004ac6] shadow-xs' : 'text-slate-600 hover:text-black'
                    }`}
                  >
                    Enlace
                  </button>
                </div>
              </div>

              {/* Payload Raw Content Viewer */}
              <div className="w-full mt-2.5 text-left">
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                  <span>Contenido embebido:</span>
                  <button
                    onClick={handleCopyPayload}
                    className="text-[#004ac6] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
                <pre className="text-[10px] font-mono bg-slate-900 text-emerald-400 p-2 rounded-lg max-h-24 overflow-y-auto overflow-x-hidden break-all whitespace-pre-wrap">
                  {currentPayload}
                </pre>
              </div>
            </div>

            {/* Right Col: Physical Industrial Label Preview (7 cols) */}
            <div className="md:col-span-7 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] font-bold text-[#434655] uppercase tracking-wider">
                    Vista Previa: Etiqueta de Taller y Montaje (4"×6")
                  </span>
                  <span className="text-[11px] text-[#555f6f]">
                    Norma AISC & AWS
                  </span>
                </div>

                {/* Printable Label Container */}
                <div 
                  id="printable-physical-label"
                  className="bg-white border-2 border-slate-800 rounded-xl p-4 shadow-md text-slate-900 space-y-3 relative print:border-black print:p-6"
                >
                  {/* Label Header */}
                  <div className="bg-[#004ac6] -mx-4 -mt-4 p-2.5 text-white flex items-center justify-between px-4 print:bg-black">
                    <div>
                      <div className="font-bold text-[12px] tracking-wide">ALANZA CONSTRUCCIÓN & ESTRUCTURAS</div>
                      <div className="text-[9px] text-blue-100 print:text-gray-300">CONTROL DE PRODUCCIÓN Y MONTAJE</div>
                    </div>
                    <div className="text-right text-[10px] font-mono">
                      {piece.workOrder || 'OT-2026-084'}
                    </div>
                  </div>

                  {/* Mark & Profile Big Banner */}
                  <div className="bg-[#f0f4ff] border border-[#004ac6] p-2.5 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-bold uppercase text-[#555f6f] block">Marca de Montaje</span>
                      <span className="text-[22px] font-mono font-black text-[#151c27] tracking-tight">
                        {piece.mark}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[12px] font-bold text-[#004ac6] block">{piece.type}</span>
                      <span className="text-[13px] font-mono font-bold text-slate-800">{piece.profile}</span>
                    </div>
                  </div>

                  {/* Specifications Grid */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] border-b border-slate-200 pb-2.5">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Proyecto:</span>
                      <span className="font-bold text-slate-900 truncate block">{piece.project}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Longitud / Dimensiones:</span>
                      <span className="font-bold text-slate-900 font-mono">
                        {piece.dimensions || `${piece.lengthMeters.toFixed(2)} m`}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Peso Unitario:</span>
                      <span className="font-bold text-slate-900 font-mono">{piece.weightKg} kg</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Calidad Acero:</span>
                      <span className="font-bold text-slate-900">{piece.steelGrade || 'ASTM A992 Gr 50'}</span>
                    </div>
                  </div>

                  {/* QC & Pass Status inside label */}
                  <div className="flex items-center justify-between text-[11px] pt-0.5">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Control de Calidad:</span>
                      <span className={`font-bold inline-flex items-center gap-1 ${
                        piece.qcStatus === 'Aprobada' ? 'text-emerald-700' : 'text-amber-700'
                      }`}>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {piece.qcStatus}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-slate-500 block text-[10px]">Pase de Salida:</span>
                      {paseId ? (
                        <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded text-[11px]">
                          {paseId}
                        </span>
                      ) : (
                        <span className="font-semibold text-slate-500 text-[11px]">
                          EN PLANTA
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Micro Footer inside label */}
                  <div className="pt-2 border-t border-dashed border-slate-300 flex justify-between items-center text-[9px] text-slate-400 font-mono">
                    <span>ID: {piece.id}</span>
                    <span>FECHA: {piece.fabricationDate || '30/08/2026'}</span>
                    <span>NO REMOVER HASTA MONTAJE</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 print:hidden">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[12px] font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  title="Imprimir etiqueta en impresora térmica o láser"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir Etiqueta</span>
                </button>

                <button
                  onClick={handleDownloadPdfLabel}
                  disabled={isPdfLoading}
                  className="px-4 py-2.5 bg-[#004ac6] hover:bg-[#2563eb] text-white rounded-xl text-[12px] font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  title="Descargar archivo PDF listo para impresión 4x6"
                >
                  <Download className="w-4 h-4" />
                  <span>{isPdfLoading ? 'Generando...' : 'Descargar PDF'}</span>
                </button>

                <button
                  onClick={handleDownloadPng}
                  className="px-3.5 py-2.5 bg-white border border-[#c3c6d7] hover:bg-[#f0f3ff] text-[#151c27] rounded-xl text-[12px] font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  title="Descargar imagen PNG del código QR"
                >
                  <QrCode className="w-4 h-4 text-[#004ac6]" />
                  <span>Guardar PNG</span>
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Footer info (Hidden on print) */}
        <div className="p-3.5 px-6 border-t border-[#e2e8f8] bg-[#f8fafc] flex flex-wrap items-center justify-between text-[11px] text-[#737686] gap-2 print:hidden">
          <span>
            Identificador único: <strong className="font-mono text-[#151c27]">{piece.id}</strong> | Proyecto: <strong className="text-[#151c27]">{piece.project}</strong>
          </span>
          <button
            onClick={() => setSelectedPieceForQR(null)}
            className="px-4 py-1.5 bg-white border border-[#c3c6d7] hover:bg-[#f0f3ff] text-[#151c27] rounded-lg font-semibold cursor-pointer transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
