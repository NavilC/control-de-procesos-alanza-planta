import React, { useState, useRef } from 'react';
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
  RotateCcw,
  Sun,
  FileText,
  Filter,
  Search,
  CheckCheck,
  ShieldCheck,
  Trash2,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { playFeedbackSound } from '../../utils/audioFeedback';

export const FieldReceptionView: React.FC = () => {
  const { 
    receptionSession, 
    updateReceptionPieceStatus, 
    selectShipmentForReception,
    batchVerifyReceptionPieces,
    setIsSignatureModalOpen,
    setSelectedShipmentForPrint,
    shipments,
    isFieldHighContrastMode,
    setIsFieldHighContrastMode,
    playFeedbackSound,
    showToast
  } = useApp();

  const [showScannerModal, setShowScannerModal] = useState(false);
  const [scannedMarkInput, setScannedMarkInput] = useState('');
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [damageReasonInput, setDamageReasonInput] = useState('');
  const [damagePhotoUrl, setDamagePhotoUrl] = useState<string | null>(null);
  const [selectedForDamagePiece, setSelectedForDamagePiece] = useState<string | null>(null);
  const [listFilter, setListFilter] = useState<'all' | 'pending' | 'verified' | 'incidents'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showBatchConfirmModal, setShowBatchConfirmModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Active shipment data from central list
  const currentShipment = shipments.find(
    s => s.id === receptionSession.shipmentId || s.code === receptionSession.shipmentId
  ) || shipments[0];

  // Relevant shipments for field reception (all or prioritized in transit / pending)
  const incomingShipments = shipments.filter(
    s => s.status === 'En tránsito' || s.status === 'En preparación' || s.id === receptionSession.shipmentId
  );

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
    // Search match
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      const matchMark = item.mark.toLowerCase().includes(query);
      const matchType = item.type.toLowerCase().includes(query);
      const matchProfile = item.profileAndWeight.toLowerCase().includes(query);
      if (!matchMark && !matchType && !matchProfile) return false;
    }

    if (listFilter === 'pending') return item.status === 'En espera';
    if (listFilter === 'verified') return item.status === 'Recibida';
    if (listFilter === 'incidents') return item.status === 'Dañada' || item.status === 'Faltante';
    return true;
  });

  const totalItemsCount = receptionSession.items.length || 1;
  const percentComplete = Math.round((verifiedItems.length / totalItemsCount) * 100);

  const handleQuickScan = (mark: string, status: 'Recibida' | 'Dañada' | 'Faltante') => {
    if (status === 'Recibida') playFeedbackSound('success');
    else if (status === 'Dañada') playFeedbackSound('error');
    else playFeedbackSound('warning');

    updateReceptionPieceStatus(mark, status);
  };

  const handleManualScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = scannedMarkInput.trim();
    if (!query) return;

    // Check if item exists in session
    const existing = receptionSession.items.find(
      i => i.mark.toLowerCase() === query.toLowerCase()
    );

    if (existing) {
      playFeedbackSound('success');
      updateReceptionPieceStatus(existing.mark, 'Recibida');
      showToast(`Pieza ${existing.mark} recibida conforme`, 'success');
      setScannedMarkInput('');
      setScannerError(null);
      setShowScannerModal(false);
    } else {
      // Piece not in this shipment manifest
      playFeedbackSound('error');
      const err = `La marca "${query}" no pertenece al manifiesto de este envío (${receptionSession.shipmentId}). Verifique el código.`;
      setScannerError(err);
      showToast(`Marca "${query}" no encontrada en este envío`, 'error');
    }
  };

  const handleSimulateQuickScan = (mark: string) => {
    playFeedbackSound('success');
    updateReceptionPieceStatus(mark, 'Recibida');
    showToast(`Pieza ${mark} recibida conforme`, 'success');
    setScannerError(null);
    setShowScannerModal(false);
  };

  const handleOpenManifestPrint = () => {
    setSelectedShipmentForPrint(currentShipment);
    playFeedbackSound('click');
  };

  const handleBatchVerifyConfirm = () => {
    batchVerifyReceptionPieces('Recibida');
    playFeedbackSound('success');
    showToast(`Piezas restantes de ${receptionSession.shipmentId} verificadas`, 'success');
    setShowBatchConfirmModal(false);
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setDamagePhotoUrl(event.target?.result as string);
        playFeedbackSound('click');
      };
      reader.readAsDataURL(file);
    }
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
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Modo Obra
            </span>
          </div>
          <p className="text-[14px] text-[#434655] mt-0.5">
            Cotejo físico de marcas, control fotográfico de daños y firma de manifiesto en sitio.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* High Contrast Toggle Button */}
          <button
            onClick={() => {
              setIsFieldHighContrastMode(!isFieldHighContrastMode);
              playFeedbackSound('click');
            }}
            className={`px-3 py-2 rounded-lg text-[13px] font-semibold flex items-center gap-1.5 transition-colors border cursor-pointer min-h-[44px] ${
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
            className="px-3.5 py-2 bg-white border border-[#c3c6d7] text-[#151c27] hover:bg-[#f0f3ff] rounded-lg text-[13px] font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer min-h-[44px]"
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
            className="flex items-center justify-center gap-2 bg-[#004ac6] text-white px-5 py-2.5 rounded-lg hover:bg-[#2563eb] transition-colors shadow-sm text-[13px] font-semibold min-h-[44px] cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            <span>Escanear QR / Código</span>
          </button>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Incoming Shipments (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[17px] font-bold text-[#151c27] flex items-center gap-2">
              <Truck className="w-4.5 h-4.5 text-[#004ac6]" />
              <span>Envíos Programados</span>
            </h2>
            <span className="text-[11px] font-bold text-[#004ac6] bg-[#dbe1ff] px-2 py-0.5 rounded">
              {incomingShipments.length} Disponibles
            </span>
          </div>

          <div className="space-y-3">
            {incomingShipments.map((ship) => {
              const isSelected = receptionSession.shipmentId === ship.id || receptionSession.shipmentId === ship.code;
              return (
                <div 
                  key={ship.id}
                  onClick={() => {
                    selectShipmentForReception(ship.id);
                    playFeedbackSound('click');
                  }}
                  className={`bg-white border rounded-xl p-4 cursor-pointer relative overflow-hidden transition-all shadow-xs ${
                    isSelected
                      ? 'border-[#004ac6] ring-2 ring-[#004ac6]/30 shadow-md bg-blue-50/20'
                      : 'border-[#c3c6d7] hover:border-[#004ac6] hover:bg-slate-50/60'
                  } ${isFieldHighContrastMode ? 'border-2 border-black' : ''}`}
                >
                  {isSelected && (
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-[#004ac6]" />
                  )}
                  <div className="flex justify-between items-start mb-2 pl-1">
                    <div>
                      <span className="font-mono text-[12px] font-bold text-[#555f6f] block mb-0.5">
                        {ship.id}
                      </span>
                      <h3 className="text-[16px] font-bold text-[#151c27]">
                        {ship.project}
                      </h3>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      ship.status === 'En tránsito'
                        ? 'bg-[#ffecd1] text-[#7d3600]'
                        : ship.status === 'Recibido'
                        ? 'bg-emerald-100 text-emerald-800'
                        : ship.status === 'Con incidencia'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {ship.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3 pl-1 text-[12.5px]">
                    <div>
                      <span className="text-[10.5px] font-semibold text-[#737686] block uppercase">
                        Piezas
                      </span>
                      <span className="text-[14px] font-bold text-[#151c27]">
                        {ship.piecesCount || ship.pieces?.length || 18} marcas
                      </span>
                    </div>
                    <div>
                      <span className="text-[10.5px] font-semibold text-[#737686] block uppercase">
                        Dpto. Despacho / Unidad
                      </span>
                      <span className="font-medium text-[#151c27] truncate block" title={ship.carrier}>
                        {ship.carrier}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#e2e8f8] text-[11.5px]">
                    <span className="text-[#555f6f]">
                      {ship.truckPlates ? `Placas: ${ship.truckPlates}` : `Destino: ${ship.destination.split(',')[0]}`}
                    </span>
                    <span className={`font-bold flex items-center gap-0.5 ${
                      isSelected ? 'text-[#004ac6]' : 'text-[#737686]'
                    }`}>
                      {isSelected ? 'Cotejando en Obra' : 'Seleccionar'} <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
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
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-[#004ac6] text-[15px] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {receptionSession.shipmentId}
                  </span>
                  <span className="text-slate-400">•</span>
                  <h3 className="text-[17px] font-bold text-[#151c27]">
                    {receptionSession.projectName}
                  </h3>
                </div>
                <p className="text-[12px] text-[#555f6f] mt-1 flex items-center gap-2 flex-wrap">
                  <span>Dpto. Despacho: <strong>{receptionSession.carrier}</strong></span>
                  <span>•</span>
                  <span>Chofer: <strong>{currentShipment?.driverName || receptionSession.driverName || 'Roberto Mendoza'}</strong></span>
                  <span>•</span>
                  <span>Coord: <strong>{currentShipment?.manager || receptionSession.manager || 'Carlos Gómez'}</strong></span>
                  <span>•</span>
                  <span>Total: <strong>{receptionSession.items.length} piezas</strong></span>
                </p>
              </div>

              {/* Progress Bar & Percentage */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[11px] font-bold text-[#555f6f] uppercase block">
                    Cotejadas
                  </span>
                  <span className="text-[14px] font-bold text-[#151c27]">
                    {verifiedItems.length} de {receptionSession.items.length} piezas
                  </span>
                </div>
                <div className="w-12 h-12 relative flex items-center justify-center shrink-0">
                  <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-[#dce2f3]"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                    />
                    <path
                      className={percentComplete === 100 ? "text-emerald-600" : "text-[#004ac6]"}
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

            {/* Toolbar: Search, Filters & Batch Action */}
            <div className="p-3 sm:px-5 bg-[#f0f3ff] border-b border-[#dce2f3] flex flex-col md:flex-row md:items-center justify-between gap-3 text-[12px]">
              {/* Search Box */}
              <div className="relative flex-1 max-w-xs">
                <Search className="w-3.5 h-3.5 text-[#737686] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar marca (ej: C-405, Viga...)"
                  className="w-full h-8.5 pl-8.5 pr-7 bg-white border border-[#c3c6d7] rounded-lg text-[12px] outline-none focus:border-[#004ac6]"
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Quick Filter Chips */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => { setListFilter('all'); playFeedbackSound('click'); }}
                  className={`px-2.5 py-1 rounded-full font-semibold transition-colors cursor-pointer ${
                    listFilter === 'all' ? 'bg-[#004ac6] text-white shadow-xs' : 'bg-white text-[#434655] border border-[#c3c6d7] hover:bg-white/80'
                  }`}
                >
                  Todas ({receptionSession.items.length})
                </button>
                <button
                  onClick={() => { setListFilter('pending'); playFeedbackSound('click'); }}
                  className={`px-2.5 py-1 rounded-full font-semibold transition-colors cursor-pointer ${
                    listFilter === 'pending' ? 'bg-[#004ac6] text-white shadow-xs' : 'bg-white text-[#434655] border border-[#c3c6d7] hover:bg-white/80'
                  }`}
                >
                  Pendientes ({pendingItems.length})
                </button>
                <button
                  onClick={() => { setListFilter('verified'); playFeedbackSound('click'); }}
                  className={`px-2.5 py-1 rounded-full font-semibold transition-colors cursor-pointer ${
                    listFilter === 'verified' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-[#434655] border border-[#c3c6d7] hover:bg-white/80'
                  }`}
                >
                  Conformes ({receptionSession.items.filter(i => i.status === 'Recibida').length})
                </button>
                <button
                  onClick={() => { setListFilter('incidents'); playFeedbackSound('click'); }}
                  className={`px-2.5 py-1 rounded-full font-semibold transition-colors cursor-pointer ${
                    listFilter === 'incidents' ? 'bg-red-600 text-white shadow-xs' : 'bg-white text-[#434655] border border-[#c3c6d7] hover:bg-white/80'
                  }`}
                >
                  Incidencias ({incidentItems.length})
                </button>
              </div>

              {/* Batch Action: Approve All Pending */}
              {pendingItems.length > 0 && (
                <button
                  onClick={() => setShowBatchConfirmModal(true)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer shrink-0"
                  title="Marcar todas las piezas pendientes como Conformes"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Aprobar Restantes ({pendingItems.length})</span>
                </button>
              )}
            </div>

            {/* Discrepancy Alert */}
            {receptionSession.hasIncidentAlert && (
              <div className="mx-5 mt-4 p-3.5 bg-[#ffdad6] text-[#93000a] rounded-lg flex items-start gap-3 border border-[#ffb4ab]">
                <AlertTriangle className="w-5 h-5 text-[#ba1a1a] shrink-0 mt-0.5" />
                <div className="flex-1 text-[13px]">
                  <p className="font-bold text-[#ba1a1a]">Incidencias Detectadas en Descarga</p>
                  <p className="text-[#93000a] mt-0.5">
                    {receptionSession.incidentMessage || 'Se reportaron piezas con daño físico o faltantes. Requiere validación de calidad antes de liberar.'}
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
                          {item.verifiedAt && (
                            <span className="text-[10.5px] text-[#737686] flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3" />
                              {item.verifiedAt}
                            </span>
                          )}
                        </div>
                        <span className="text-[13px] text-[#434655] block mt-0.5">
                          {item.profileAndWeight} {item.notes && <strong className="text-red-700 ml-1">• {item.notes}</strong>}
                        </span>
                      </div>

                      {/* Field Touch Action Controls (Large touch target >= 44px height) */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 sm:pt-0">
                        <button
                          onClick={() => {
                            setSelectedForDamagePiece(item.mark);
                            setDamagePhotoUrl(null);
                            setDamageReasonInput(item.notes || '');
                          }}
                          className={`min-h-[44px] px-3.5 rounded-lg text-[12px] font-bold flex items-center gap-1.5 transition-colors border cursor-pointer ${
                            item.status === 'Dañada'
                              ? 'bg-red-600 text-white border-red-700 shadow-xs'
                              : 'bg-red-50 text-red-700 hover:bg-red-100 border-red-200'
                          }`}
                          title="Reportar daño físico o deformación"
                        >
                          <AlertTriangle className="w-4 h-4" />
                          <span>Dañada</span>
                        </button>

                        <button
                          onClick={() => handleQuickScan(item.mark, 'Faltante')}
                          className={`min-h-[44px] px-3.5 rounded-lg text-[12px] font-bold flex items-center gap-1.5 transition-colors border cursor-pointer ${
                            item.status === 'Faltante'
                              ? 'bg-amber-500 text-black border-amber-600 shadow-xs'
                              : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border-amber-200'
                          }`}
                          title="Reportar pieza no encontrada en remolque"
                        >
                          <Ban className="w-4 h-4" />
                          <span>Faltante</span>
                        </button>

                        <button
                          onClick={() => handleQuickScan(item.mark, 'Recibida')}
                          className={`min-h-[44px] px-4.5 rounded-lg text-[13px] font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer ${
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
                  No hay piezas que coincidan con el criterio seleccionado.
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-[#c3c6d7] bg-[#f9f9ff] flex flex-col sm:flex-row items-center justify-between gap-3">
              {receptionSession.signedBy ? (
                <div className="text-[13px] text-emerald-700 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4.5 h-4.5" />
                  <span>Manifiesto Certificado por {receptionSession.signedBy} ({receptionSession.signedAt})</span>
                </div>
              ) : (
                <span className="text-[12.5px] text-[#555f6f]">
                  {pendingItems.length === 0 ? '✓ Todas las piezas cotejadas. Listo para asentar firma digital.' : `${pendingItems.length} piezas pendientes por verificar.`}
                </span>
              )}

              <button
                id="sign-reception-btn"
                onClick={() => {
                  setIsSignatureModalOpen(true);
                  playFeedbackSound('click');
                }}
                className="w-full sm:w-auto px-6 py-3 bg-[#151c27] hover:bg-[#2a313d] text-white rounded-lg text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm min-h-[46px] cursor-pointer"
              >
                <PenTool className="w-4 h-4" />
                <span>{receptionSession.signedBy ? 'Ver / Re-firmar Manifiesto' : 'Finalizar y Firmar Recepción'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Batch Confirm Modal */}
      {showBatchConfirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#c3c6d7] shadow-2xl p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-emerald-700 border-b border-[#e2e8f8] pb-3">
              <CheckCheck className="w-6 h-6 text-emerald-600" />
              <h3 className="font-bold text-[16px] text-[#151c27]">Aprobar Restantes Conformes</h3>
            </div>
            <p className="text-[13px] text-[#434655] leading-relaxed">
              ¿Desea marcar simultáneamente las <strong>{pendingItems.length} piezas restantes</strong> del manifiesto <strong>{receptionSession.shipmentId}</strong> como <strong>Recibida Conforme</strong>?
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-[#e2e8f8]">
              <button
                onClick={() => setShowBatchConfirmModal(false)}
                className="px-4 py-2 bg-white border border-[#c3c6d7] hover:bg-[#f0f3ff] text-[#151c27] rounded-lg text-[13px] font-medium transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleBatchVerifyConfirm}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[13px] font-semibold transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Confirmar Aprobación</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
                className="text-[#737686] hover:text-[#151c27] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scanner Visual Simulation Box */}
            <div className="relative h-44 bg-slate-900 rounded-xl overflow-hidden flex flex-col items-center justify-center text-white border-2 border-dashed border-[#004ac6]">
              <div className="w-48 h-28 border-2 border-white/50 rounded-lg flex items-center justify-center relative overflow-hidden">
                <span className="w-full h-0.5 bg-emerald-400 absolute animate-pulse shadow-[0_0_12px_#34d399]" />
                <QrCode className="w-14 h-14 text-white/60" />
              </div>
              <span className="text-[11px] text-slate-300 mt-2 font-mono">
                Alinee el código QR o código de barras de la pieza
              </span>
            </div>

            {/* Quick 1-click scan for testing in field */}
            {pendingItems.length > 0 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold text-[#004ac6] uppercase block">Siguiente Pieza Pendiente:</span>
                  <span className="font-mono font-bold text-[14px] text-[#151c27]">{pendingItems[0].mark}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleSimulateQuickScan(pendingItems[0].mark)}
                  className="px-3.5 py-1.5 bg-[#004ac6] hover:bg-[#2563eb] text-white rounded-lg text-[12px] font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Simular Lectura QR</span>
                </button>
              </div>
            )}

            <form onSubmit={handleManualScanSubmit} className="space-y-3">
              {scannerError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-[12px] flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-snug">{scannerError}</span>
                </div>
              )}

              <div>
                <label className="block text-[12px] font-bold text-[#434655] uppercase mb-1">
                  O Ingrese Marca / ID Manualmente:
                </label>
                <input
                  type="text"
                  value={scannedMarkInput}
                  onChange={(e) => {
                    setScannedMarkInput(e.target.value);
                    if (scannerError) setScannerError(null);
                  }}
                  placeholder="Ej: C-406, V-103..."
                  className="w-full h-11 px-3 bg-[#f0f3ff] border border-[#c3c6d7] focus:border-[#004ac6] focus:bg-white rounded-lg text-[14px] outline-none font-mono"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowScannerModal(false);
                    setScannerError(null);
                  }}
                  className="px-4 py-2.5 bg-white border border-[#c3c6d7] hover:bg-[#f0f3ff] text-[#151c27] rounded-lg text-[13px] font-medium transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#004ac6] text-white rounded-lg text-[13px] font-semibold hover:bg-[#2563eb] shadow-sm transition-colors cursor-pointer"
                >
                  Verificar Pieza
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Incident / Damage Reason Modal with Photo Capture */}
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
                onClick={() => {
                  setSelectedForDamagePiece(null);
                  setDamagePhotoUrl(null);
                }}
                className="text-[#737686] hover:text-[#151c27] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[12px] font-bold text-[#434655] uppercase mb-1">
                  Descripción del Daño: *
                </label>
                <textarea
                  value={damageReasonInput}
                  onChange={(e) => setDamageReasonInput(e.target.value)}
                  placeholder="Ej: Brida doblada por impacto durante el izaje, desprendimiento de pintura o pernos deformados..."
                  rows={3}
                  className="w-full p-3 bg-[#f0f3ff] border border-[#c3c6d7] focus:border-red-500 focus:bg-white rounded-lg text-[13px] outline-none"
                  autoFocus
                />
              </div>

              {/* Photo Evidence with real camera or file upload */}
              <div>
                <label className="block text-[12px] font-bold text-[#434655] uppercase mb-1">
                  Evidencia Fotográfica:
                </label>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept="image/*" 
                  capture="environment"
                  onChange={handlePhotoCapture}
                  className="hidden" 
                />

                {damagePhotoUrl ? (
                  <div className="relative rounded-lg overflow-hidden border border-red-300 max-h-40 bg-black flex items-center justify-center">
                    <img src={damagePhotoUrl} alt="Evidencia de daño" className="max-h-40 w-full object-contain" />
                    <button
                      type="button"
                      onClick={() => setDamagePhotoUrl(null)}
                      className="absolute top-2 right-2 bg-red-600/90 hover:bg-red-700 text-white p-1 rounded-full shadow-md cursor-pointer"
                      title="Eliminar foto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border border-dashed border-[#c3c6d7] p-4 rounded-lg flex flex-col items-center justify-center gap-1.5 text-[#555f6f] text-[12px] cursor-pointer hover:bg-[#f0f3ff] transition-colors"
                  >
                    <Camera className="w-5 h-5 text-[#004ac6]" />
                    <span className="font-semibold text-[#151c27]">Tomar Foto o Seleccionar Archivo</span>
                    <span className="text-[11px] text-[#737686]">Soporta cámara de smartphone o galería</span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#e2e8f8]">
              <button
                type="button"
                onClick={() => {
                  setSelectedForDamagePiece(null);
                  setDamagePhotoUrl(null);
                }}
                className="px-4 py-2 bg-white border border-[#c3c6d7] hover:bg-[#f0f3ff] text-[#151c27] rounded-lg text-[13px] font-medium transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  updateReceptionPieceStatus(
                    selectedForDamagePiece, 
                    'Dañada', 
                    damageReasonInput || 'Daño físico registrado en recepción de campo'
                  );
                  playFeedbackSound('error');
                  showToast(`Incidencia reportada en pieza ${selectedForDamagePiece}`, 'warning');
                  setDamageReasonInput('');
                  setDamagePhotoUrl(null);
                  setSelectedForDamagePiece(null);
                }}
                className="px-5 py-2 bg-red-600 text-white rounded-lg text-[13px] font-semibold hover:bg-red-700 shadow-sm transition-colors cursor-pointer"
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
