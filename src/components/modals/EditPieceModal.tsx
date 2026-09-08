import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Edit3, 
  Save, 
  ShieldCheck, 
  AlertTriangle, 
  History, 
  Layers, 
  HardHat, 
  Paintbrush, 
  CheckCircle2, 
  Lock, 
  Info,
  Clock,
  UserCheck,
  Compass,
  Settings2
} from 'lucide-react';
import { Piece, ElementType } from '../../types';
import { ELEMENT_TYPE_OPTIONS } from './NewPieceModal';
import { playFeedbackSound } from '../../utils/audioFeedback';

export const EditPieceModal: React.FC = () => {
  const { 
    selectedPieceForEdit, 
    setSelectedPieceForEdit, 
    isEditPieceModalOpen,
    setIsEditPieceModalOpen,
    pieces,
    updatePiece, 
    projects,
    currentUserRole,
    setSelectedPieceForHistoryModal
  } = useApp();

  // If modal was opened without a specific piece, default to first available
  useEffect(() => {
    if (isEditPieceModalOpen && !selectedPieceForEdit && pieces.length > 0) {
      setSelectedPieceForEdit(pieces[0]);
    }
  }, [isEditPieceModalOpen, selectedPieceForEdit, pieces]);

  const [mark, setMark] = useState('');
  const [description, setDescription] = useState('');
  const [project, setProject] = useState('');
  const [workOrder, setWorkOrder] = useState('');
  const [type, setType] = useState<Piece['type']>('Viga');
  const [profile, setProfile] = useState('');
  const [lengthMeters, setLengthMeters] = useState<number>(0);
  const [dimensions, setDimensions] = useState('');
  const [steelGrade, setSteelGrade] = useState('');
  const [weightKg, setWeightKg] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [status, setStatus] = useState<Piece['status']>('Fabricada');
  const [notes, setNotes] = useState('');
  const [modificationReason, setModificationReason] = useState('');

  // Dynamic fields per element type
  const [camberMm, setCamberMm] = useState<string>('');
  const [rodLengthMm, setRodLengthMm] = useState<string>('');
  const [threadLengthMm, setThreadLengthMm] = useState<string>('');
  const [boltLengthMm, setBoltLengthMm] = useState<string>('');
  const [threadLength1Mm, setThreadLength1Mm] = useState<string>('');
  const [threadLength2Mm, setThreadLength2Mm] = useState<string>('');
  const [plateWidthMm, setPlateWidthMm] = useState<string>('');
  const [plateHeightMm, setPlateHeightMm] = useState<string>('');
  const [holeDiameterMm, setHoleDiameterMm] = useState<string>('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showHistoryInline, setShowHistoryInline] = useState(false);

  // Sync state when selectedPieceForEdit changes
  useEffect(() => {
    if (selectedPieceForEdit) {
      const p = selectedPieceForEdit;
      setMark(p.mark || '');
      setDescription(p.description || '');
      setProject(p.project || '');
      setWorkOrder(p.workOrder || 'OT-2026-084');
      setType(p.type || 'Viga');
      setProfile(p.profile || '');
      setLengthMeters(p.lengthMeters || 0);
      setDimensions(p.dimensions || `${p.lengthMeters?.toFixed(2) || '0.00'} m`);
      setSteelGrade(p.steelGrade || 'ASTM A992 Grado 50');
      setWeightKg(p.weightKg || 0);
      setQuantity(p.quantity || 1);
      setStatus(p.status || 'Fabricada');
      setNotes(p.notes || '');
      setModificationReason('');

      // Preload dynamic parameters
      setCamberMm(p.camberMm !== undefined ? String(p.camberMm) : '');
      setRodLengthMm(p.rodLengthMm !== undefined ? String(p.rodLengthMm) : '');
      setThreadLengthMm(p.threadLengthMm !== undefined ? String(p.threadLengthMm) : '');
      setBoltLengthMm(p.boltLengthMm !== undefined ? String(p.boltLengthMm) : '');
      setThreadLength1Mm(p.threadLength1Mm !== undefined ? String(p.threadLength1Mm) : '');
      setThreadLength2Mm(p.threadLength2Mm !== undefined ? String(p.threadLength2Mm) : '');
      setPlateWidthMm(p.plateWidthMm !== undefined ? String(p.plateWidthMm) : '');
      setPlateHeightMm(p.plateHeightMm !== undefined ? String(p.plateHeightMm) : '');
      setHoleDiameterMm(p.holeDiameterMm !== undefined ? String(p.holeDiameterMm) : '');

      setErrorMessage(null);
      setSuccessMessage(null);
      setShowHistoryInline(false);
    }
  }, [selectedPieceForEdit]);

  const handleClose = () => {
    setSelectedPieceForEdit(null);
    setIsEditPieceModalOpen(false);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  if (!isEditPieceModalOpen && !selectedPieceForEdit) return null;
  if (!selectedPieceForEdit) return null;

  const p = selectedPieceForEdit;
  const isQcApproved = p.qcStatus === 'Aprobada';
  const canModify = currentUserRole === 'Administrador' || currentUserRole === 'Producción';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!canModify) {
      setErrorMessage('No posee permisos de edición. Su rol actual solo tiene autorización de consulta o inspección QC.');
      playFeedbackSound('error');
      return;
    }

    if (!mark.trim()) {
      setErrorMessage('El número o código de pieza es obligatorio.');
      playFeedbackSound('error');
      return;
    }

    if (Number(lengthMeters) <= 0) {
      setErrorMessage('La longitud debe ser un número mayor a 0.');
      playFeedbackSound('error');
      return;
    }

    if (Number(weightKg) < 0) {
      setErrorMessage('El peso no puede ser negativo.');
      playFeedbackSound('error');
      return;
    }

    // Require reason if piece was already QC approved
    if (isQcApproved && !modificationReason.trim()) {
      setErrorMessage('Esta pieza ya cuenta con Dictamen de Calidad (QC Aprobada). Es obligatorio ingresar el motivo técnico de la modificación.');
      playFeedbackSound('error');
      return;
    }

    const calculatedLengthMeters = type === 'Pernos' && boltLengthMm
      ? Number(boltLengthMm) / 1000
      : Number(lengthMeters);

    let calculatedDimensions = dimensions.trim();
    if (!calculatedDimensions) {
      if (type === 'Pernos' && boltLengthMm) {
        calculatedDimensions = `L: ${boltLengthMm} mm${threadLength1Mm ? ` / R1: ${threadLength1Mm} mm` : ''}${threadLength2Mm ? ` / R2: ${threadLength2Mm} mm` : ''}`;
      } else {
        calculatedDimensions = `${Number(lengthMeters).toFixed(2)} m`;
      }
    }

    const updatedData: Partial<Piece> = {
      mark: mark.trim().toUpperCase(),
      description: description.trim(),
      project,
      workOrder: workOrder.trim(),
      type,
      profile: profile.trim(),
      lengthMeters: calculatedLengthMeters,
      dimensions: calculatedDimensions,
      steelGrade: steelGrade.trim(),
      weightKg: Number(weightKg),
      quantity: Number(quantity) || 1,
      status,
      notes: notes.trim(),
      camberMm: camberMm ? Number(camberMm) : undefined,
      rodLengthMm: rodLengthMm ? Number(rodLengthMm) : undefined,
      threadLengthMm: threadLengthMm ? Number(threadLengthMm) : undefined,
      boltLengthMm: boltLengthMm ? Number(boltLengthMm) : undefined,
      threadLength1Mm: threadLength1Mm ? Number(threadLength1Mm) : undefined,
      threadLength2Mm: threadLength2Mm ? Number(threadLength2Mm) : undefined,
      plateWidthMm: plateWidthMm ? Number(plateWidthMm) : undefined,
      plateHeightMm: plateHeightMm ? Number(plateHeightMm) : undefined,
      holeDiameterMm: holeDiameterMm ? Number(holeDiameterMm) : undefined
    };

    const result = updatePiece(p.id, updatedData, modificationReason.trim());

    if (!result.success) {
      setErrorMessage(result.error || 'Error al actualizar la pieza.');
      playFeedbackSound('error');
      return;
    }

    playFeedbackSound('success');
    setSuccessMessage('¡Pieza actualizada con éxito! Se ha registrado el evento en el historial de trazabilidad.');

    setTimeout(() => {
      handleClose();
    }, 900);
  };

  return (
    <div id="edit-piece-modal-container" className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-[#c3c6d7] shadow-2xl overflow-hidden animate-in zoom-in-95 my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#e2e8f8] bg-[#f9fafb] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#004ac6]/10 border border-[#004ac6]/20 flex items-center justify-center text-[#004ac6]">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[17px] sm:text-[18px] text-[#151c27]">
                  Modificar Pieza: <span className="font-mono text-[#004ac6]">{p.mark}</span>
                </h3>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  p.qcStatus === 'Aprobada' ? 'bg-emerald-100 text-emerald-800' :
                  p.qcStatus === 'Rechazada' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  QC: {p.qcStatus}
                </span>
              </div>
              <p className="text-[12px] text-[#555f6f]">
                Actualización de datos técnicos sin afectar asignaciones de contratistas ni registros de calidad
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                handleClose();
                setSelectedPieceForHistoryModal(p);
              }}
              className="px-2.5 py-1.5 bg-white border border-[#c3c6d7] hover:border-[#004ac6] hover:bg-[#f0f3ff] text-[#151c27] rounded-lg text-[12px] font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              title="Ver historial cronológico de modificaciones"
            >
              <History className="w-4 h-4 text-[#004ac6]" />
              <span className="hidden sm:inline">Historial ({p.modificationHistory?.length || 0})</span>
            </button>
            <button
              onClick={handleClose}
              className="p-1.5 text-[#737686] hover:text-[#151c27] rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5 text-[13px]">
          {/* Selector para cambiar de pieza rápidamente */}
          <div className="bg-[#f0f3ff] border border-[#dce5fc] rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-bold text-[#004ac6]">Pieza cargada:</span>
              <span className="font-mono font-bold text-[#151c27] text-[13px] bg-white px-2 py-0.5 rounded border border-[#c3c6d7]">
                {p.mark}
              </span>
              <span className="text-[11px] text-[#555f6f]">({p.type} • {p.project})</span>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="piece-picker" className="text-[11px] text-[#555f6f] font-medium whitespace-nowrap">
                Cambiar pieza:
              </label>
              <select
                id="piece-picker"
                value={p.id}
                onChange={(e) => {
                  const found = pieces.find(x => x.id === e.target.value);
                  if (found) setSelectedPieceForEdit(found);
                }}
                className="bg-white border border-[#c3c6d7] text-[#151c27] text-[12px] rounded-lg px-2.5 py-1 font-mono focus:outline-hidden focus:ring-2 focus:ring-[#004ac6]"
              >
                {pieces.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.mark} — {item.type} ({item.project})
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* Permission Banner */}
          {!canModify && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-amber-900 text-[12px]">
              <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong>Modo Solo Consulta:</strong> Tu rol actual es <u>{currentUserRole}</u>. Solo los usuarios con rol de <strong>Administrador</strong> o <strong>Producción</strong> están autorizados para modificar piezas estructurales.
              </div>
            </div>
          )}

          {/* QC Approved Warning */}
          {isQcApproved && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2.5 text-blue-950 text-[12px]">
              <ShieldCheck className="w-4 h-4 text-[#004ac6] shrink-0 mt-0.5" />
              <div>
                <strong>Pieza Aprobada por QC:</strong> Esta viga ya cuenta con liberación de Control de Calidad. Si modificas dimensiones, perfil o grado de material, deberás justificar el motivo para la auditoría técnica.
              </div>
            </div>
          )}

          {/* Traceability Protection Notification Card */}
          <div className="bg-[#f0f3ff] border border-[#d2defa] rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#004ac6] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#004ac6]" />
                <span>Protección de Integridad y Trazabilidad</span>
              </span>
              <span className="text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                Bloqueo Seguro Activo
              </span>
            </div>
            <p className="text-[12px] text-[#434655]">
              Los procesos de fabricación asignados a contratistas y el estado QC se conservan automáticamente y no serán sobrescritos:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
              <div className="bg-white p-2 rounded-lg border border-[#e2e8f8] flex items-center justify-between">
                <span className="flex items-center gap-1 text-[#555f6f]">
                  <HardHat className="w-3.5 h-3.5 text-blue-600" />
                  <strong>Soldador:</strong>
                </span>
                <span className="font-bold text-[#151c27]">
                  {p.welderName || 'Sin asignar'} ({p.weldingStatus || 'Pendiente'})
                </span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-[#e2e8f8] flex items-center justify-between">
                <span className="flex items-center gap-1 text-[#555f6f]">
                  <Paintbrush className="w-3.5 h-3.5 text-purple-600" />
                  <strong>Pintor:</strong>
                </span>
                <span className="font-bold text-[#151c27]">
                  {p.painterName || 'Sin asignar'} ({p.paintingStatus || 'Pendiente'})
                </span>
              </div>
            </div>
          </div>

          {/* Section 1: Identificación y Descripción */}
          <div className="space-y-3">
            <h4 className="text-[12px] font-bold text-[#151c27] uppercase tracking-wider border-b border-[#e2e8f8] pb-1.5 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#004ac6]" />
              <span>1. Identificación y Ubicación</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-[#434655] mb-1">
                  Número o Código de Pieza *
                </label>
                <input
                  required
                  disabled={!canModify}
                  type="text"
                  value={mark}
                  onChange={(e) => setMark(e.target.value)}
                  placeholder="Ej: V-00125"
                  className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg outline-none focus:border-[#004ac6] font-mono uppercase font-bold disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#434655] mb-1">
                  Proyecto Asignado *
                </label>
                <select
                  required
                  disabled={!canModify}
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg outline-none focus:border-[#004ac6] disabled:bg-slate-100 disabled:cursor-not-allowed cursor-pointer"
                >
                  {projects.map((proj) => (
                    <option key={proj.id} value={proj.name}>
                      {proj.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#434655] mb-1">
                  Orden de Trabajo (OT)
                </label>
                <input
                  disabled={!canModify}
                  type="text"
                  value={workOrder}
                  onChange={(e) => setWorkOrder(e.target.value)}
                  placeholder="Ej: OT-2026-084"
                  className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg outline-none focus:border-[#004ac6] font-mono disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#434655] mb-1">
                Descripción del Elemento
              </label>
              <input
                disabled={!canModify}
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej: Viga principal de marco sismorresistente eje 2-C"
                className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg outline-none focus:border-[#004ac6] disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Section 2: Dimensiones y Especificaciones Técnicas */}
          <div className="space-y-3">
            <h4 className="text-[12px] font-bold text-[#151c27] uppercase tracking-wider border-b border-[#e2e8f8] pb-1.5 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-[#004ac6]">straighten</span>
              <span>2. Especificaciones Técnicas y Dimensiones</span>
            </h4>

            <div className={`grid grid-cols-1 ${type === 'Pernos' ? 'sm:grid-cols-2' : 'sm:grid-cols-3'} gap-3`}>
              <div>
                <label className="block font-bold text-[#004ac6] mb-1 flex items-center gap-1">
                  <Settings2 className="w-3.5 h-3.5 text-[#004ac6]" />
                  <span>Tipo de elemento *</span>
                </label>
                <select
                  disabled={!canModify}
                  value={type}
                  onChange={(e: any) => setType(e.target.value)}
                  className="w-full h-10 px-3 bg-blue-50/50 border border-blue-200 rounded-lg outline-none focus:border-[#004ac6] disabled:bg-slate-100 disabled:cursor-not-allowed cursor-pointer font-semibold text-[#151c27]"
                >
                  {ELEMENT_TYPE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#434655] mb-1">
                  Perfil de Acero
                </label>
                <input
                  disabled={!canModify}
                  type="text"
                  value={profile}
                  onChange={(e) => setProfile(e.target.value)}
                  placeholder="Ej: W24x76, W18x130"
                  className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg outline-none focus:border-[#004ac6] font-mono font-semibold disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
              </div>

              {type !== 'Pernos' && type !== 'Placa' && type !== 'Punta roscada' && (
                <div>
                  <label className="block font-semibold text-[#434655] mb-1">
                    Longitud (m) *
                  </label>
                  <input
                    required={type !== 'Pernos' && type !== 'Placa' && type !== 'Punta roscada'}
                    disabled={!canModify}
                    type="number"
                    step="0.01"
                    min="0.1"
                    value={lengthMeters}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setLengthMeters(val);
                      if (!dimensions || dimensions.includes('m')) {
                        setDimensions(`${val.toFixed(2)} m`);
                      }
                    }}
                    className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg outline-none focus:border-[#004ac6] font-mono disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                </div>
              )}
            </div>

            {/* SECCIÓN DINÁMICA: Campos específicos según el tipo de elemento */}
            {type === 'Joist' && (
              <div className="p-3 bg-blue-50/80 border-2 border-blue-200 rounded-xl space-y-2 animate-in fade-in-50">
                <div className="flex items-center gap-1.5 text-blue-900 font-bold text-[12px]">
                  <Compass className="w-4 h-4 text-[#004ac6]" />
                  <span>Parámetros específicos de Joist</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#151c27] mb-1">
                      Contra flecha (mm) <span className="text-[#004ac6]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        disabled={!canModify}
                        type="number"
                        step="0.1"
                        min="0"
                        value={camberMm}
                        onChange={(e) => setCamberMm(e.target.value)}
                        placeholder="Ej: 25"
                        className="w-full h-9 pl-3 pr-10 bg-white border border-blue-300 rounded-lg outline-none focus:ring-2 focus:ring-[#004ac6] font-mono font-bold text-[#004ac6] disabled:bg-slate-100"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-[#555f6f]">
                        mm
                      </span>
                    </div>
                    <span className="text-[10px] text-[#555f6f] mt-0.5 block">Ejemplo técnico: 25 mm</span>
                  </div>
                  <div className="text-[11px] text-[#555f6f] bg-white p-2 rounded-lg border border-blue-100 flex items-start gap-1.5">
                    <Info className="w-4 h-4 text-[#004ac6] shrink-0 mt-0.5" />
                    <span>Cualquier cambio en la contra flecha se guardará automáticamente en el historial de modificaciones de la pieza.</span>
                  </div>
                </div>
              </div>
            )}

            {type === 'Punta roscada' && (
              <div className="p-3 bg-amber-50/80 border-2 border-amber-200 rounded-xl space-y-2 animate-in fade-in-50">
                <div className="flex items-center gap-1.5 text-amber-900 font-bold text-[12px]">
                  <Compass className="w-4 h-4 text-amber-700" />
                  <span>Parámetros específicos de Punta roscada</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#151c27] mb-1">
                      Longitud (mm)
                    </label>
                    <div className="relative">
                      <input
                        disabled={!canModify}
                        type="number"
                        step="1"
                        min="0"
                        value={rodLengthMm}
                        onChange={(e) => setRodLengthMm(e.target.value)}
                        placeholder="Ej: 500"
                        className="w-full h-9 pl-3 pr-10 bg-white border border-amber-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-600 font-mono font-bold text-[#151c27] disabled:bg-slate-100"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-[#555f6f]">
                        mm
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#151c27] mb-1">
                      Longitud de rosca (mm)
                    </label>
                    <div className="relative">
                      <input
                        disabled={!canModify}
                        type="number"
                        step="1"
                        min="0"
                        value={threadLengthMm}
                        onChange={(e) => setThreadLengthMm(e.target.value)}
                        placeholder="Ej: 100"
                        className="w-full h-9 pl-3 pr-10 bg-white border border-amber-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-600 font-mono font-bold text-[#151c27] disabled:bg-slate-100"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-[#555f6f]">
                        mm
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {type === 'Pernos' && (
              <div className="p-3 bg-purple-50/80 border-2 border-purple-200 rounded-xl space-y-2 animate-in fade-in-50">
                <div className="flex items-center gap-1.5 text-purple-900 font-bold text-[12px]">
                  <Compass className="w-4 h-4 text-purple-700" />
                  <span>Parámetros específicos de Pernos</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block font-semibold text-[#151c27] mb-1">
                      Longitud (mm)
                    </label>
                    <div className="relative">
                      <input
                        disabled={!canModify}
                        type="number"
                        step="1"
                        min="0"
                        value={boltLengthMm}
                        onChange={(e) => setBoltLengthMm(e.target.value)}
                        placeholder="Ej: 600"
                        className="w-full h-9 pl-2.5 pr-8 bg-white border border-purple-300 rounded-lg outline-none font-mono font-bold text-[#151c27] disabled:bg-slate-100"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[#555f6f]">mm</span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#151c27] mb-1">
                      Longitud rosca 1
                    </label>
                    <div className="relative">
                      <input
                        disabled={!canModify}
                        type="number"
                        step="1"
                        min="0"
                        value={threadLength1Mm}
                        onChange={(e) => setThreadLength1Mm(e.target.value)}
                        placeholder="Ej: 100"
                        className="w-full h-9 pl-2.5 pr-8 bg-white border border-purple-300 rounded-lg outline-none font-mono font-bold text-[#151c27] disabled:bg-slate-100"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[#555f6f]">mm</span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#151c27] mb-1">
                      Longitud rosca 2
                    </label>
                    <div className="relative">
                      <input
                        disabled={!canModify}
                        type="number"
                        step="1"
                        min="0"
                        value={threadLength2Mm}
                        onChange={(e) => setThreadLength2Mm(e.target.value)}
                        placeholder="Ej: 150"
                        className="w-full h-9 pl-2.5 pr-8 bg-white border border-purple-300 rounded-lg outline-none font-mono font-bold text-[#151c27] disabled:bg-slate-100"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[#555f6f]">mm</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {type === 'Placa' && (
              <div className="p-3 bg-emerald-50/80 border-2 border-emerald-200 rounded-xl space-y-2 animate-in fade-in-50">
                <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-[12px]">
                  <Compass className="w-4 h-4 text-emerald-700" />
                  <span>Parámetros específicos de Placa</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block font-semibold text-[#151c27] mb-1">
                      Ancho (mm)
                    </label>
                    <div className="relative">
                      <input
                        disabled={!canModify}
                        type="number"
                        step="1"
                        min="0"
                        value={plateWidthMm}
                        onChange={(e) => setPlateWidthMm(e.target.value)}
                        placeholder="Ej: 300"
                        className="w-full h-9 pl-2.5 pr-8 bg-white border border-emerald-300 rounded-lg outline-none font-mono font-bold text-[#151c27] disabled:bg-slate-100"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[#555f6f]">mm</span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#151c27] mb-1">
                      Alto (mm)
                    </label>
                    <div className="relative">
                      <input
                        disabled={!canModify}
                        type="number"
                        step="1"
                        min="0"
                        value={plateHeightMm}
                        onChange={(e) => setPlateHeightMm(e.target.value)}
                        placeholder="Ej: 450"
                        className="w-full h-9 pl-2.5 pr-8 bg-white border border-emerald-300 rounded-lg outline-none font-mono font-bold text-[#151c27] disabled:bg-slate-100"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[#555f6f]">mm</span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#151c27] mb-1">
                      Diámetro perforación
                    </label>
                    <div className="relative">
                      <input
                        disabled={!canModify}
                        type="number"
                        step="0.5"
                        min="0"
                        value={holeDiameterMm}
                        onChange={(e) => setHoleDiameterMm(e.target.value)}
                        placeholder="Ej: 22"
                        className="w-full h-9 pl-2.5 pr-8 bg-white border border-emerald-300 rounded-lg outline-none font-mono font-bold text-[#151c27] disabled:bg-slate-100"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[#555f6f]">mm</span>
                    </div>
                  </div>
                </div>
                <div className="text-[10px] text-[#555f6f] bg-white p-2 rounded border border-emerald-100 flex items-center justify-between">
                  <span>Visualización técnica:</span>
                  <span className="font-mono font-bold text-emerald-800">
                    {plateWidthMm || '300'} × {plateHeightMm || '450'} mm {holeDiameterMm ? `(Ø ${holeDiameterMm} mm)` : ''}
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-semibold text-[#434655] mb-1">
                  Dimensiones Detalladas
                </label>
                <input
                  disabled={!canModify}
                  type="text"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  placeholder="Ej: 10.50 x 0.61 x 0.23 m"
                  className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg outline-none focus:border-[#004ac6] font-mono text-[12px] disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#434655] mb-1">
                  Material / Grado
                </label>
                <input
                  disabled={!canModify}
                  type="text"
                  value={steelGrade}
                  onChange={(e) => setSteelGrade(e.target.value)}
                  placeholder="Ej: ASTM A992 Grado 50"
                  className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg outline-none focus:border-[#004ac6] font-medium disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#434655] mb-1">
                  Peso Total (kg)
                </label>
                <input
                  disabled={!canModify}
                  type="number"
                  step="1"
                  min="0"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg outline-none focus:border-[#004ac6] font-mono disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#434655] mb-1">
                  Cantidad (Piezas)
                </label>
                <input
                  disabled={!canModify}
                  type="number"
                  step="1"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg outline-none focus:border-[#004ac6] font-mono disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Estado y Observaciones */}
          <div className="space-y-3">
            <h4 className="text-[12px] font-bold text-[#151c27] uppercase tracking-wider border-b border-[#e2e8f8] pb-1.5 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-[#004ac6]">task_alt</span>
              <span>3. Estado y Observaciones Generales</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-[#434655] mb-1">
                  Estado de la Pieza
                </label>
                <select
                  disabled={!canModify}
                  value={status}
                  onChange={(e: any) => setStatus(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg outline-none focus:border-[#004ac6] disabled:bg-slate-100 disabled:cursor-not-allowed cursor-pointer"
                >
                  <option value="Fabricada">Fabricada</option>
                  <option value="Enviada">Enviada</option>
                  <option value="Recibida">Recibida</option>
                  <option value="Incidencia">Incidencia</option>
                  <option value="Pendiente">Pendiente</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-[#434655] mb-1">
                  Observaciones Generales
                </label>
                <input
                  disabled={!canModify}
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Instrucciones de montaje, detalles de bisel, adendas técnicas..."
                  className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg outline-none focus:border-[#004ac6] disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Motivo de la modificación (requerido si QC aprobada) */}
            <div className="p-3 bg-[#fafcff] rounded-xl border border-[#dce2f3]">
              <label className="block font-semibold text-[#151c27] mb-1">
                Motivo / Justificación del Cambio {isQcApproved ? '<span class="text-red-500">* (Obligatorio por QC)</span>' : '(Opcional para auditoría)'}
              </label>
              <input
                disabled={!canModify}
                type="text"
                value={modificationReason}
                onChange={(e) => setModificationReason(e.target.value)}
                placeholder="Ej: Ajuste de dimensiones según plano as-built adenda 3..."
                className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg outline-none focus:border-[#004ac6] text-[13px] disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
              <span className="text-[11px] text-[#555f6f] mt-1 block">
                Este motivo quedará asentado en el historial de modificaciones con tu usuario ({currentUserRole}) y fecha/hora exacta.
              </span>
            </div>
          </div>

          {/* Quick Historial Preview Toggle */}
          {p.modificationHistory && p.modificationHistory.length > 0 && (
            <div className="border border-[#e2e8f8] rounded-xl p-3 bg-[#fafcff]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#555f6f] uppercase flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#004ac6]" />
                  <span>Historial de cambios anteriores ({p.modificationHistory.length})</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowHistoryInline(!showHistoryInline)}
                  className="text-[11px] text-[#004ac6] font-bold hover:underline"
                >
                  {showHistoryInline ? 'Ocultar' : 'Ver cambios'}
                </button>
              </div>

              {showHistoryInline && (
                <div className="mt-2 space-y-1.5 max-h-40 overflow-y-auto text-[11px]">
                  {p.modificationHistory.map((h) => (
                    <div key={h.id} className="p-2 bg-white rounded border border-[#e2e8f8]">
                      <div className="flex justify-between font-mono text-[#737686]">
                        <span>{h.date} • {h.user}</span>
                        <strong className="text-[#004ac6]">{h.field}</strong>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="line-through text-red-600 truncate max-w-[45%]">{h.previousValue}</span>
                        <span>→</span>
                        <span className="font-bold text-emerald-700 truncate max-w-[45%]">{h.newValue}</span>
                      </div>
                      {h.reason && <p className="text-[10px] text-[#555f6f] italic mt-0.5">"{h.reason}"</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-[12px] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-[12px] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Footer Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-3 border-t border-[#e2e8f8]">
            <div className="text-[11px] text-[#555f6f]">
              Modificando como: <strong className="text-[#151c27]">{currentUserRole}</strong>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 bg-white border border-[#c3c6d7] text-[#151c27] rounded-lg text-[13px] font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={!canModify}
                className="px-5 py-2 bg-[#004ac6] hover:bg-[#2563eb] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-[13px] font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Guardar cambios</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
