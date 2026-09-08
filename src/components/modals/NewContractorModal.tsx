import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Contractor, ContractorType, ContractorStatus } from '../../types';
import { X, UserPlus, HardHat, Check, ShieldAlert, Phone, Mail, FileText, BadgeCheck } from 'lucide-react';
import { playFeedbackSound } from '../../utils/audioFeedback';

export const NewContractorModal: React.FC = () => {
  const { 
    isNewContractorModalOpen, 
    setIsNewContractorModalOpen, 
    editingContractor, 
    setEditingContractor,
    addContractor, 
    updateContractor,
    currentUserRole
  } = useApp();

  const [name, setName] = useState('');
  const [type, setType] = useState<ContractorType>('Soldador');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [identification, setIdentification] = useState('');
  const [status, setStatus] = useState<ContractorStatus>('Activo');
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const isEditing = !!editingContractor;
  const canModify = currentUserRole === 'Administrador';

  useEffect(() => {
    if (editingContractor) {
      setName(editingContractor.name);
      setType(editingContractor.type);
      setPhone(editingContractor.phone);
      setEmail(editingContractor.email);
      setIdentification(editingContractor.identification || '');
      setStatus(editingContractor.status);
      setNotes(editingContractor.notes || '');
      setErrorMessage('');
    } else {
      setName('');
      setType('Soldador');
      setPhone('');
      setEmail('');
      setIdentification('');
      setStatus('Activo');
      setNotes('');
      setErrorMessage('');
    }
  }, [editingContractor, isNewContractorModalOpen]);

  if (!isNewContractorModalOpen) return null;

  const handleClose = () => {
    playFeedbackSound('click');
    setIsNewContractorModalOpen(false);
    setEditingContractor(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!canModify) {
      setErrorMessage('Permiso denegado: Solo el Administrador puede crear o modificar contratistas.');
      playFeedbackSound('error');
      return;
    }

    if (!name.trim()) {
      setErrorMessage('El nombre del contratista es obligatorio.');
      playFeedbackSound('error');
      return;
    }

    if (!type) {
      setErrorMessage('Un contratista debe tener obligatoriamente un tipo (Soldador o Pintor).');
      playFeedbackSound('error');
      return;
    }

    if (!phone.trim()) {
      setErrorMessage('El teléfono de contacto es obligatorio.');
      playFeedbackSound('error');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Ingrese un correo electrónico válido.');
      playFeedbackSound('error');
      return;
    }

    if (isEditing && editingContractor) {
      updateContractor(editingContractor.id, {
        name: name.trim(),
        type,
        phone: phone.trim(),
        email: email.trim(),
        identification: identification.trim(),
        status,
        notes: notes.trim()
      });
    } else {
      addContractor({
        name: name.trim(),
        type,
        phone: phone.trim(),
        email: email.trim(),
        identification: identification.trim(),
        status,
        notes: notes.trim()
      });
    }

    playFeedbackSound('success');
    handleClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-[#c3c6d7] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#e2e8f8] bg-[#f9fafb] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#2563eb] text-white flex items-center justify-center shadow-sm">
              <HardHat className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[16px] text-[#151c27]">
                {isEditing ? `Editar Contratista: ${editingContractor?.id}` : 'Nuevo Contratista'}
              </h3>
              <p className="text-[12px] text-[#555f6f]">
                {isEditing 
                  ? 'Modifique los datos operativos del contratista.' 
                  : 'Registre un nuevo soldador o pintor para asignación de vigas.'}
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

        {/* Role Warning Banner if not Admin */}
        {!canModify && (
          <div className="mx-6 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5 text-[12px] text-amber-800">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
            <span>
              Su rol actual es <strong>{currentUserRole}</strong>. Para crear o editar contratistas se requiere rol <strong>Administrador</strong>.
            </span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-[13px]">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-[12px] flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Nombre */}
          <div>
            <label className="block text-[11px] font-bold text-[#434655] uppercase tracking-wider mb-1.5">
              Nombre Completo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              disabled={!canModify}
              placeholder="Ej: Juan Pérez / Carlos López"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 px-3.5 bg-white border border-[#c3c6d7] rounded-lg text-[#151c27] focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 outline-none transition-all disabled:bg-slate-100"
            />
          </div>

          {/* Tipo de Contratista (Obligatorio) */}
          <div>
            <label className="block text-[11px] font-bold text-[#434655] uppercase tracking-wider mb-1.5">
              Tipo de Contratista <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={!canModify}
                onClick={() => { playFeedbackSound('click'); setType('Soldador'); }}
                className={`py-2.5 px-3 rounded-xl border font-semibold text-[13px] flex items-center justify-center gap-2 transition-all ${
                  type === 'Soldador'
                    ? 'bg-[#eef2ff] border-[#004ac6] text-[#004ac6] ring-2 ring-[#004ac6]/20 shadow-xs'
                    : 'bg-white border-[#c3c6d7] text-[#555f6f] hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">build</span>
                <span>Soldador</span>
                {type === 'Soldador' && <Check className="w-4 h-4 text-[#004ac6]" />}
              </button>

              <button
                type="button"
                disabled={!canModify}
                onClick={() => { playFeedbackSound('click'); setType('Pintor'); }}
                className={`py-2.5 px-3 rounded-xl border font-semibold text-[13px] flex items-center justify-center gap-2 transition-all ${
                  type === 'Pintor'
                    ? 'bg-[#eef2ff] border-[#004ac6] text-[#004ac6] ring-2 ring-[#004ac6]/20 shadow-xs'
                    : 'bg-white border-[#c3c6d7] text-[#555f6f] hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">format_paint</span>
                <span>Pintor</span>
                {type === 'Pintor' && <Check className="w-4 h-4 text-[#004ac6]" />}
              </button>
            </div>
            <p className="text-[11px] text-[#737686] mt-1">
              * El tipo define el proceso en el que podrá ser asignado (Soldadura o Pintura).
            </p>
          </div>

          {/* Contacto: Teléfono y Correo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#434655] uppercase tracking-wider mb-1.5">
                Teléfono <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#737686]" />
                <input
                  type="text"
                  required
                  disabled={!canModify}
                  placeholder="+504 9999-9999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 bg-white border border-[#c3c6d7] rounded-lg text-[#151c27] focus:border-[#004ac6] outline-none disabled:bg-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#434655] uppercase tracking-wider mb-1.5">
                Correo Electrónico <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#737686]" />
                <input
                  type="email"
                  required
                  disabled={!canModify}
                  placeholder="ejemplo@metalhn.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 bg-white border border-[#c3c6d7] rounded-lg text-[#151c27] focus:border-[#004ac6] outline-none disabled:bg-slate-100"
                />
              </div>
            </div>
          </div>

          {/* Identificación y Estado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#434655] uppercase tracking-wider mb-1.5">
                Identificación / DNI
              </label>
              <input
                type="text"
                disabled={!canModify}
                placeholder="0801-1985-12345"
                value={identification}
                onChange={(e) => setIdentification(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-[#151c27] focus:border-[#004ac6] outline-none disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#434655] uppercase tracking-wider mb-1.5">
                Estado Operativo
              </label>
              <select
                disabled={!canModify}
                value={status}
                onChange={(e) => setStatus(e.target.value as ContractorStatus)}
                className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-[#151c27] focus:border-[#004ac6] outline-none disabled:bg-slate-100 font-semibold"
              >
                <option value="Activo">Activo (Disponible para asignaciones)</option>
                <option value="Inactivo">Inactivo (Oculto de nuevas asignaciones)</option>
              </select>
            </div>
          </div>

          {/* Observaciones / Calificaciones */}
          <div>
            <label className="block text-[11px] font-bold text-[#434655] uppercase tracking-wider mb-1.5">
              Observaciones y Certificaciones
            </label>
            <textarea
              rows={3}
              disabled={!canModify}
              placeholder="Ej: Certificación AWS D1.1 vigente, calificación 6G, aplicación airless SSPC/NACE..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 bg-white border border-[#c3c6d7] rounded-lg text-[#151c27] focus:border-[#004ac6] outline-none resize-none disabled:bg-slate-100"
            />
          </div>

          {/* Regulatory Note */}
          <div className="p-3 bg-slate-50 border border-[#e2e8f8] rounded-xl text-[11px] text-[#555f6f] flex items-start gap-2">
            <BadgeCheck className="w-4 h-4 text-[#004ac6] shrink-0 mt-0.5" />
            <p>
              <strong>Regla de Trazabilidad Alanza:</strong> Los contratistas inactivos no se eliminan físicamente para salvaguardar el historial de vigas fabricadas y liberaciones QC asociadas.
            </p>
          </div>

          {/* Footer actions */}
          <div className="pt-2 border-t border-[#e2e8f8] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-white border border-[#c3c6d7] text-[#434655] hover:bg-slate-100 font-semibold text-[13px] rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!canModify}
              className="px-5 py-2 bg-[#004ac6] hover:bg-[#003896] text-white font-semibold text-[13px] rounded-lg shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" />
              <span>{isEditing ? 'Guardar Cambios' : 'Registrar Contratista'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
