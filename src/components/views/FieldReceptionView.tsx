import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  QrCode, 
  Truck, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Check, 
  Ban, 
  PenTool, 
  Camera, 
  AlertCircle,
  Clock,
  Building,
  RotateCcw,
  Sun,
  FileText,
  Filter
} from 'lucide-react';
import { playFeedbackSound } from '../../utils/audioFeedback';

export const FieldReceptionView: React.FC = () => {
  const { 
    receptionSession, 
    updateReceptionPieceStatus, 
    setIsSignatureModalOpen,
    setSelectedShipmentForPrint,
    shipments,
    isFieldHighContrastMode,
    setIsFieldHighContrastMode
  } = useApp();

  const [activeTabShipment, setActiveTabShipment] = useState<'ENV-00286' | 'ENV-00287'>('ENV-00286');
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [scannedMarkInput, setScannedMarkInput] = useState('');
  const [damageReasonInput, setDamageReasonInput] = useState('');
  const [selectedForDamagePiece, setSelectedForDamagePiece] = useState<string | null>(null);
  const [listFilter, setListFilter] = useState<'all' | 'pending' | 'verified' | 'incidents'>('all');

  const verifiedItems = receptionSession.items.filter(
    i => i.status === 'Recibida' || i.status === 'Dañada' || i.status === 'Faltante'
  );
  const pendingItems = receptionSession.items.filter(
    i => i.status === 'En espera'
  );
  const incidentItems = receptionSession.items.filter(
    i => i.status === 'Dañada' || i.status === 'Faltante'
  );

  const filteredItems = receptionSession.items.filter(item => {
    if (listFilter === 'pending') return item.status === 'En espera';
    if (listFilter === 'verified') return item.status === 'Recibida';
    if (listFilter === 'incidents') return item.status === 'Dañada' || item.status === 'Faltante';
    return true;
  });

  const percentComplete = Math.round((verifiedItems.length / (receptionSession.items.length || 18)) * 100);

  const handleQuickScan = (mark: string, status: 'Recibida' | 'Dañada' | 'Faltante') => {
    if (status === 'Recibida') playFeedbackSound('success');
    else if (status === 'Dañada') playFeedbackSound('error');
    else playFeedbackSound('warning');

    updateReceptionPieceStatus(mark, status);
  };

  const handleManualScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedMarkInput.trim()) return;
    playFeedbackSound('success');
    updateReceptionPieceStatus(scannedMarkInput.trim(), 'Recibida');
    setScannedMarkInput('');
    setShowScannerModal(false);
  };

  const handleOpenManifestPrint = () => {
    const currentShipment = shipments.find(s => s.code === activeTabShipment) || shipments[0];
    setSelectedShipmentForPrint(currentShipment);
    playFeedbackSound('click');
  };

  return (
    <div className={`space-y-6 pb-16 animate-in fade-in duration-200 ${
      isFieldHighContrastMode ? 'text-black' : ''
    }`}>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[26px] md:text-[30px] font-bold text-[#151c27] tracking-tight font-['Inter']">
              Recepción en Campo
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
              Modo Obra
            </span>
          </div>
          <p className="text-[14px] text-[#434655] mt-0.5">
            Verificación física, control de daños y recepción digital con firma en sitio.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* High Contrast Toggle Button */}
          <button
            onClick={() => {
              setIsFieldHighContrastMode(!isFieldHighContrastMode);
              playFeedbackSound('click');
            }}
            className={`px-3 py-2 rounded-lg text-[13px] font-semibold flex items-center gap-1.5 transition-colors border ${
              isFieldHighContrastMode 
                ? 'bg-amber-400 text-black border-amber-500 ring-2 ring-amber-400/40 shadow-sm'
                : 'bg-white text-[#151c27] border-[#c3c6d7] hover:bg-[#f0f3ff]'
            }`}
            title="Alternar modo de alto contraste para visibilidad bajo luz solar directa"
          >
            <Sun className="w-4 h-4 text-amber-600" />
            <span>{isFieldHighContrastMode ? 'Contraste Solar: ON' : 'Modo Sol'}</span>
          </button>

          {/* Printable Manifest Trigger */}
          <button
            onClick={handleOpenManifestPrint}
            className="px-3.5 py-2 bg-white border border-[#c3c6d7] text-[#151c27] hover:bg-[#f0f3ff] rounded-lg text-[13px] font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <FileText className="w-4 h-4 text-[#004ac6]" />
            <span>Manifiesto</span>
          </button>

          <button
            id="scan-reception-btn"
            onClick={() => {
              setShowScannerModal(true);
              playFeedbackSound('click');
            }}
            className="flex items-center justify-center gap-2 bg-[#004ac6] text-white px-5 py-2.5 rounded-lg hover:bg-[#2563eb] transition-colors shadow-sm text-[13px] font-semibold min-h-[44px]"
          >
            <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
            <span>Escanear QR / Código</span>
          </button>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Incoming Shipments (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <h2 className="text-[17px] font-bold text-[#151c27] flex items-center justify-between">
            <span>Envíos Esperados</span>
            <span className="text-[11px] font-semibold text-[#004ac6] bg-[#dbe1ff] px-2 py-0.5 rounded">
              2 Activos
            </span>
          </h2>

          {/* Active Shipment Card: ENV-00286 */}
          <div 
            onClick={() => {
              setActiveTabShipment('ENV-00286');
              playFeedbackSound('click');
            }}
            className={`bg-white border rounded-xl p-4 cursor-pointer relative overflow-hidden transition-all shadow-xs ${
              activeTabShipment === 'ENV-00286'
                ? 'border-[#004ac6] ring-2 ring-[#004ac6]/30 shadow-md'
                : 'border-[#c3c6d7] hover:border-[#004ac6]'
            } ${isFieldHighContrastMode ? 'border-2 border-black' : ''}`}
          >
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#004ac6]"></div>
            <div className="flex justify-between items-start mb-2.5 pl-1">
              <div>
                <span className="font-mono text-[12px] font-bold text-[#555f6f] block mb-0.5">
                  ENV-00286
                </span>
                <h3 className="text-[17px] font-bold text-[#151c27]">
                  Proyecto Mhotivo
                </h3>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-[#ffecd1] text-[#7d3600]">
                En Tránsito
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3 pl-1 text-[13px]">
              <div>
                <span className="text-[11px] font-semibold text-[#737686] block uppercase">
                  Total Piezas
                </span>
                <span className="text-[16px] font-bold text-[#151c27]">18 marcas</span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-[#737686] block uppercase">
                  Transportista
                </span>
                <span className="font-medium text-[#151c27]">Trans. Rápidos</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#e2e8f8]">
              <span className="text-[11px] text-[#555f6f]">Placas: AB-4921</span>
              <span className="text-[12px] font-bold text-[#004ac6] flex items-center gap-1">
                Recepción Activa →
              </span>
            </div>
          </div>

          {/* Pending Shipment Card: ENV-00287 */}
          <div 
            onClick={() => {
              setActiveTabShipment('ENV-00287');
              playFeedbackSound('click');
            }}
            className={`bg-white border rounded-xl p-4 cursor-pointer transition-all shadow-xs ${
              activeTabShipment === 'ENV-00287'
                ? 'border-[#004ac6] ring-2 ring-[#004ac6]/30 shadow-md'
                : 'border-[#c3c6d7] hover:bg-[#f0f3ff]'
            }`}
          >
            <div className="flex justify-between items-start mb-2.5">
              <div>
                <span className="font-mono text-[12px] font-bold text-[#555f6f] block mb-0.5">
                  ENV-00287
                </span>
                <h3 className="text-[16px] font-bold text-[#151c27]">
                  Torre A - Nivel 4
                </h3>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                En Preparación
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[13px]">
              <div>
                <span className="text-[11px] font-semibold text-[#737686] block uppercase">
                  Piezas
                </span>
                <span className="text-[15px] font-bold text-[#151c27]">14 marcas</span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-[#737686] block uppercase">
                  Llegada Est.
                </span>
                <span className="font-medium text-[#151c27]">Mañana 09:00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Active Checklist & Verification Workspace (8 cols) */}
        <div className="lg:col-span-8">
          <div className={`bg-white border rounded-xl overflow-hidden shadow-sm flex flex-col ${
            isFieldHighContrastMode ? 'border-2 border-black ring-1 ring-black' : 'border-[#c3c6d7]'
          }`}>
            {/* Header of Active Verification */}
            <div className="p-4 sm:p-5 border-b border-[#c3c6d7] bg-[#f9fafb] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#004ac6] text-[15px]">
                    {activeTabShipment}
                  </span>
                  <span className="text-slate-400">•</span>
                  <h3 className="text-[17px] font-bold text-[#151c27]">
                    Lista de Verificación de Carga
                  </h3>
                </div>
                <p className="text-[12px] text-[#555f6f] mt-0.5">
                  Verifique cada marca contra el remito del transporte.
                </p>
              </div>

              {/* Progress Bar & Percentage */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[11px] font-bold text-[#555f6f] uppercase block">
                    Progreso
                  </span>
                  <span className="text-[14px] font-bold text-[#151c27]">
                    {verifiedItems.length} de {receptionSession.items.length} piezas
                  </span>
                </div>
                <div className="w-12 h-12 relative flex items-center justify-center">
                  <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-[#dce2f3]"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                    />
                    <path
                      className="text-[#004ac6]"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeDasharray={`${percentComplete}, 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-bold text-[12px] text-[#151c27]">
                    {percentComplete}%
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Filter Chips */}
            <div className="px-5 py-2.5 bg-[#f0f3ff] border-b border-[#dce2f3] flex flex-wrap items-center gap-2 text-[12px]">
              <span className="font-bold text-[#434655] mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                <span>Ver:</span>
              </span>
              <button
                onClick={() => { setListFilter('all'); playFeedbackSound('click'); }}
                className={`px-3 py-1 rounded-full font-semibold transition-colors ${
                  listFilter === 'all' ? 'bg-[#004ac6] text-white shadow-xs' : 'bg-white text-[#434655] border border-[#c3c6d7] hover:bg-white/80'
                }`}
              >
                Todas ({receptionSession.items.length})
              </button>
              <button
                onClick={() => { setListFilter('pending'); playFeedbackSound('click'); }}
                className={`px-3 py-1 rounded-full font-semibold transition-colors ${
                  listFilter === 'pending' ? 'bg-[#004ac6] text-white shadow-xs' : 'bg-white text-[#434655] border border-[#c3c6d7] hover:bg-white/80'
                }`}
              >
                Pendientes ({pendingItems.length})
              </button>
              <button
                onClick={() => { setListFilter('verified'); playFeedbackSound('click'); }}
                className={`px-3 py-1 rounded-full font-semibold transition-colors ${
                  listFilter === 'verified' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-[#434655] border border-[#c3c6d7] hover:bg-white/80'
                }`}
              >
                Conformes ({receptionSession.items.filter(i => i.status === 'Recibida').length})
              </button>
              <button
                onClick={() => { setListFilter('incidents'); playFeedbackSound('click'); }}
                className={`px-3 py-1 rounded-full font-semibold transition-colors ${
                  listFilter === 'incidents' ? 'bg-red-600 text-white shadow-xs' : 'bg-white text-[#434655] border border-[#c3c6d7] hover:bg-white/80'
                }`}
              >
                Incidencias ({incidentItems.length})
              </button>
            </div>

            {/* Discrepancy Alert */}
            {receptionSession.hasIncidentAlert && (
              <div className="mx-5 mt-4 p-3.5 bg-[#ffdad6] text-[#93000a] rounded-lg flex items-start gap-3 border border-[#ffb4ab]">
                <span className="material-symbols-outlined text-[20px] text-[#ba1a1a] shrink-0 mt-0.5">
                  warning
                </span>
                <div className="flex-1 text-[13px]">
                  <p className="font-bold text-[#ba1a1a]">Incidencia Registrada en Sitio</p>
                  <p className="text-[#93000a] mt-0.5">
                    {receptionSession.incidentMessage || 'Se reportó pieza con daño durante la descarga. Requiere revisión de calidad.'}
                  </p>
                </div>
              </div>
            )}

            {/* Items Verification List */}
            <div className="flex-1 p-4 sm:p-5 space-y-3 overflow-y-auto max-h-[500px]">
              {filteredItems.map((item) => {
                return (
                  <div
                    key={item.mark}
                    className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
                      item.status === 'Recibida'
                        ? 'bg-emerald-50/70 border-emerald-300'
                        : item.status === 'Dañada'
                        ? 'bg-red-50 border-red-300'
                        : item.status === 'Faltante'
                        ? 'bg-amber-50 border-amber-300'
                        : 'bg-white border-[#c3c6d7] hover:border-[#004ac6] shadow-xs'
                    } ${isFieldHighContrastMode ? 'border-2 border-black' : ''}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-black text-[17px] ${
                            isFieldHighContrastMode ? 'text-black' : 'text-[#151c27]'
                          }`}>
                            {item.mark}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                            item.status === 'Recibida'
                              ? 'bg-emerald-200 text-emerald-900 border border-emerald-300'
                              : item.status === 'Dañada'
                              ? 'bg-red-200 text-red-900 border border-red-300'
                              : item.status === 'Faltante'
                              ? 'bg-amber-200 text-amber-900 border border-amber-300'
                              : 'bg-slate-100 text-slate-700 border border-slate-300'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                        <span className="text-[13px] text-[#434655] block mt-0.5">
                          {item.profileAndWeight} {item.notes && <strong className="text-red-700 ml-1">• {item.notes}</strong>}
                        </span>
                      </div>

                      {/* Field Touch Action Controls (Large touch target >= 48px height) */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 sm:pt-0">
                        <button
                          onClick={() => setSelectedForDamagePiece(item.mark)}
                          className={`h-11 px-3.5 rounded-lg text-[12px] font-bold flex items-center gap-1.5 transition-colors border ${
                            item.status === 'Dañada'
                              ? 'bg-red-600 text-white border-red-700 shadow-xs'
                              : 'bg-red-50 text-red-700 hover:bg-red-100 border-red-200'
                          }`}
                          title="Reportar pieza golpeada o doblada"
                        >
                          <AlertTriangle className="w-4 h-4" />
                          <span>Dañada</span>
                        </button>

                        <button
                          onClick={() => handleQuickScan(item.mark, 'Faltante')}
                          className={`h-11 px-3.5 rounded-lg text-[12px] font-bold flex items-center gap-1.5 transition-colors border ${
                            item.status === 'Faltante'
                              ? 'bg-amber-500 text-black border-amber-600 shadow-xs'
                              : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border-amber-200'
                          }`}
                          title="Reportar pieza no encontrada en plataforma"
                        >
                          <Ban className="w-4 h-4" />
                          <span>Faltante</span>
                        </button>

                        <button
                          onClick={() => handleQuickScan(item.mark, 'Recibida')}
                          className={`h-11 px-4.5 rounded-lg text-[13px] font-bold flex items-center gap-1.5 transition-colors shadow-sm ${
                            item.status === 'Recibida'
                              ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                              : 'bg-[#c4eed0] text-[#00390a] hover:bg-[#a6d9b5] border border-emerald-300'
                          }`}
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>Conforme</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredItems.length === 0 && (
                <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl text-[#737686] text-[14px]">
                  No hay piezas que coincidan con este filtro.
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-[#c3c6d7] bg-[#f9f9ff] flex flex-col sm:flex-row items-center justify-between gap-3">
              {receptionSession.signedBy ? (
                <div className="text-[13px] text-emerald-700 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4.5 h-4.5" />
                  <span>Firmado por {receptionSession.signedBy} ({receptionSession.signedAt})</span>
                </div>
              ) : (
                <span className="text-[12px] text-[#555f6f]">
                  {pendingItems.length === 0 ? '✓ Todas las piezas verificadas. Listo para firmar.' : `${pendingItems.length} piezas por verificar.`}
                </span>
              )}

              <button
                id="sign-reception-btn"
                onClick={() => {
                  setIsSignatureModalOpen(true);
                  playFeedbackSound('click');
                }}
                className="w-full sm:w-auto px-6 py-3 bg-[#151c27] hover:bg-[#2a313d] text-white rounded-lg text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm min-h-[46px]"
              >
                <PenTool className="w-4 h-4" />
                <span>{receptionSession.signedBy ? 'Ver / Re-firmar Manifiesto' : 'Finalizar y Firmar Recepción'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Manual / Barcode Scan Modal */}
      {showScannerModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#c3c6d7] shadow-2xl p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-[#e2e8f8] pb-3">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-[#004ac6]" />
                <h3 className="font-bold text-[16px] text-[#151c27]">Escaneo de Pieza en Campo</h3>
              </div>
              <button 
                onClick={() => setShowScannerModal(false)}
                className="text-[#737686] hover:text-[#151c27]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scanner Visual Simulation Box */}
            <div className="relative h-40 bg-slate-900 rounded-xl overflow-hidden flex flex-col items-center justify-center text-white border-2 border-dashed border-[#004ac6]">
              <div className="w-48 h-24 border border-white/40 rounded-lg flex items-center justify-center relative">
                <span className="w-full h-0.5 bg-emerald-400 absolute animate-bounce" />
                <QrCode className="w-12 h-12 text-white/70" />
              </div>
              <span className="text-[11px] text-slate-300 mt-2">Alinee el código QR o código de barras de la etiqueta</span>
            </div>

            <form onSubmit={handleManualScanSubmit} className="space-y-3">
              <div>
                <label className="block text-[12px] font-bold text-[#434655] uppercase mb-1">
                  O Ingrese Marca / ID Manualmente:
                </label>
                <input
                  type="text"
                  value={scannedMarkInput}
                  onChange={(e) => setScannedMarkInput(e.target.value)}
                  placeholder="Ej: C-406, V-103..."
                  className="w-full h-11 px-3 bg-[#f0f3ff] border border-[#c3c6d7] focus:border-[#004ac6] focus:bg-white rounded-lg text-[14px] outline-none font-mono"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowScannerModal(false)}
                  className="px-4 py-2.5 bg-white border border-[#c3c6d7] hover:bg-[#f0f3ff] text-[#151c27] rounded-lg text-[13px] font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#004ac6] text-white rounded-lg text-[13px] font-semibold hover:bg-[#2563eb] shadow-sm transition-colors"
                >
                  Verificar Pieza
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Incident / Damage Reason Modal */}
      {selectedForDamagePiece && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#c3c6d7] shadow-2xl p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-[#e2e8f8] pb-3">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-bold text-[16px] text-[#151c27]">
                  Reportar Daño: {selectedForDamagePiece}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedForDamagePiece(null)}
                className="text-[#737686] hover:text-[#151c27]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[12px] font-bold text-[#434655] uppercase mb-1">
                  Descripción del Daño:
                </label>
                <textarea
                  value={damageReasonInput}
                  onChange={(e) => setDamageReasonInput(e.target.value)}
                  placeholder="Ej: Brida doblada por impacto durante el izaje, pintura desprendida..."
                  rows={3}
                  className="w-full p-3 bg-[#f0f3ff] border border-[#c3c6d7] focus:border-red-500 focus:bg-white rounded-lg text-[13px] outline-none"
                  autoFocus
                />
              </div>

              <div className="border border-dashed border-[#c3c6d7] p-3 rounded-lg flex items-center justify-center gap-2 text-[#555f6f] text-[12px] cursor-pointer hover:bg-[#f0f3ff]">
                <Camera className="w-4 h-4" />
                <span>Adjuntar Fotografía de Evidencia</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#e2e8f8]">
              <button
                type="button"
                onClick={() => setSelectedForDamagePiece(null)}
                className="px-4 py-2 bg-white border border-[#c3c6d7] hover:bg-[#f0f3ff] text-[#151c27] rounded-lg text-[13px] font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  updateReceptionPieceStatus(
                    selectedForDamagePiece, 
                    'Dañada', 
                    damageReasonInput || 'Daño físico reportado en descarga'
                  );
                  playFeedbackSound('error');
                  setDamageReasonInput('');
                  setSelectedForDamagePiece(null);
                }}
                className="px-5 py-2 bg-red-600 text-white rounded-lg text-[13px] font-semibold hover:bg-red-700 shadow-sm transition-colors"
              >
                Registrar Incidencia
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
