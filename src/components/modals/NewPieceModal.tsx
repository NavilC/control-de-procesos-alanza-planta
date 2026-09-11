import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Layers, Plus, Compass, Settings2, Info } from 'lucide-react';
import { Piece, ElementType } from '../../types';

export const ELEMENT_TYPE_OPTIONS: ElementType[] = [
  'Columna',
  'Viga',
  'Joist',
  'Tijera',
  'SangRods',
  'Punta roscada',
  'Pernos',
  'Placa',
  'Cajón de canaleta / Canaleta'
];

export const NewPieceModal: React.FC = () => {
  const { 
    isNewPieceModalOpen, 
    setIsNewPieceModalOpen, 
    addPiece, 
    projects 
  } = useApp();

  const [mark, setMark] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ElementType>('Viga');
  const [profile, setProfile] = useState('W18x130');
  const [lengthMeters, setLengthMeters] = useState(12.0);
  const [weightKg, setWeightKg] = useState(850);
  const [project, setProject] = useState(projects[0]?.name || 'Torre Mítica');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  // Dynamic fields per element type
  // Joist
  const [camberMm, setCamberMm] = useState<string>('');

  // Punta roscada
  const [rodLengthMm, setRodLengthMm] = useState<string>('');
  const [threadLengthMm, setThreadLengthMm] = useState<string>('');

  // Pernos
  const [boltLengthMm, setBoltLengthMm] = useState<string>('');
  const [threadLength1Mm, setThreadLength1Mm] = useState<string>('');
  const [threadLength2Mm, setThreadLength2Mm] = useState<string>('');

  // Placa
  const [plateWidthMm, setPlateWidthMm] = useState<string>('');
  const [plateHeightMm, setPlateHeightMm] = useState<string>('');
  const [holeDiameterMm, setHoleDiameterMm] = useState<string>('');

  if (!isNewPieceModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mark.trim()) return;

    // Format display dimensions based on element type
    let calculatedDimensions = `${Number(lengthMeters).toFixed(2)} m`;
    if (type === 'Placa') {
      const w = plateWidthMm || '0';
      const h = plateHeightMm || '0';
      calculatedDimensions = `${w} × ${h} mm${holeDiameterMm ? ` (Ø ${holeDiameterMm} mm)` : ''}`;
    } else if (type === 'Joist' && camberMm) {
      calculatedDimensions = `${Number(lengthMeters).toFixed(2)} m (CF: ${camberMm} mm)`;
    } else if (type === 'Punta roscada' && rodLengthMm) {
      calculatedDimensions = `L: ${rodLengthMm} mm${threadLengthMm ? ` / Rosca: ${threadLengthMm} mm` : ''}`;
    } else if (type === 'Pernos' && boltLengthMm) {
      calculatedDimensions = `L: ${boltLengthMm} mm${threadLength1Mm ? ` / R1: ${threadLength1Mm} mm` : ''}${threadLength2Mm ? ` / R2: ${threadLength2Mm} mm` : ''}`;
    }

    const newPiece: Piece = {
      id: `p-${Date.now()}`,
      mark: mark.trim(),
      description: description.trim() || undefined,
      type,
      profile: profile.trim() || (type === 'Placa' ? 'PL 1/2"' : type === 'Punta roscada' ? 'Varilla Ø 3/4" A36' : 'Estándar'),
      lengthMeters: type === 'Pernos' && boltLengthMm 
        ? (Number(boltLengthMm) / 1000) 
        : type === 'Placa' && plateHeightMm 
        ? (Number(plateHeightMm) / 1000) 
        : type === 'Punta roscada' && rodLengthMm
        ? (Number(rodLengthMm) / 1000)
        : (Number(lengthMeters) || 0),
      dimensions: calculatedDimensions,
      weightKg: Number(weightKg) || 0,
      quantity: Number(quantity) || 1,
      project,
      status: 'Fabricada',
      refId: '-',
      qcStatus: 'Pendiente',
      notes: notes.trim() || undefined,
      fabricationDate: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
      
      // Dynamic parameters stored independently
      camberMm: camberMm ? Number(camberMm) : undefined,
      rodLengthMm: rodLengthMm ? Number(rodLengthMm) : undefined,
      threadLengthMm: threadLengthMm ? Number(threadLengthMm) : undefined,
      boltLengthMm: boltLengthMm ? Number(boltLengthMm) : undefined,
      threadLength1Mm: threadLength1Mm ? Number(threadLength1Mm) : undefined,
      threadLength2Mm: threadLength2Mm ? Number(threadLength2Mm) : undefined,
      plateWidthMm: plateWidthMm ? Number(plateWidthMm) : undefined,
      plateHeightMm: plateHeightMm ? Number(plateHeightMm) : undefined,
      holeDiameterMm: holeDiameterMm ? Number(holeDiameterMm) : undefined,

      traceabilityTimeline: [
        {
          stage: 'Corte y Habilitado de Material',
          date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
          responsible: 'Taller Planta Central',
          location: 'Nave A-1',
          details: `Elemento ${mark.trim().toUpperCase()} (${type}) registrado en sistema.`
        }
      ]
    };

    addPiece(newPiece);
    setIsNewPieceModalOpen(false);
    setMark('');
    setDescription('');
    setCamberMm('');
    setRodLengthMm('');
    setThreadLengthMm('');
    setBoltLengthMm('');
    setThreadLength1Mm('');
    setThreadLength2Mm('');
    setPlateWidthMm('');
    setPlateHeightMm('');
    setHoleDiameterMm('');
    setNotes('');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-[#c3c6d7] shadow-2xl overflow-hidden animate-in zoom-in-95 p-6 space-y-4 my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[#e2e8f8] pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#004ac6]/10 flex items-center justify-center text-[#004ac6]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[17px] text-[#151c27]">Registrar Nueva Pieza Estructural</h3>
              <p className="text-[12px] text-[#555f6f]">Formulario dinámico según el tipo de elemento estructural</p>
            </div>
          </div>
          <button
            onClick={() => setIsNewPieceModalOpen(false)}
            className="text-[#737686] hover:text-[#151c27] p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-[13px] overflow-y-auto pr-1">
          {/* Section: Identificación & Tipo de elemento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#434655] mb-1">
                Marca / Identificador <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                value={mark}
                onChange={(e) => setMark(e.target.value)}
                placeholder="Ej: 2S-37A, J-12, PL-01"
                className="w-full h-10 px-3 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-hidden focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6] font-mono uppercase text-[13px] font-bold"
              />
            </div>

            {/* SECCIÓN 1: Tipo de elemento */}
            <div className="bg-[#f0f3ff] p-2.5 rounded-xl border border-[#cbe0ff]">
              <label className="block font-bold text-[#004ac6] mb-1 flex items-center gap-1.5 text-[12px]">
                <Settings2 className="w-4 h-4 text-[#004ac6]" />
                <span>Tipo de elemento <span className="text-red-500">*</span></span>
              </label>
              <select
                value={type}
                onChange={(e) => {
                  const newType = e.target.value as ElementType;
                  setType(newType);
                  if (newType === 'Placa' && (profile === 'W18x130' || !profile)) {
                    setProfile('PL 1/2"');
                  } else if (newType === 'Punta roscada' && (profile === 'W18x130' || !profile)) {
                    setProfile('Varilla Ø 3/4" A36');
                  }
                }}
                className="w-full h-9 px-3 bg-white border border-[#c3c6d7] rounded-lg outline-hidden focus:border-[#004ac6] font-semibold text-[13px] text-[#151c27]"
              >
                {ELEMENT_TYPE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#434655] mb-1">Descripción</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Viga principal de cubierta, Joist secundario eje B..."
              className="w-full h-9 px-3 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-hidden focus:border-[#004ac6] text-[13px]"
            />
          </div>

          {/* SECCIÓN 2: Campos específicos dinámicos por tipo de elemento */}
          {type === 'Joist' && (
            <div className="p-3.5 bg-blue-50/80 border-2 border-blue-200 rounded-xl space-y-2 animate-in fade-in-50">
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
                      type="number"
                      step="0.1"
                      min="0"
                      value={camberMm}
                      onChange={(e) => setCamberMm(e.target.value)}
                      placeholder="Ej: 25"
                      className="w-full h-9 pl-3 pr-10 bg-white border border-blue-300 rounded-lg outline-hidden focus:ring-2 focus:ring-[#004ac6] font-mono font-bold text-[#004ac6]"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-[#555f6f]">
                      mm
                    </span>
                  </div>
                  <span className="text-[10px] text-[#555f6f] mt-0.5 block">Ejemplo técnico: 25 mm</span>
                </div>
                <div className="text-[11px] text-[#555f6f] bg-white p-2.5 rounded-lg border border-blue-100 flex items-start gap-1.5">
                  <Info className="w-4 h-4 text-[#004ac6] shrink-0 mt-0.5" />
                  <span>El valor de contra flecha quedará registrado permanentemente en la ficha técnica y trazabilidad de control de calidad.</span>
                </div>
              </div>
            </div>
          )}

          {type === 'Pernos' && (
            <div className="p-3.5 bg-purple-50/80 border-2 border-purple-200 rounded-xl space-y-2 animate-in fade-in-50">
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
                      type="number"
                      step="1"
                      min="0"
                      value={boltLengthMm}
                      onChange={(e) => setBoltLengthMm(e.target.value)}
                      placeholder="Ej: 600"
                      className="w-full h-9 pl-2.5 pr-8 bg-white border border-purple-300 rounded-lg outline-hidden font-mono font-bold text-[#151c27]"
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
                      type="number"
                      step="1"
                      min="0"
                      value={threadLength1Mm}
                      onChange={(e) => setThreadLength1Mm(e.target.value)}
                      placeholder="Ej: 100"
                      className="w-full h-9 pl-2.5 pr-8 bg-white border border-purple-300 rounded-lg outline-hidden font-mono font-bold text-[#151c27]"
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
                      type="number"
                      step="1"
                      min="0"
                      value={threadLength2Mm}
                      onChange={(e) => setThreadLength2Mm(e.target.value)}
                      placeholder="Ej: 150"
                      className="w-full h-9 pl-2.5 pr-8 bg-white border border-purple-300 rounded-lg outline-hidden font-mono font-bold text-[#151c27]"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[#555f6f]">mm</span>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-[#555f6f]">Los tres valores se almacenan de manera independiente en el registro del perno.</p>
            </div>
          )}

          {/* General Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#434655] mb-1">Perfil de Acero / Calibre</label>
              <input
                type="text"
                value={profile}
                onChange={(e) => setProfile(e.target.value)}
                placeholder="W18x130, IPE 300, HSS, PL 1/2..."
                className="w-full h-9 px-3 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-hidden focus:border-[#004ac6] font-mono text-[13px]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#434655] mb-1">Proyecto Asignado</label>
              <select
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className="w-full h-9 px-3 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-hidden font-medium text-[13px]"
              >
                {projects.map(pr => (
                  <option key={pr.id} value={pr.name}>{pr.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dimensiones y Cantidades: Si es Placa o Punta roscada se reemplaza Longitud (m) por sus dimensiones específicas en mm */}
          {type === 'Placa' ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#434655] mb-1">
                    Ancho (mm) <span className="text-[#004ac6]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={plateWidthMm}
                      onChange={(e) => setPlateWidthMm(e.target.value)}
                      placeholder="Ej: 300"
                      className="w-full h-9 pl-3 pr-10 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-hidden focus:border-[#004ac6] font-mono text-[13px]"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-[#555f6f]">
                      mm
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#434655] mb-1">
                    Alto (mm) <span className="text-[#004ac6]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={plateHeightMm}
                      onChange={(e) => setPlateHeightMm(e.target.value)}
                      placeholder="Ej: 450"
                      className="w-full h-9 pl-3 pr-10 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-hidden focus:border-[#004ac6] font-mono text-[13px]"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-[#555f6f]">
                      mm
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#434655] mb-1">
                    Diámetro de perforación
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={holeDiameterMm}
                      onChange={(e) => setHoleDiameterMm(e.target.value)}
                      placeholder="Ej: 22"
                      className="w-full h-9 pl-3 pr-10 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-hidden focus:border-[#004ac6] font-mono text-[13px]"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-[#555f6f]">
                      mm
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#434655] mb-1">Peso (kg)</label>
                  <input
                    type="number"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full h-9 px-3 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-hidden font-mono text-[13px]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#434655] mb-1">Cantidad</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full h-9 px-3 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-hidden font-mono text-[13px]"
                  />
                </div>
              </div>
            </div>
          ) : type === 'Punta roscada' ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#434655] mb-1">
                    Longitud (mm) <span className="text-[#004ac6]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={rodLengthMm}
                      onChange={(e) => setRodLengthMm(e.target.value)}
                      placeholder="Ej: 500"
                      className="w-full h-9 pl-3 pr-10 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-hidden focus:border-[#004ac6] font-mono text-[13px]"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-[#555f6f]">
                      mm
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#434655] mb-1">
                    Longitud de rosca (mm) <span className="text-[#004ac6]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={threadLengthMm}
                      onChange={(e) => setThreadLengthMm(e.target.value)}
                      placeholder="Ej: 100"
                      className="w-full h-9 pl-3 pr-10 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-hidden focus:border-[#004ac6] font-mono text-[13px]"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-[#555f6f]">
                      mm
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#434655] mb-1">Peso (kg)</label>
                  <input
                    type="number"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full h-9 px-3 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-hidden font-mono text-[13px]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#434655] mb-1">Cantidad</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full h-9 px-3 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-hidden font-mono text-[13px]"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className={`grid ${type === 'Pernos' ? 'grid-cols-2' : 'grid-cols-3'} gap-3`}>
              {type !== 'Pernos' && (
                <div>
                  <label className="block font-semibold text-[#434655] mb-1">Longitud (m)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={lengthMeters}
                    onChange={(e) => setLengthMeters(Number(e.target.value))}
                    className="w-full h-9 px-3 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-hidden font-mono text-[13px]"
                  />
                </div>
              )}
              <div>
                <label className="block font-semibold text-[#434655] mb-1">Peso (kg)</label>
                <input
                  type="number"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full h-9 px-3 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-hidden font-mono text-[13px]"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#434655] mb-1">Cantidad</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full h-9 px-3 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-hidden font-mono text-[13px]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-semibold text-[#434655] mb-1">Observaciones</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas técnicas de fabricación, tratamiento superficial o tolerancias..."
              className="w-full p-2.5 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-hidden focus:border-[#004ac6] text-[12px] resize-none"
            />
          </div>

          {/* Footer Controls */}
          <div className="flex justify-end gap-2 pt-3 border-t border-[#e2e8f8]">
            <button
              type="button"
              onClick={() => setIsNewPieceModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#151c27] rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#004ac6] hover:bg-[#2563eb] text-white font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Guardar Pieza</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
