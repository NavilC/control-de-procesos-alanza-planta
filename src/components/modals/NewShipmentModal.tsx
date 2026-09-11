import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Truck, 
  Plus, 
  ShieldCheck, 
  Mail, 
  Eye, 
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { Shipment, ShipmentRecipient, ShipmentEmailNotification } from '../../types';
import { getInvolvedRecipientsForShipment, buildShipmentEmailSubject } from '../../utils/shipmentEmail';
import { ShipmentEmailModal } from './ShipmentEmailModal';
import { playFeedbackSound } from '../../utils/audioFeedback';

const DISPATCH_COORDINATORS = [
  'Carlos Gómez (Coord. Despacho)',
  'Luis Martínez (Coord. Despacho)',
  'Ana Silva (Supervisora Despacho)',
  'Laura Méndez (Logística Despacho)'
];

export const NewShipmentModal: React.FC = () => {
  const { 
    isNewShipmentModalOpen, 
    setIsNewShipmentModalOpen, 
    addShipment, 
    projects, 
    pieces,
    users
  } = useApp();

  const [project, setProject] = useState(projects[0]?.name || 'Torre Mítica');
  const [manager, setManager] = useState(DISPATCH_COORDINATORS[0]);
  const [selectedPieces, setSelectedPieces] = useState<string[]>([]);

  // Email Notification settings
  const [sendEmailNotification, setSendEmailNotification] = useState<boolean>(true);
  const [recipientsList, setRecipientsList] = useState<ShipmentRecipient[]>([]);
  const [customEmailInput, setCustomEmailInput] = useState('');
  const [previewShipment, setPreviewShipment] = useState<Shipment | null>(null);

  // Filter pieces strictly assigned to the selected project
  const projectPieces = pieces.filter(p => 
    p.project && p.project.trim().toLowerCase() === project.trim().toLowerCase()
  );

  // Pieces liberated in QC (qcStatus === 'Aprobada')
  const qcApprovedPieces = projectPieces.filter(p => p.qcStatus === 'Aprobada');

  // Candidate pieces list to display (prioritize approved pieces of the project)
  const candidatePieces = qcApprovedPieces.length > 0 ? qcApprovedPieces : projectPieces;

  // Whenever the selected project changes, initialize selection with its QC approved pieces
  useEffect(() => {
    const currentProjectPieces = pieces.filter(p => 
      p.project && p.project.trim().toLowerCase() === project.trim().toLowerCase()
    );
    const approved = currentProjectPieces.filter(p => p.qcStatus === 'Aprobada');
    
    // Auto-select the project's QC approved pieces
    if (approved.length > 0) {
      setSelectedPieces(approved.map(p => p.mark));
    } else {
      setSelectedPieces(currentProjectPieces.map(p => p.mark));
    }
  }, [project, pieces]);

  // Update recipients list when project, coordinator, or selected pieces change
  useEffect(() => {
    const updatedRecipients = getInvolvedRecipientsForShipment({
      projectName: project,
      coordinatorName: manager,
      driverName: 'Conductor Asignado',
      carrier: 'Transporte de Despacho',
      projects,
      users,
      pieces: selectedPieces
    });
    setRecipientsList(updatedRecipients);
  }, [project, manager, projects, users, selectedPieces]);

  if (!isNewShipmentModalOpen) return null;

  const togglePieceSelection = (mark: string) => {
    if (selectedPieces.includes(mark)) {
      setSelectedPieces(prev => prev.filter(m => m !== mark));
    } else {
      setSelectedPieces(prev => [...prev, mark]);
    }
  };

  const selectAllProjectPieces = () => {
    setSelectedPieces(candidatePieces.map(p => p.mark));
  };

  const clearPieceSelection = () => {
    setSelectedPieces([]);
  };

  const toggleRecipientInclusion = (index: number) => {
    setRecipientsList(prev => prev.map((r, idx) => 
      idx === index ? { ...r, included: !r.included } : r
    ));
  };

  const handleAddCustomRecipient = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = customEmailInput.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) return;

    const newRec: ShipmentRecipient = {
      id: `custom-${Date.now()}`,
      name: cleanEmail.split('@')[0],
      email: cleanEmail,
      role: 'Destinatario Adicional (CC)',
      department: 'Supervisión / Cliente',
      included: true
    };

    setRecipientsList(prev => [...prev, newRec]);
    setCustomEmailInput('');
    playFeedbackSound('click');
  };

  const removeRecipient = (index: number) => {
    setRecipientsList(prev => prev.filter((_, idx) => idx !== index));
  };

  const buildCurrentShipmentPayload = (): Shipment => {
    const shipmentId = `ENV-${Math.floor(10000 + Math.random() * 90000).toString().substring(0, 5)}`;
    const activeRecipients = recipientsList.filter(r => r.included !== false);

    // Calculate real weight of selected pieces
    const selectedPiecesData = pieces.filter(p => selectedPieces.includes(p.mark));
    const calculatedWeightKg = selectedPiecesData.reduce((acc, curr) => acc + (Number(curr.weightKg) || 0), 0);
    const totalWeightTons = calculatedWeightKg > 0 
      ? Number((calculatedWeightKg / 1000).toFixed(2))
      : Number((selectedPieces.length * 0.85).toFixed(1)) || 1.5;

    const emailNotification: ShipmentEmailNotification | undefined = sendEmailNotification ? {
      sentAt: new Date().toLocaleString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      subject: buildShipmentEmailSubject(shipmentId, project),
      recipients: activeRecipients,
      status: 'Enviado',
      bodySummary: `Despacho ${shipmentId} hacia ${project}. Notificados: ${activeRecipients.map(r => r.name).join(', ')}.`
    } : undefined;

    return {
      id: shipmentId,
      project,
      date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
      piecesCount: selectedPieces.length,
      totalWeightTons,
      carrier: 'Transporte de Despacho',
      dispatchDepartment: 'Dpto. de Despacho ALANZA',
      dispatchUnit: 'Transporte de Despacho',
      manager,
      driverName: 'Conductor Asignado',
      truckPlates: '',
      destination: `Sitio ${project}`,
      status: 'En preparación',
      pieces: selectedPieces,
      emailNotification
    };
  };

  const handleOpenPreview = () => {
    playFeedbackSound('click');
    const preview = buildCurrentShipmentPayload();
    setPreviewShipment(preview);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newShip = buildCurrentShipmentPayload();
    addShipment(newShip);
    setIsNewShipmentModalOpen(false);
  };

  const includedRecipientsCount = recipientsList.filter(r => r.included !== false).length;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4">
        <div className="bg-white rounded-2xl max-w-xl w-full border border-[#c3c6d7] shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[92vh]">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#e2e8f8] bg-[#f9fafb] flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#004ac6] flex items-center justify-center shadow-xs">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-[17px] text-[#151c27]">Manifiesto de Despacho</h3>
              </div>
            </div>
            <button
              onClick={() => setIsNewShipmentModalOpen(false)}
              className="text-[#737686] hover:text-[#151c27] p-1 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Scrollable */}
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-[13px]">
            {/* Dispatch notice banner */}
            <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-[12px] text-[#151c27] flex items-start gap-2.5 shadow-2xs">
              <ShieldCheck className="w-4.5 h-4.5 text-[#004ac6] shrink-0 mt-0.5" />
              <p className="leading-snug text-[#434655]">
                Al emitir el manifiesto, se registrará la remisión de carga y se notificará por correo electrónico a las personas involucradas.
              </p>
            </div>

            <form id="new-shipment-form" onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#434655] mb-1">Proyecto Destino</label>
                  <select
                    value={project}
                    onChange={(e) => setProject(e.target.value)}
                    className="w-full h-10 px-3 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-none font-medium text-[#151c27]"
                  >
                    {projects.map(pr => (
                      <option key={pr.id} value={pr.name}>{pr.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#434655] mb-1">Coordinador de Despacho</label>
                  <select
                    value={manager}
                    onChange={(e) => setManager(e.target.value)}
                    className="w-full h-10 px-3 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-none text-[12.5px] text-[#151c27]"
                  >
                    {DISPATCH_COORDINATORS.map(coord => (
                      <option key={coord} value={coord}>{coord}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pieces selection strictly filtered by project */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <div>
                    <label className="font-semibold text-[#434655] block">
                      Piezas a Cargar (Liberadas en QC)
                    </label>
                    <span className="text-[11px] text-[#555f6f]">
                      Asignadas al proyecto <strong>{project}</strong>: {candidatePieces.length} disponibles
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-[#004ac6] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      {selectedPieces.length} seleccionadas
                    </span>
                    {candidatePieces.length > 0 && (
                      <div className="flex items-center gap-1 text-[11px]">
                        <button
                          type="button"
                          onClick={selectAllProjectPieces}
                          className="text-[#004ac6] hover:underline font-semibold cursor-pointer"
                        >
                          Todas
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          type="button"
                          onClick={clearPieceSelection}
                          className="text-[#737686] hover:underline cursor-pointer"
                        >
                          Ninguna
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {candidatePieces.length === 0 ? (
                  <div className="p-4 text-center bg-[#f0f3ff] rounded-lg border border-dashed border-[#c3c6d7] text-[#555f6f] text-[12px]">
                    No se encontraron piezas registradas para el proyecto <strong>{project}</strong>.
                  </div>
                ) : (
                  <div className="p-2.5 bg-[#f0f3ff] rounded-lg border border-[#c3c6d7] flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                    {candidatePieces.map(pieceItem => {
                      const mark = pieceItem.mark;
                      const isSelected = selectedPieces.includes(mark);
                      const isApproved = pieceItem.qcStatus === 'Aprobada';
                      return (
                        <button
                          key={`${pieceItem.id || mark}-${pieceItem.project}`}
                          type="button"
                          onClick={() => togglePieceSelection(mark)}
                          title={`${pieceItem.type || 'Elemento'} ${pieceItem.profile || ''} - Peso: ${pieceItem.weightKg || 0} kg - QC: ${pieceItem.qcStatus}`}
                          className={`px-2.5 py-1.5 rounded-lg font-mono text-[11px] font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? 'bg-[#004ac6] text-white border-[#004ac6] shadow-2xs'
                              : 'bg-white text-[#151c27] border-[#c3c6d7] hover:bg-[#e2e8f8]'
                          }`}
                        >
                          <span>{mark}</span>
                          {pieceItem.profile && (
                            <span className={`text-[9.5px] font-sans font-normal opacity-80 ${isSelected ? 'text-blue-100' : 'text-[#555f6f]'}`}>
                              ({pieceItem.profile})
                            </span>
                          )}
                          {isApproved && (
                            <CheckCircle2 className={`w-3 h-3 ${isSelected ? 'text-blue-200' : 'text-emerald-600'}`} />
                          )}
                          {isSelected && <span className="font-sans font-bold text-white">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* NOTIFICACIÓN POR CORREO ELECTRÓNICO (PERSONAS INVOLUCRADAS) */}
              <div className="bg-gradient-to-br from-blue-50/90 to-indigo-50/70 border border-blue-200 rounded-xl p-3.5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#004ac6] text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[13.5px] text-[#151c27] flex items-center gap-1.5">
                        <span>Notificación por Correo Electrónico</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-[#004ac6] border border-blue-200">
                          Automático
                        </span>
                      </h4>
                      <p className="text-[11.5px] text-[#555f6f]">
                        Enviar correo a las personas involucradas (Residente, Despacho, QC y Conductor)
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={sendEmailNotification}
                      onChange={(e) => setSendEmailNotification(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#004ac6]"></div>
                  </label>
                </div>

                {sendEmailNotification && (
                  <div className="space-y-2.5 pt-2 border-t border-blue-200/80">
                    <div className="flex justify-between items-center">
                      <span className="text-[11.5px] font-bold text-[#434655] uppercase tracking-wide">
                        Personas Involucradas a Notificar ({includedRecipientsCount}):
                      </span>
                      <button
                        type="button"
                        onClick={handleOpenPreview}
                        className="text-[11.5px] text-[#004ac6] hover:text-[#2563eb] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Vista Previa del Correo</span>
                      </button>
                    </div>

                    {/* Recipients list chips */}
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {recipientsList.map((rec, idx) => {
                        const isInc = rec.included !== false;
                        return (
                          <div
                            key={rec.email}
                            className={`flex items-center justify-between p-2 rounded-lg border text-[12px] transition-colors ${
                              isInc 
                                ? 'bg-white border-blue-200 shadow-2xs' 
                                : 'bg-slate-100 border-slate-200 opacity-60'
                            }`}
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <input
                                type="checkbox"
                                checked={isInc}
                                onChange={() => toggleRecipientInclusion(idx)}
                                className="w-3.5 h-3.5 text-[#004ac6] rounded cursor-pointer"
                              />
                              <div className="truncate">
                                <div className="flex items-center gap-1.5">
                                  <strong className="text-[#151c27]">{rec.name}</strong>
                                  <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                    {rec.role}
                                  </span>
                                </div>
                                <div className="text-[11px] text-[#555f6f] font-mono truncate">
                                  {rec.email}
                                </div>
                              </div>
                            </div>

                            {rec.id?.startsWith('custom-') && (
                              <button
                                type="button"
                                onClick={() => removeRecipient(idx)}
                                className="text-red-500 hover:text-red-700 p-1 cursor-pointer shrink-0"
                                title="Quitar destinatario"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Add extra custom CC recipient */}
                    <div className="flex gap-1.5 pt-1">
                      <input
                        type="email"
                        value={customEmailInput}
                        onChange={(e) => setCustomEmailInput(e.target.value)}
                        placeholder="Agregar correo adicional (ej: cliente@constructora.com)..."
                        className="flex-1 h-8 px-2.5 bg-white border border-blue-200 rounded-lg text-[12px] text-[#151c27] outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomRecipient}
                        className="px-3 h-8 bg-white border border-[#004ac6] text-[#004ac6] hover:bg-blue-50 rounded-lg text-[11.5px] font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Agregar CC</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Footer Action Bar */}
          <div className="p-3.5 sm:p-4 border-t border-[#e2e8f8] bg-[#f9fafb] flex justify-between items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsNewShipmentModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#151c27] rounded-lg font-medium cursor-pointer"
            >
              Cancelar
            </button>
            <div className="flex items-center gap-2">
              {sendEmailNotification && (
                <button
                  type="button"
                  onClick={handleOpenPreview}
                  className="px-3.5 py-2 bg-white border border-[#c3c6d7] text-[#151c27] hover:bg-[#f0f3ff] rounded-lg font-semibold text-[13px] flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Eye className="w-4 h-4 text-[#004ac6]" />
                  <span>Ver Correo</span>
                </button>
              )}
              <button
                type="submit"
                form="new-shipment-form"
                disabled={selectedPieces.length === 0}
                className={`px-5 py-2 font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors ${
                  selectedPieces.length === 0 
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-[#004ac6] hover:bg-[#2563eb] text-white cursor-pointer'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>Emitir Manifiesto & Enviar Correo</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Email Preview Modal */}
      {previewShipment && (
        <ShipmentEmailModal
          shipment={previewShipment}
          onClose={() => setPreviewShipment(null)}
        />
      )}
    </>
  );
};
