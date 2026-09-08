import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Piece, Contractor, AssignmentWorkStatus } from '../../types';
import { 
  X, 
  Check, 
  AlertTriangle, 
  Layers, 
  Building2, 
  History, 
  ShieldAlert, 
  Calendar, 
  UserCheck, 
  AlertCircle,
  FileCheck2,
  HardHat,
  Paintbrush
} from 'lucide-react';
import { playFeedbackSound } from '../../utils/audioFeedback';

export const AssignWorkModal: React.FC = () => {
  const { 
    isAssignWorkModalOpen, 
    setIsAssignWorkModalOpen,
    selectedPieceForAssignment,
    setSelectedPieceForAssignment,
    pieces,
    contractors,
    assignWorkToPiece,
    currentUserRole
  } = useApp();

  // Selected piece mark
  const [selectedPieceMark, setSelectedPieceMark] = useState<string>('');

  // Welding form fields
  const [welderId, setWelderId] = useState<string>('');
  const [weldingStatus, setWeldingStatus] = useState<AssignmentWorkStatus>('Asignado');
  const [weldingAssignedDate, setWeldingAssignedDate] = useState<string>('');
  const [weldingCompletedDate, setWeldingCompletedDate] = useState<string>('');
  const [weldingNotes, setWeldingNotes] = useState<string>('');
  const [weldingReassignReason, setWeldingReassignReason] = useState<string>('');

  // Painting form fields
  const [painterId, setPainterId] = useState<string>('');
  const [paintingStatus, setPaintingStatus] = useState<AssignmentWorkStatus>('Pendiente');
  const [paintingAssignedDate, setPaintingAssignedDate] = useState<string>('');
  const [paintingCompletedDate, setPaintingCompletedDate] = useState<string>('');
  const [paintingNotes, setPaintingNotes] = useState<string>('');
  const [paintingReassignReason, setPaintingReassignReason] = useState<string>('');

  // Active subtab inside modal: 'welding' | 'painting' | 'history'
  const [activeTab, setActiveTab] = useState<'welding' | 'painting' | 'history'>('welding');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Find currently targeted piece
  const currentPiece = useMemo(() => {
    return pieces.find(p => p.mark === selectedPieceMark) || selectedPieceForAssignment || null;
  }, [pieces, selectedPieceMark, selectedPieceForAssignment]);

  // Filter available active contractors (rule: Inactive contractors are NOT available for new assignments)
  const activeWelders = useMemo(() => {
    return contractors.filter(c => c.type === 'Soldador' && (c.status === 'Activo' || c.id === currentPiece?.welderId));
  }, [contractors, currentPiece?.welderId]);

  const activePainters = useMemo(() => {
    return contractors.filter(c => c.type === 'Pintor' && (c.status === 'Activo' || c.id === currentPiece?.painterId));
  }, [contractors, currentPiece?.painterId]);

  const canAssign = currentUserRole === 'Administrador' || currentUserRole === 'Producción';
  const canReassign = currentUserRole === 'Administrador';

  // Initialize fields when piece is selected
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    if (currentPiece) {
      setSelectedPieceMark(currentPiece.mark);
      setWelderId(currentPiece.welderId || '');
      setWeldingStatus(currentPiece.weldingStatus || (currentPiece.welderId ? 'Asignado' : 'Pendiente'));
      setWeldingAssignedDate(currentPiece.weldingAssignedDate || today);
      setWeldingCompletedDate(currentPiece.weldingCompletedDate || '');
      setWeldingNotes(currentPiece.weldingNotes || '');
      setWeldingReassignReason('');

      setPainterId(currentPiece.painterId || '');
      setPaintingStatus(currentPiece.paintingStatus || (currentPiece.painterId ? 'Asignado' : 'Pendiente'));
      setPaintingAssignedDate(currentPiece.paintingAssignedDate || today);
      setPaintingCompletedDate(currentPiece.paintingCompletedDate || '');
      setPaintingNotes(currentPiece.paintingNotes || '');
      setPaintingReassignReason('');
      setErrorMessage('');
    } else {
      setSelectedPieceMark('');
      setWelderId('');
      setPainterId('');
      setWeldingStatus('Pendiente');
      setPaintingStatus('Pendiente');
      setWeldingAssignedDate(today);
      setPaintingAssignedDate(today);
      setWeldingCompletedDate('');
      setPaintingCompletedDate('');
      setWeldingNotes('');
      setPaintingNotes('');
      setWeldingReassignReason('');
      setPaintingReassignReason('');
      setErrorMessage('');
    }
  }, [currentPiece, isAssignWorkModalOpen]);

  if (!isAssignWorkModalOpen) return null;

  const handleClose = () => {
    playFeedbackSound('click');
    setIsAssignWorkModalOpen(false);
    setSelectedPieceForAssignment(null);
  };

  // Check if reassignment is occurring
  const isWelderReassignment = !!(currentPiece?.welderId && welderId && currentPiece.welderId !== welderId);
  const isPainterReassignment = !!(currentPiece?.painterId && painterId && currentPiece.painterId !== painterId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!canAssign) {
      setErrorMessage('Permiso denegado: El rol QC solo tiene permiso de lectura.');
      playFeedbackSound('error');
      return;
    }

    if (!currentPiece) {
      setErrorMessage('Debe seleccionar una viga para realizar la asignación.');
      playFeedbackSound('error');
      return;
    }

    // Check reassignment permissions
    if (isWelderReassignment && !canReassign) {
      setErrorMessage('Solo el Administrador tiene autorización para reasignar un soldador previamente registrado.');
      playFeedbackSound('error');
      return;
    }

    if (isPainterReassignment && !canReassign) {
      setErrorMessage('Solo el Administrador tiene autorización para reasignar un pintor previamente registrado.');
      playFeedbackSound('error');
      return;
    }

    if (isWelderReassignment && !weldingReassignReason.trim()) {
      setErrorMessage('Es obligatorio registrar el motivo del cambio de soldador para el registro de auditoría.');
      playFeedbackSound('error');
      setActiveTab('welding');
      return;
    }

    if (isPainterReassignment && !paintingReassignReason.trim()) {
      setErrorMessage('Es obligatorio registrar el motivo del cambio de pintor para el registro de auditoría.');
      playFeedbackSound('error');
      setActiveTab('painting');
      return;
    }

    // Apply Welding Assignment if changed
    if (welderId || currentPiece.welderId) {
      assignWorkToPiece(currentPiece.mark, {
        process: 'Soldadura',
        contractorId: welderId,
        status: weldingStatus,
        assignedDate: weldingAssignedDate,
        completedDate: weldingStatus === 'Completado' ? (weldingCompletedDate || new Date().toISOString().slice(0, 10)) : weldingCompletedDate,
        notes: weldingNotes,
        reassignmentReason: isWelderReassignment ? weldingReassignReason : undefined
      });
    }

    // Apply Painting Assignment if changed
    if (painterId || currentPiece.painterId) {
      assignWorkToPiece(currentPiece.mark, {
        process: 'Pintura',
        contractorId: painterId,
        status: paintingStatus,
        assignedDate: paintingAssignedDate,
        completedDate: paintingStatus === 'Completado' ? (paintingCompletedDate || new Date().toISOString().slice(0, 10)) : paintingCompletedDate,
        notes: paintingNotes,
        reassignmentReason: isPainterReassignment ? paintingReassignReason : undefined
      });
    }

    playFeedbackSound('success');
    handleClose();
  };

  const selectablePieces = pieces.filter(p => {
    if (!searchFilter) return true;
    const q = searchFilter.toLowerCase();
    return p.mark.toLowerCase().includes(q) || p.project.toLowerCase().includes(q) || p.profile.toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#c3c6d7] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#e2e8f8] bg-[#f9fafb] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#2563eb] text-white flex items-center justify-center shadow-sm">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[16px] text-[#151c27]">
                Asignación de Trabajo a Vigas
              </h3>
              <p className="text-[12px] text-[#555f6f]">
                Asocie contratistas especializados para Soldadura y Pintura con trazabilidad a QC.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-[#737686] hover:text-[#151c27] p-1.5 rounded-lg hover:bg-[#e2e8f8] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Warning Banner if QC */}
        {!canAssign && (
          <div className="mx-6 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5 text-[12px] text-amber-800">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
            <span>
              Su rol actual es <strong>{currentUserRole}</strong> (Modo Consulta y Auditoría QC). Los campos se muestran en solo lectura.
            </span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-[13px]">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-[12px] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 4.1. Selección de la Viga */}
          <div className="bg-[#f0f3ff] p-4 rounded-xl border border-[#dbe1ff]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
              <label className="block text-[11px] font-bold text-[#004ac6] uppercase tracking-wider">
                1. Selección de Viga / Pieza a Trabajar <span className="text-red-500">*</span>
              </label>
              {selectedPieceForAssignment && (
                <span className="text-[11px] font-semibold text-[#004ac6] bg-white px-2.5 py-0.5 rounded-md border border-[#dbe1ff]">
                  Viga preseleccionada desde tabla
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <select
                  disabled={!canAssign || !!selectedPieceForAssignment}
                  value={currentPiece?.mark || ''}
                  onChange={(e) => {
                    setSelectedPieceMark(e.target.value);
                  }}
                  className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-[#151c27] font-mono font-bold focus:border-[#004ac6] outline-none disabled:bg-slate-100"
                >
                  <option value="">-- Seleccionar Viga --</option>
                  {selectablePieces.map(p => (
                    <option key={p.id} value={p.mark}>
                      {p.mark} ({p.profile} - {p.project})
                    </option>
                  ))}
                </select>
              </div>

              {currentPiece && (
                <div className="flex items-center gap-3 text-[12px] bg-white p-2 px-3 rounded-lg border border-[#e2e8f8]">
                  <div>
                    <span className="text-[#737686] block text-[10px] uppercase font-bold">Proyecto</span>
                    <span className="font-semibold text-[#151c27] truncate max-w-[130px] block">{currentPiece.project}</span>
                  </div>
                  <div className="h-6 w-px bg-slate-200"></div>
                  <div>
                    <span className="text-[#737686] block text-[10px] uppercase font-bold">Perfil / Peso</span>
                    <span className="font-mono text-[#151c27]">{currentPiece.profile} ({currentPiece.weight} kg)</span>
                  </div>
                  <div className="h-6 w-px bg-slate-200"></div>
                  <div>
                    <span className="text-[#737686] block text-[10px] uppercase font-bold">Estado QC</span>
                    <span className={`font-semibold text-[11px] ${
                      currentPiece.qcStatus === 'Aprobada' ? 'text-emerald-700' : currentPiece.qcStatus === 'Rechazada' ? 'text-red-700' : 'text-amber-700'
                    }`}>
                      {currentPiece.qcStatus}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Tabs for Assignment Sections */}
          <div className="flex border-b border-[#e2e8f8] gap-2">
            <button
              type="button"
              onClick={() => { playFeedbackSound('click'); setActiveTab('welding'); }}
              className={`pb-2.5 px-4 font-semibold text-[13px] flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'welding'
                  ? 'border-[#004ac6] text-[#004ac6]'
                  : 'border-transparent text-[#555f6f] hover:text-[#151c27]'
              }`}
            >
              <HardHat className="w-4 h-4" />
              <span>4.2. Asignación de Soldador</span>
              {welderId && (
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              )}
            </button>

            <button
              type="button"
              onClick={() => { playFeedbackSound('click'); setActiveTab('painting'); }}
              className={`pb-2.5 px-4 font-semibold text-[13px] flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'painting'
                  ? 'border-[#004ac6] text-[#004ac6]'
                  : 'border-transparent text-[#555f6f] hover:text-[#151c27]'
              }`}
            >
              <Paintbrush className="w-4 h-4" />
              <span>4.3. Asignación de Pintor</span>
              {painterId && (
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              )}
            </button>

            <button
              type="button"
              onClick={() => { playFeedbackSound('click'); setActiveTab('history'); }}
              className={`pb-2.5 px-4 font-semibold text-[13px] flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'history'
                  ? 'border-[#004ac6] text-[#004ac6]'
                  : 'border-transparent text-[#555f6f] hover:text-[#151c27]'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Historial ({currentPiece?.assignmentHistory?.length || 0})</span>
            </button>
          </div>

          {/* TAB 1: SOLDADURA */}
          {activeTab === 'welding' && (
            <div className="space-y-4 animate-in fade-in">
              {isWelderReassignment && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-800 text-[12px] flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Alerta de Reasignación de Soldador:</span>
                    <span>
                      La viga ya contaba con el soldador <strong>{currentPiece?.welderName}</strong>. 
                      Al cambiar el contratista se registrará un evento de trazabilidad y auditoría.
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-[#434655] uppercase tracking-wider mb-1.5">
                  Seleccionar Soldador Especializado
                </label>
                <select
                  disabled={!canAssign}
                  value={welderId}
                  onChange={(e) => setWelderId(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-[#151c27] focus:border-[#004ac6] outline-none disabled:bg-slate-100 font-semibold"
                >
                  <option value="">-- Sin soldador asignado --</option>
                  {activeWelders.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.identification || w.id}) {w.status === 'Inactivo' ? ' - [INACTIVO/HISTÓRICO]' : ''}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-[#737686] mt-1 block">
                  * Solo se muestran contratistas tipo Soldador en estado <strong>Activo</strong>.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#434655] uppercase tracking-wider mb-1.5">
                    Estado de Soldadura
                  </label>
                  <select
                    disabled={!canAssign}
                    value={weldingStatus}
                    onChange={(e) => setWeldingStatus(e.target.value as AssignmentWorkStatus)}
                    className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-[#151c27] focus:border-[#004ac6] outline-none font-semibold disabled:bg-slate-100"
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="Asignado">Asignado</option>
                    <option value="En proceso">En proceso</option>
                    <option value="Completado">Completado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#434655] uppercase tracking-wider mb-1.5">
                    Fecha de Asignación
                  </label>
                  <input
                    type="date"
                    disabled={!canAssign}
                    value={weldingAssignedDate}
                    onChange={(e) => setWeldingAssignedDate(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-[#151c27] focus:border-[#004ac6] outline-none disabled:bg-slate-100 font-mono text-[12px]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#434655] uppercase tracking-wider mb-1.5">
                    Fecha de Finalización
                  </label>
                  <input
                    type="date"
                    disabled={!canAssign || weldingStatus !== 'Completado'}
                    value={weldingCompletedDate}
                    onChange={(e) => setWeldingCompletedDate(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-[#151c27] focus:border-[#004ac6] outline-none disabled:bg-slate-100 font-mono text-[12px]"
                  />
                </div>
              </div>

              {/* Reassignment reason if changed */}
              {isWelderReassignment && (
                <div>
                  <label className="block text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-1.5">
                    Motivo de la Reasignación <span className="text-red-500">* (Requerido para auditoría)</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!canReassign}
                    placeholder="Ej: Cambio por ausencia justificada / redistribución de cargas de taller..."
                    value={weldingReassignReason}
                    onChange={(e) => setWeldingReassignReason(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-amber-300 rounded-lg text-[#151c27] focus:border-[#004ac6] outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-[#434655] uppercase tracking-wider mb-1.5">
                  Notas / Especificaciones de Soldadura
                </label>
                <textarea
                  rows={2}
                  disabled={!canAssign}
                  placeholder="Ej: Soldadura de alma y patines según WPS-04, electrodo E7018, inspección visual preliminar aprobada."
                  value={weldingNotes}
                  onChange={(e) => setWeldingNotes(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#c3c6d7] rounded-lg text-[#151c27] focus:border-[#004ac6] outline-none resize-none disabled:bg-slate-100"
                />
              </div>
            </div>
          )}

          {/* TAB 2: PINTURA */}
          {activeTab === 'painting' && (
            <div className="space-y-4 animate-in fade-in">
              {isPainterReassignment && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-800 text-[12px] flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Alerta de Reasignación de Pintor:</span>
                    <span>
                      La viga ya contaba con el pintor <strong>{currentPiece?.painterName}</strong>. 
                      Al modificar la asignación se guardará constancia en el historial.
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-[#434655] uppercase tracking-wider mb-1.5">
                  Seleccionar Pintor Especializado
                </label>
                <select
                  disabled={!canAssign}
                  value={painterId}
                  onChange={(e) => setPainterId(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-[#151c27] focus:border-[#004ac6] outline-none disabled:bg-slate-100 font-semibold"
                >
                  <option value="">-- Sin pintor asignado --</option>
                  {activePainters.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.identification || p.id}) {p.status === 'Inactivo' ? ' - [INACTIVO/HISTÓRICO]' : ''}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-[#737686] mt-1 block">
                  * Solo se muestran contratistas tipo Pintor en estado <strong>Activo</strong>.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#434655] uppercase tracking-wider mb-1.5">
                    Estado de Pintura
                  </label>
                  <select
                    disabled={!canAssign}
                    value={paintingStatus}
                    onChange={(e) => setPaintingStatus(e.target.value as AssignmentWorkStatus)}
                    className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-[#151c27] focus:border-[#004ac6] outline-none font-semibold disabled:bg-slate-100"
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="Asignado">Asignado</option>
                    <option value="En proceso">En proceso</option>
                    <option value="Completado">Completado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#434655] uppercase tracking-wider mb-1.5">
                    Fecha de Asignación
                  </label>
                  <input
                    type="date"
                    disabled={!canAssign}
                    value={paintingAssignedDate}
                    onChange={(e) => setPaintingAssignedDate(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-[#151c27] focus:border-[#004ac6] outline-none disabled:bg-slate-100 font-mono text-[12px]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#434655] uppercase tracking-wider mb-1.5">
                    Fecha de Finalización
                  </label>
                  <input
                    type="date"
                    disabled={!canAssign || paintingStatus !== 'Completado'}
                    value={paintingCompletedDate}
                    onChange={(e) => setPaintingCompletedDate(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-[#151c27] focus:border-[#004ac6] outline-none disabled:bg-slate-100 font-mono text-[12px]"
                  />
                </div>
              </div>

              {/* Reassignment reason if changed */}
              {isPainterReassignment && (
                <div>
                  <label className="block text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-1.5">
                    Motivo de la Reasignación <span className="text-red-500">* (Requerido para auditoría)</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!canReassign}
                    placeholder="Ej: Cambio de cabina de pintura / retrabajo de imprimación..."
                    value={paintingReassignReason}
                    onChange={(e) => setPaintingReassignReason(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-amber-300 rounded-lg text-[#151c27] focus:border-[#004ac6] outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-[#434655] uppercase tracking-wider mb-1.5">
                  Notas / Especificaciones de Pintura
                </label>
                <textarea
                  rows={2}
                  disabled={!canAssign}
                  placeholder="Ej: Primer epóxico alto en sólidos 3 mils DFT, acabado poliuretano RAL 7035."
                  value={paintingNotes}
                  onChange={(e) => setPaintingNotes(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#c3c6d7] rounded-lg text-[#151c27] focus:border-[#004ac6] outline-none resize-none disabled:bg-slate-100"
                />
              </div>
            </div>
          )}

          {/* TAB 3: HISTORIAL DE CAMBIOS Y AUDITORÍA */}
          {activeTab === 'history' && (
            <div className="space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-[#434655] uppercase tracking-wider">
                  Historial de Cambios y Reasignaciones en la Viga
                </span>
                <span className="text-[11px] text-[#737686]">
                  {currentPiece?.assignmentHistory?.length || 0} registros guardados
                </span>
              </div>

              {(!currentPiece?.assignmentHistory || currentPiece.assignmentHistory.length === 0) ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-[#e2e8f8]">
                  <FileCheck2 className="w-8 h-8 text-[#737686] mx-auto mb-2 opacity-50" />
                  <p className="text-[13px] text-[#737686]">
                    No se han registrado modificaciones o reasignaciones previas para esta pieza.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1 divide-y divide-[#e2e8f8]">
                  {currentPiece.assignmentHistory.map((item) => (
                    <div key={item.id} className="pt-2 pb-2 text-[12px]">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#151c27] flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.process === 'Soldadura' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {item.process}
                          </span>
                          <span>{item.contractorName}</span>
                          <span className="text-[#737686] font-normal">({item.status})</span>
                        </span>
                        <span className="text-[#737686] font-mono text-[11px]">
                          {item.timestamp}
                        </span>
                      </div>

                      {item.previousContractorName && (
                        <p className="text-[11px] text-amber-700 mt-1">
                          Reemplazó a: <strong>{item.previousContractorName}</strong>
                        </p>
                      )}

                      {item.reason && (
                        <p className="text-[11px] text-[#434655] mt-0.5 italic">
                          Motivo: "{item.reason}"
                        </p>
                      )}

                      <div className="flex items-center gap-3 mt-1 text-[10px] text-[#737686]">
                        <span>Usuario: <strong>{item.changedBy}</strong></span>
                        {item.notes && <span>• Nota: {item.notes}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Traceability link notice */}
          <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl text-[11px] text-blue-900 flex items-start gap-2">
            <span className="material-symbols-outlined text-[16px] text-[#004ac6] shrink-0 mt-0.5">verified</span>
            <p>
              <strong>Sincronización Automática:</strong> Al guardar la asignación, la línea de tiempo de trazabilidad de la pieza y los registros en el módulo de QC se actualizarán de forma inmediata.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 px-6 border-t border-[#e2e8f8] bg-[#f9fafb] flex items-center justify-between">
          <span className="text-[12px] text-[#737686]">
            Viga actual: <strong className="font-mono text-[#151c27]">{currentPiece?.mark || 'Ninguna'}</strong>
          </span>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-white border border-[#c3c6d7] text-[#434655] hover:bg-slate-100 font-semibold text-[13px] rounded-lg transition-colors"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canAssign || !currentPiece}
              className="px-5 py-2 bg-[#004ac6] hover:bg-[#003896] text-white font-semibold text-[13px] rounded-lg shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Asignación</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
