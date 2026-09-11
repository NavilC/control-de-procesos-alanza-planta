import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  QrCode, 
  Printer, 
  Download, 
  Truck, 
  Check, 
  Layers, 
  ShieldCheck, 
  Filter,
  Eye
} from 'lucide-react';
import { playFeedbackSound } from '../../utils/audioFeedback';
import { findShipmentForPiece, generateQrDataUrl, getPieceQrPayload } from '../../utils/qrCodeHelper';
import { generateBatchPieceLabelsPDF } from '../../utils/generatePieceLabelPdf';
import { Piece } from '../../types';

export const BatchPieceQRLabelsModal: React.FC = () => {
  const { 
    selectedPiecesForBatchQR, 
    setSelectedPiecesForBatchQR, 
    setSelectedPieceForQR, 
    shipments 
  } = useApp();

  const [qrMap, setQrMap] = useState<Record<string, string>>({});
  const [filterPase, setFilterPase] = useState<'all' | 'with-pass' | 'without-pass'>('all');
  const [isPdfLoading, setIsPdfLoading] = useState(false);

  const pieces = selectedPiecesForBatchQR || [];

  // Generate QR codes for all pieces in batch
  useEffect(() => {
    if (pieces.length === 0) return;

    let isMounted = true;
    const generateAll = async () => {
      const map: Record<string, string> = {};
      for (const p of pieces) {
        const shipment = findShipmentForPiece(p, shipments);
        const payload = getPieceQrPayload(p, shipment, 'structured');
        try {
          const url = await generateQrDataUrl(payload, { width: 160, margin: 1 });
          map[p.id] = url;
        } catch (e) {
          console.error('Error generating QR in batch:', e);
        }
      }
      if (isMounted) {
        setQrMap(map);
      }
    };

    generateAll();

    return () => {
      isMounted = false;
    };
  }, [pieces, shipments]);

  if (!selectedPiecesForBatchQR || selectedPiecesForBatchQR.length === 0) return null;

  const filteredPieces = pieces.filter(p => {
    const shipment = findShipmentForPiece(p, shipments);
    const hasPase = Boolean(shipment?.id || (p.refId && p.refId.startsWith('ENV-')));
    if (filterPase === 'with-pass') return hasPase;
    if (filterPase === 'without-pass') return !hasPase;
    return true;
  });

  const handleDownloadBatchPdf = async () => {
    try {
      playFeedbackSound('success');
      setIsPdfLoading(true);
      await generateBatchPieceLabelsPDF(filteredPieces, shipments);
      setIsPdfLoading(false);
    } catch (e) {
      console.error('Error downloading batch PDF:', e);
      setIsPdfLoading(false);
    }
  };

  const handlePrint = () => {
    playFeedbackSound('click');
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-2xl max-w-5xl w-full border border-[#c3c6d7] shadow-2xl overflow-hidden flex flex-col max-h-[94vh] animate-in zoom-in-95 my-auto print:max-h-none print:shadow-none print:border-none print:w-full print:rounded-none">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#e2e8f8] bg-[#f8fafc] flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#004ac6] text-white flex items-center justify-center shadow-xs">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[18px] text-[#151c27]">
                Lote de Etiquetas QR ({pieces.length} Piezas)
              </h3>
              <p className="text-[12px] text-[#555f6f]">
                Previsualización e impresión masiva de etiquetas de taller con referencia a pases de salida
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[12px] font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Todas</span>
            </button>

            <button
              onClick={handleDownloadBatchPdf}
              disabled={isPdfLoading}
              className="px-3.5 py-2 bg-[#004ac6] hover:bg-[#2563eb] text-white rounded-xl text-[12px] font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isPdfLoading ? 'Generando PDF...' : 'Descargar PDF (4x6")'}</span>
            </button>

            <button
              onClick={() => {
                playFeedbackSound('click');
                setSelectedPiecesForBatchQR(null);
              }}
              className="p-1.5 text-[#737686] hover:text-[#151c27] hover:bg-[#e2e8f8] rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-3 px-6 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[12px] print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filtrar por Pase:
            </span>
            <button
              onClick={() => setFilterPase('all')}
              className={`px-2.5 py-1 rounded-md cursor-pointer font-medium transition-colors ${
                filterPase === 'all' ? 'bg-[#004ac6] text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Todas ({pieces.length})
            </button>
            <button
              onClick={() => setFilterPase('with-pass')}
              className={`px-2.5 py-1 rounded-md cursor-pointer font-medium transition-colors ${
                filterPase === 'with-pass' ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-200'
              }`}
            >
              Con Pase Activo
            </button>
            <button
              onClick={() => setFilterPase('without-pass')}
              className={`px-2.5 py-1 rounded-md cursor-pointer font-medium transition-colors ${
                filterPase === 'without-pass' ? 'bg-slate-700 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Sin Pase (En Taller)
            </button>
          </div>

          <span className="text-slate-500">
            Mostrando {filteredPieces.length} de {pieces.length} piezas seleccionadas
          </span>
        </div>

        {/* Grid of Labels */}
        <div className="p-4 sm:p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPieces.map((p) => {
              const shipment = findShipmentForPiece(p, shipments);
              const paseId = shipment?.id || (p.refId && p.refId.startsWith('ENV-') ? p.refId : null);
              const qrUrl = qrMap[p.id];

              return (
                <div 
                  key={p.id}
                  className="bg-white border-2 border-slate-800 rounded-xl p-3.5 flex flex-col justify-between space-y-2.5 shadow-sm hover:border-[#004ac6] transition-all relative group"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                    <div>
                      <span className="font-mono font-black text-[18px] text-[#151c27] block leading-tight">
                        {p.mark}
                      </span>
                      <span className="text-[11px] font-bold text-[#004ac6]">
                        {p.type} • {p.profile}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        playFeedbackSound('click');
                        setSelectedPieceForQR(p);
                      }}
                      className="p-1 text-[#004ac6] hover:bg-blue-50 rounded-md transition-colors"
                      title="Ver etiqueta individual completa"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Center: QR Image + Specs */}
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-24 shrink-0 bg-white p-1 rounded-lg border border-slate-300 flex items-center justify-center">
                      {qrUrl ? (
                        <img src={qrUrl} alt={p.mark} className="w-full h-full object-contain" />
                      ) : (
                        <div className="w-5 h-5 border-2 border-[#004ac6] border-t-transparent rounded-full animate-spin" />
                      )}
                    </div>

                    <div className="space-y-1 text-[11px] text-slate-700 flex-1">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Proyecto:</span>
                        <span className="font-medium text-slate-900 truncate block">{p.project}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Dim / Peso:</span>
                        <span className="font-bold text-slate-900 font-mono">
                          {p.lengthMeters.toFixed(2)}m • {p.weightKg}kg
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">QC:</span>
                        <span className={`font-bold ${p.qcStatus === 'Aprobada' ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {p.qcStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pass Reference Bar */}
                  <div className={`p-1.5 px-2 rounded-lg text-[11px] font-semibold flex items-center justify-between ${
                    paseId 
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                      : 'bg-slate-50 text-slate-600 border border-slate-200'
                  }`}>
                    <div className="flex items-center gap-1.5 truncate">
                      <Truck className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">
                        {paseId ? `Pase: ${paseId}` : 'Sin pase (En Taller)'}
                      </span>
                    </div>
                    {shipment?.destination && (
                      <span className="text-[10px] text-emerald-700 font-normal truncate max-w-[100px]">
                        {shipment.destination}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 px-6 border-t border-[#e2e8f8] bg-[#f8fafc] flex justify-between items-center text-[12px] text-slate-600 print:hidden">
          <span>ALANZA ESTRUCTURAS - Módulo de Identificación y Trazabilidad QR</span>
          <button
            onClick={() => setSelectedPiecesForBatchQR(null)}
            className="px-4 py-1.5 bg-white border border-[#c3c6d7] hover:bg-[#f0f3ff] text-[#151c27] rounded-lg font-semibold cursor-pointer transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
