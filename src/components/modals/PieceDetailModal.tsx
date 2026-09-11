import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Layers, ShieldCheck, Scale, QrCode, FileText, Download, Edit3, History, CheckCircle2, Scissors, Truck, ExternalLink } from 'lucide-react';
import { findShipmentForPiece, generateQrDataUrl, getPieceQrPayload } from '../../utils/qrCodeHelper';
import { playFeedbackSound } from '../../utils/audioFeedback';

export const PieceDetailModal: React.FC = () => {
  const { 
    selectedPieceForDetail, 
    setSelectedPieceForDetail, 
    setSelectedPieceForTraceability,
    setSelectedPieceForEdit,
    setIsEditPieceModalOpen,
    setSelectedPieceForHistoryModal,
    setSelectedPieceForQR,
    shipments,
    setSelectedShipmentForPrint,
    setIsNewShipmentModalOpen
  } = useApp();

  const [qrUrl, setQrUrl] = useState<string>('');

  const p = selectedPieceForDetail;
  const matchedShipment = p ? findShipmentForPiece(p, shipments) : undefined;
  const paseId = matchedShipment?.id || (p?.refId && p.refId.startsWith('ENV-') ? p.refId : null);

  useEffect(() => {
    if (!p) {
      setQrUrl('');
      return;
    }
    let isMounted = true;
    const payload = getPieceQrPayload(p, matchedShipment, 'structured');
    generateQrDataUrl(payload, { width: 200, margin: 1 })
      .then(url => {
        if (isMounted) setQrUrl(url);
      })
      .catch(err => {
        console.error('Error generating piece QR:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [p, matchedShipment]);

  if (!selectedPieceForDetail) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#c3c6d7] shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh] sm:max-h-[85vh]">
        {/* Modal Header (Fixed at top) */}
        <div className="p-4 sm:p-5 border-b border-[#e2e8f8] bg-[#f9fafb] flex justify-between items-start shrink-0">
          <div>
            <span className="text-[11px] font-mono font-bold text-[#004ac6] uppercase tracking-wider">
              Ficha Técnica Estructural
            </span>
            <div className="flex items-center gap-2 flex-wrap mt-0.5">
              <h3 className="text-[18px] sm:text-[20px] font-bold text-[#151c27]">
                Marca {p.mark} ({p.profile})
              </h3>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                p.status === 'Recibida' ? 'bg-emerald-100 text-emerald-800' :
                p.status === 'Enviada' ? 'bg-orange-100 text-orange-800' :
                p.status === 'Incidencia' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {p.status}
              </span>
              {p.modificationHistory && p.modificationHistory.length > 0 && (
                <button
                  onClick={() => {
                    const target = p;
                    setSelectedPieceForDetail(null);
                    setSelectedPieceForHistoryModal(target);
                  }}
                  className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  title="Ver historial de cambios"
                >
                  <History className="w-3 h-3 text-amber-700" />
                  <span>{p.modificationHistory.length} cambios</span>
                </button>
              )}
            </div>
            <p className="text-[12px] text-[#555f6f] mt-0.5">
              {p.type} • Proyecto: <strong className="text-[#151c27]">{p.project}</strong>
              {p.description && ` • ${p.description}`}
            </p>
          </div>
          <button
            onClick={() => setSelectedPieceForDetail(null)}
            className="text-[#737686] hover:text-[#151c27] p-1.5 rounded-lg hover:bg-[#e2e8f8] transition-colors cursor-pointer"
            title="Cerrar ficha"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1">

        {/* Blueprint / Drawing Schematic placeholder */}
        <div className="bg-slate-900 rounded-xl p-4 sm:p-5 flex items-center justify-between text-white border border-slate-700 relative overflow-hidden gap-4">
          <div className="space-y-1 relative z-10">
            <span className="text-[11px] text-blue-400 font-mono">PLANO DE MONTAJE: DWG-STR-{p.mark}-01</span>
            <div className="text-[17px] font-bold font-mono text-white">{p.type.toUpperCase()} • {p.profile}</div>
            <div className="text-[12px] text-slate-300 font-mono">Longitud: {p.lengthMeters} m | Peso: {p.weightKg} kg</div>
            <div className="text-[11px] text-slate-400 pt-1">
              Haz clic en el código QR para ver e imprimir la etiqueta física completa.
            </div>
          </div>

          <button
            onClick={() => {
              playFeedbackSound('click');
              const target = p;
              setSelectedPieceForDetail(null);
              setSelectedPieceForQR(target);
            }}
            className="p-2 bg-white rounded-xl shadow-md hover:ring-2 hover:ring-[#004ac6] transition-all cursor-pointer shrink-0 flex flex-col items-center gap-1 group"
            title="Clic para ver / imprimir etiqueta QR ampliada"
          >
            {qrUrl ? (
              <img src={qrUrl} alt={`QR ${p.mark}`} className="w-16 h-16 object-contain" />
            ) : (
              <QrCode className="w-16 h-16 text-slate-900" />
            )}
            <span className="text-[9px] font-bold text-[#004ac6] group-hover:underline">
              Ver Etiqueta
            </span>
          </button>
        </div>

        {/* Reference to Pass / Pase de Salida Section */}
        {paseId ? (
          <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 sm:p-3.5 flex flex-wrap items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider block">
                  Asignada a Pase de Salida / Despacho
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[15px] text-emerald-950">
                    {paseId}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.2 rounded-full">
                    {matchedShipment?.status || 'Despachado'}
                  </span>
                </div>
                {matchedShipment && (
                  <span className="text-[11px] text-emerald-700 block mt-0.5">
                    {matchedShipment.carrier} • {matchedShipment.destination}
                  </span>
                )}
              </div>
            </div>

            {matchedShipment && (
              <button
                onClick={() => {
                  playFeedbackSound('click');
                  const ship = matchedShipment;
                  setSelectedPieceForDetail(null);
                  setSelectedShipmentForPrint(ship);
                }}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Ver Manifiesto del Pase</span>
              </button>
            )}
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500 block">
                  Estado de Pase de Salida
                </span>
                <span className="text-[12px] font-semibold text-slate-700">
                  Pieza en Planta / Sin Pase de Salida Asignado
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                playFeedbackSound('click');
                setSelectedPieceForDetail(null);
                setIsNewShipmentModalOpen(true);
              }}
              className="px-3 py-1 bg-[#004ac6] hover:bg-[#2563eb] text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Asignar a Envío</span>
            </button>
          </div>
        )}

        {/* Technical Attributes Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[12px]">
          <div className="p-2.5 bg-[#f0f3ff] rounded-lg">
            <span className="text-[#555f6f] block">Proyecto</span>
            <span className="font-semibold text-[#151c27]">{p.project}</span>
          </div>
          <div className="p-2.5 bg-[#f0f3ff] rounded-lg">
            <span className="text-[#555f6f] block">Tipo de Elemento</span>
            <span className="font-semibold text-[#004ac6]">{p.type}</span>
          </div>
          <div className="p-2.5 bg-[#f0f3ff] rounded-lg">
            <span className="text-[#555f6f] block">Grado de Acero</span>
            <span className="font-semibold text-[#151c27]">{p.steelGrade || 'ASTM A992 Gr 50'}</span>
          </div>
          <div className="p-2.5 bg-[#f0f3ff] rounded-lg">
            <span className="text-[#555f6f] block">Dimensiones / Longitud</span>
            <span className="font-semibold text-[#151c27] font-mono">
              {p.dimensions || (p.type === 'Pernos' && p.boltLengthMm ? `${p.boltLengthMm} mm` : `${p.lengthMeters} m`)}
            </span>
          </div>
          <div className="p-2.5 bg-[#f0f3ff] rounded-lg">
            <span className="text-[#555f6f] block">Estado QC</span>
            <span className="font-semibold text-emerald-700">{p.qcStatus}</span>
          </div>
          <div className="p-2.5 bg-[#f0f3ff] rounded-lg">
            <span className="text-[#555f6f] block">Estado Actual</span>
            <span className="font-semibold text-[#004ac6]">{p.status}</span>
          </div>
        </div>

        {/* Mediciones Físicas de Inspección QC si existen */}
        {(p.measuredLengthMeters !== undefined || p.paintAverageMils !== undefined || (p.paintSamples && p.paintSamples.length > 0)) && (
          <div className="border border-emerald-200 bg-emerald-50/50 rounded-xl p-3.5 space-y-2 text-[12px]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mediciones Físicas de Inspección QC</span>
              </span>
              <span className="text-[10px] text-emerald-800 bg-white px-2 py-0.5 rounded-full border border-emerald-200 font-semibold">
                Inspector: {p.inspector || 'Control Calidad'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {p.measuredLengthMeters !== undefined && (
                <div className="bg-white p-2.5 rounded-lg border border-emerald-200">
                  <span className="text-[10px] text-[#555f6f] block uppercase font-bold">Control Dimensional Longitud</span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="font-mono font-bold text-[#151c27] text-[14px]">
                      {p.measuredLengthMeters.toFixed(3)} m
                    </span>
                    {p.lengthDeviationMm !== undefined && (
                      <span className={`text-[11px] font-mono font-semibold px-1.5 py-0.2 rounded ${
                        Math.abs(p.lengthDeviationMm) <= 6.4 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        Δ {p.lengthDeviationMm > 0 ? '+' : ''}{p.lengthDeviationMm} mm
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-[#737686] block mt-0.5">
                    Plano teórico: {p.lengthMeters ? `${p.lengthMeters.toFixed(3)} m` : '-'}
                  </span>
                </div>
              )}

              {(p.paintAverageMils !== undefined || (p.paintSamples && p.paintSamples.length > 0)) && (
                <div className="bg-white p-2.5 rounded-lg border border-purple-200">
                  <span className="text-[10px] text-purple-900 block uppercase font-bold">Espesor de Pintura (EPS / DFT)</span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="font-mono font-bold text-purple-900 text-[14px]">
                      {p.paintAverageMils !== undefined ? `${p.paintAverageMils.toFixed(2)} ${p.paintUnit || 'mils'}` : '-'}
                    </span>
                    <span className="text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded font-semibold">
                      Promedio 4 muestras
                    </span>
                  </div>
                  {p.paintSamples && p.paintSamples.length > 0 && (
                    <div className="text-[10px] font-mono text-[#555f6f] mt-0.5 flex gap-1.5 flex-wrap">
                      {p.paintSamples.map((s, i) => (
                        <span key={i} className="bg-slate-100 px-1 rounded">
                          M{i+1}: {s ?? '-'}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cortes registrados de la Pieza */}
        {(p.hasCuts || (p.cuts && p.cuts.length > 0)) && (
          <div className="border border-amber-200 bg-amber-50/50 rounded-xl p-3.5 space-y-2 text-[12px]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5 text-amber-600" />
                <span>Pieza con Corte Registrado</span>
              </span>
              <span className="text-[10px] text-amber-800 bg-white px-2 py-0.5 rounded-full border border-amber-200 font-semibold">
                {p.cuts && p.cuts.length > 0 ? `${p.cuts.length} corte(s)` : '1 corte activo'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {p.cuts && p.cuts.length > 0 ? (
                p.cuts.map((c, idx) => (
                  <div key={idx} className="bg-white p-2.5 rounded-lg border border-amber-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-amber-900 font-bold uppercase">
                        Corte {c.cutNumber || idx + 1}
                      </span>
                      {c.notes && (
                        <span className="text-[10px] text-[#555f6f] truncate max-w-[130px]" title={c.notes}>
                          {c.notes}
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="font-mono font-bold text-amber-950 text-[14px]">
                        {Number(c.lengthMeters).toFixed(3)} m
                      </span>
                      <span className="text-[11px] font-mono text-[#555f6f]">
                        ({Math.round(Number(c.lengthMeters) * 1000)} mm)
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white p-2.5 rounded-lg border border-amber-200">
                  <span className="text-[10px] text-amber-900 font-bold uppercase">Corte Principal</span>
                  <span className="text-[12px] text-[#151c27] font-semibold block mt-0.5">Corte activo en proceso QC</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cubicaje y Despiece BOM Card */}
        {(p.category || p.paintAreaM2 !== undefined || p.totalWeightKg !== undefined || (p.quantity && p.quantity > 1) || p.balance !== undefined || p.excelRow !== undefined) && (
          <div className="border border-indigo-200 bg-indigo-50/50 rounded-xl p-3.5 space-y-2 text-[12px]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span>Despiece y Cubicaje (BOM Estructural)</span>
              </span>
              {p.excelRow && (
                <span className="text-[10px] font-mono text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded font-semibold">
                  Fila Excel: #{p.excelRow}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {p.category && (
                <div className="bg-white p-2 rounded-lg border border-indigo-100">
                  <span className="text-[10px] text-[#555f6f] block font-medium">Categoría</span>
                  <span className="font-bold text-[#151c27] truncate block text-[11px]">{p.category}</span>
                </div>
              )}
              <div className="bg-white p-2 rounded-lg border border-indigo-100">
                <span className="text-[10px] text-[#555f6f] block font-medium">Cant. / Saldo</span>
                <span className="font-bold text-[#151c27] text-[12px]">
                  {p.quantity || 1} unid <span className="text-emerald-700 font-semibold">(Saldo: {p.balance ?? p.quantity ?? 1})</span>
                </span>
              </div>
              {p.paintAreaM2 !== undefined && (
                <div className="bg-white p-2 rounded-lg border border-indigo-100">
                  <span className="text-[10px] text-[#555f6f] block font-medium">Área de Pintura</span>
                  <span className="font-bold text-blue-900 text-[12px]">
                    {p.paintAreaM2} m²/u
                    {p.paintAreaTotalM2 && (
                      <span className="text-[10px] text-[#555f6f] block font-normal">Tot: {p.paintAreaTotalM2} m²</span>
                    )}
                  </span>
                </div>
              )}
              {p.totalWeightKg !== undefined && (
                <div className="bg-white p-2 rounded-lg border border-indigo-100">
                  <span className="text-[10px] text-[#555f6f] block font-medium">Peso Total Lote</span>
                  <span className="font-bold text-amber-900 text-[12px]">
                    {p.totalWeightKg.toLocaleString()} kg
                    {p.unitWeightKgPerMeter && (
                      <span className="text-[10px] text-[#555f6f] block font-normal">({p.unitWeightKgPerMeter} kg/m)</span>
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dynamic Specific Attributes Card */}
        {(p.camberMm !== undefined || p.rodLengthMm !== undefined || p.boltLengthMm !== undefined || p.plateWidthMm !== undefined) && (
          <div className="border border-blue-200 bg-blue-50/50 rounded-xl p-3 space-y-1.5 text-[12px]">
            <span className="text-[11px] font-bold text-[#004ac6] uppercase tracking-wider block">
              Parámetros Específicos del Elemento ({p.type})
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {p.type === 'Joist' && p.camberMm !== undefined && (
                <div className="bg-white p-2 rounded-lg border border-blue-200">
                  <span className="text-[10px] text-[#555f6f] block">Contra flecha</span>
                  <span className="font-mono font-bold text-[#004ac6] text-[13px]">{p.camberMm} mm</span>
                </div>
              )}

              {p.type === 'Punta roscada' && (
                <>
                  {p.rodLengthMm !== undefined && (
                    <div className="bg-white p-2 rounded-lg border border-amber-200">
                      <span className="text-[10px] text-[#555f6f] block">Longitud</span>
                      <span className="font-mono font-bold text-[#151c27] text-[13px]">{p.rodLengthMm} mm</span>
                    </div>
                  )}
                  {p.threadLengthMm !== undefined && (
                    <div className="bg-white p-2 rounded-lg border border-amber-200">
                      <span className="text-[10px] text-[#555f6f] block">Longitud de rosca</span>
                      <span className="font-mono font-bold text-amber-800 text-[13px]">{p.threadLengthMm} mm</span>
                    </div>
                  )}
                </>
              )}

              {p.type === 'Pernos' && (
                <>
                  {p.boltLengthMm !== undefined && (
                    <div className="bg-white p-2 rounded-lg border border-purple-200">
                      <span className="text-[10px] text-[#555f6f] block">Longitud</span>
                      <span className="font-mono font-bold text-[#151c27] text-[13px]">{p.boltLengthMm} mm</span>
                    </div>
                  )}
                  {p.threadLength1Mm !== undefined && (
                    <div className="bg-white p-2 rounded-lg border border-purple-200">
                      <span className="text-[10px] text-[#555f6f] block">Rosca 1</span>
                      <span className="font-mono font-bold text-purple-800 text-[13px]">{p.threadLength1Mm} mm</span>
                    </div>
                  )}
                  {p.threadLength2Mm !== undefined && (
                    <div className="bg-white p-2 rounded-lg border border-purple-200">
                      <span className="text-[10px] text-[#555f6f] block">Rosca 2</span>
                      <span className="font-mono font-bold text-purple-800 text-[13px]">{p.threadLength2Mm} mm</span>
                    </div>
                  )}
                </>
              )}

              {p.type === 'Placa' && (
                <>
                  <div className="bg-white p-2 rounded-lg border border-emerald-200">
                    <span className="text-[10px] text-[#555f6f] block">Ancho × Alto</span>
                    <span className="font-mono font-bold text-emerald-800 text-[13px]">
                      {p.plateWidthMm || '-'} × {p.plateHeightMm || '-'} mm
                    </span>
                  </div>
                  {p.holeDiameterMm !== undefined && (
                    <div className="bg-white p-2 rounded-lg border border-emerald-200">
                      <span className="text-[10px] text-[#555f6f] block">Diámetro perforación</span>
                      <span className="font-mono font-bold text-emerald-800 text-[13px]">Ø {p.holeDiameterMm} mm</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* 5. Trazabilidad de Contratistas Responsables */}
        <div className="border border-[#c3c6d7] rounded-xl p-3.5 bg-[#f9fafb] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#004ac6] uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">engineering</span>
              <span>Contratistas Asignados y Fabricación</span>
            </span>
            {p.assignmentHistory && p.assignmentHistory.length > 0 && (
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                {p.assignmentHistory.length} reasignaciones registradas
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px]">
            {/* Soldador */}
            <div className="p-2.5 bg-white rounded-lg border border-[#e2e8f8]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold text-[#555f6f]">Soldadura</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  p.weldingStatus === 'Completado' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {p.weldingStatus || 'Sin asignar'}
                </span>
              </div>
              <p className="font-bold text-[#151c27] text-[13px]">{p.welderName || 'No asignado'}</p>
              <div className="text-[11px] text-[#737686] mt-0.5 flex items-center justify-between font-mono">
                <span>Asignado: {p.weldingAssignedDate || '-'}</span>
                {p.weldingCompletedDate && <span>Fin: {p.weldingCompletedDate}</span>}
              </div>
            </div>

            {/* Pintor */}
            <div className="p-2.5 bg-white rounded-lg border border-[#e2e8f8]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold text-[#555f6f]">Pintura</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  p.paintingStatus === 'Completado' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'
                }`}>
                  {p.paintingStatus || 'Sin asignar'}
                </span>
              </div>
              <p className="font-bold text-[#151c27] text-[13px]">{p.painterName || 'No asignado'}</p>
              <div className="text-[11px] text-[#737686] mt-0.5 flex items-center justify-between font-mono">
                <span>Asignado: {p.paintingAssignedDate || '-'}</span>
                {p.paintingCompletedDate && <span>Fin: {p.paintingCompletedDate}</span>}
              </div>
            </div>
          </div>

          {/* Historial de reasignaciones si existió */}
          {p.assignmentHistory && p.assignmentHistory.length > 0 && (
            <div className="pt-2 border-t border-[#e2e8f8]">
              <span className="text-[10px] font-bold text-[#737686] uppercase block mb-1">
                Historial de cambios / Auditoría de reasignación:
              </span>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {p.assignmentHistory.map(h => (
                  <div key={h.id} className="text-[11px] text-[#434655] bg-white p-1.5 rounded border border-[#e2e8f8]">
                    <span className="font-bold text-[#004ac6]">{h.process}:</span> {h.contractorName} 
                    {h.previousContractorName && <span className="text-amber-700"> (reemplazó a {h.previousContractorName})</span>}
                    {h.reason && <span className="text-[#737686] block italic">Motivo: "{h.reason}" — por {h.changedBy}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions (Sticky at bottom) */}
      <div className="p-3.5 sm:p-4 border-t border-[#e2e8f8] bg-[#f9fafb] flex flex-wrap justify-between items-center gap-2 shrink-0">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              const target = p;
              setSelectedPieceForDetail(null);
              setSelectedPieceForEdit(target);
              setIsEditPieceModalOpen(true);
            }}
            className="px-3 py-1.5 bg-[#004ac6] hover:bg-[#2563eb] text-white rounded-lg text-[12px] font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Modificar Pieza</span>
          </button>

          <button
            onClick={() => {
              const target = p;
              setSelectedPieceForDetail(null);
              setSelectedPieceForHistoryModal(target);
            }}
            className="px-3 py-1.5 bg-white border border-[#c3c6d7] hover:border-[#004ac6] hover:bg-[#f0f3ff] text-[#151c27] rounded-lg text-[12px] font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-[#004ac6]" />
            <span>Historial ({p.modificationHistory?.length || 0})</span>
          </button>

          <button
            onClick={() => {
              const target = p;
              playFeedbackSound('click');
              setSelectedPieceForDetail(null);
              setSelectedPieceForQR(target);
            }}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[12px] font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            title="Ver código QR y etiqueta de la pieza"
          >
            <QrCode className="w-3.5 h-3.5 text-blue-300" />
            <span>Etiqueta QR</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedPieceForDetail(null);
              setSelectedPieceForTraceability(p);
            }}
            className="text-[12px] text-[#004ac6] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Línea de Vida →</span>
          </button>

          <button
            onClick={() => setSelectedPieceForDetail(null)}
            className="px-4 py-1.5 bg-[#e2e8f8] text-[#151c27] rounded-lg text-[12px] font-semibold hover:bg-[#c3c6d7] transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
);
};
