import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  FileText, 
  UserCheck, 
  Ruler, 
  Paintbrush, 
  Scale, 
  Sparkles, 
  Copy, 
  RotateCcw,
  Check,
  Scissors,
  Plus,
  Trash2,
  HelpCircle
} from 'lucide-react';
import { playFeedbackSound } from '../../utils/audioFeedback';

export const QCInspectionModal: React.FC = () => {
  const { selectedInspectionForQC, setSelectedInspectionForQC, submitQCInspection, pieces } = useApp();

  if (!selectedInspectionForQC) return null;

  return (
    <QCInspectionModalContent 
      key={selectedInspectionForQC.id} 
      inspection={selectedInspectionForQC}
      onClose={() => setSelectedInspectionForQC(null)}
      onSubmit={submitQCInspection}
      pieces={pieces}
    />
  );
};

interface QCInspectionModalContentProps {
  inspection: any;
  onClose: () => void;
  onSubmit: (id: string, status: any, notes: string, inspector: string, qcData?: any) => void;
  pieces: any[];
}

const QCInspectionModalContent: React.FC<QCInspectionModalContentProps> = ({
  inspection: insp,
  onClose,
  onSubmit,
  pieces
}) => {
  const relatedPiece = useMemo(() => {
    return pieces.find(p => p.mark === insp.pieceMark);
  }, [pieces, insp.pieceMark]);

  // Nominal / Drawing Length (m)
  const nominalLength = useMemo(() => {
    if (insp.nominalLengthMeters && Number(insp.nominalLengthMeters) > 0) {
      return Number(insp.nominalLengthMeters);
    }
    if (relatedPiece?.lengthMeters && Number(relatedPiece.lengthMeters) > 0) {
      return Number(relatedPiece.lengthMeters);
    }
    return 6.000;
  }, [insp.nominalLengthMeters, relatedPiece?.lengthMeters]);

  // Initial values from inspection or piece
  const initialMeasuredLength = useMemo(() => {
    if (insp.measuredLengthMeters !== undefined && insp.measuredLengthMeters !== null) {
      return String(insp.measuredLengthMeters);
    }
    if (relatedPiece?.measuredLengthMeters !== undefined && relatedPiece?.measuredLengthMeters !== null) {
      return String(relatedPiece.measuredLengthMeters);
    }
    return '';
  }, [insp.measuredLengthMeters, relatedPiece?.measuredLengthMeters]);

  const initialPaintSamples = useMemo(() => {
    const existing = insp.paintSamples || relatedPiece?.paintSamples;
    if (Array.isArray(existing) && existing.length === 4) {
      return [
        existing[0] !== null && existing[0] !== undefined ? String(existing[0]) : '',
        existing[1] !== null && existing[1] !== undefined ? String(existing[1]) : '',
        existing[2] !== null && existing[2] !== undefined ? String(existing[2]) : '',
        existing[3] !== null && existing[3] !== undefined ? String(existing[3]) : ''
      ] as [string, string, string, string];
    }
    return ['', '', '', ''] as [string, string, string, string];
  }, [insp.paintSamples, relatedPiece?.paintSamples]);

  // States
  const [status, setStatus] = useState<'Aprobada' | 'Rechazada' | 'Con Observaciones'>(
    insp.qcStatus && insp.qcStatus !== 'Pendiente' ? insp.qcStatus : 'Aprobada'
  );
  const [inspectorName, setInspectorName] = useState(
    insp.inspector && insp.inspector !== '-' ? insp.inspector : 'Ing. Ana Gómez'
  );
  const [notes, setNotes] = useState(insp.notes || '');
  
  // Length measurement states
  const [measuredLengthInput, setMeasuredLengthInput] = useState<string>(initialMeasuredLength);
  const [lengthInputUnit, setLengthInputUnit] = useState<'m' | 'mm'>('m');

  // Paint thickness measurements (4 samples)
  const [paintSamples, setPaintSamples] = useState<[string, string, string, string]>(initialPaintSamples);
  const [paintUnit, setPaintUnit] = useState<'mils' | 'µm'>(insp.paintUnit || relatedPiece?.paintUnit || 'mils');

  // Technical Acceptance Criteria Checklists
  const [dimensionCheck, setDimensionCheck] = useState(
    insp.checklist?.dimensionalCheck ?? true
  );
  const [weldCheck, setWeldCheck] = useState(
    insp.checklist?.visualWelding ?? true
  );
  const [paintCheck, setPaintCheck] = useState(
    insp.checklist?.coatingThickness ?? true
  );

  // Estados para Pieza con corte y consultas adicionales
  const initialHasCuts = useMemo(() => {
    return Boolean(
      insp.hasCuts ?? 
      relatedPiece?.hasCuts ?? 
      (Array.isArray(insp.cuts) && insp.cuts.length > 0) ?? 
      (Array.isArray(relatedPiece?.cuts) && relatedPiece.cuts.length > 0)
    );
  }, [insp.hasCuts, relatedPiece?.hasCuts, insp.cuts, relatedPiece?.cuts]);

  const [hasCuts, setHasCuts] = useState<boolean>(initialHasCuts);

  // Inicializar lista de cortes
  const initialCutsList = useMemo(() => {
    const existing = insp.cuts || relatedPiece?.cuts;
    if (Array.isArray(existing) && existing.length > 0) {
      return existing.map((c: any, idx: number) => ({
        id: c.id || `cut-${idx + 1}`,
        cutNumber: c.cutNumber || (idx + 1),
        lengthInput: c.unit === 'mm' 
          ? String(Math.round(c.lengthMeters * 1000))
          : String(c.lengthMeters ?? ''),
        unit: (c.unit || 'm') as 'm' | 'mm',
        notes: c.notes || ''
      }));
    }
    return [
      { id: 'cut-1', cutNumber: 1, lengthInput: '', unit: 'm' as 'm' | 'mm', notes: '' }
    ];
  }, [insp.cuts, relatedPiece?.cuts]);

  const [cuts, setCuts] = useState(initialCutsList);

  const initialHasSecondCut = useMemo(() => {
    return Boolean(
      insp.hasAdditionalCut ?? 
      relatedPiece?.hasAdditionalCut ?? 
      (initialCutsList.length > 1 && Boolean(initialCutsList[1]?.lengthInput))
    );
  }, [insp.hasAdditionalCut, relatedPiece?.hasAdditionalCut, initialCutsList]);

  const [hasSecondCut, setHasSecondCut] = useState<boolean>(initialHasSecondCut);

  // Manejador para toggle del segundo corte
  const handleToggleSecondCut = (checked: boolean) => {
    playFeedbackSound('click');
    setHasSecondCut(checked);
    if (checked) {
      if (cuts.length < 2) {
        setCuts(prev => [
          ...prev,
          { id: `cut-${prev.length + 1}`, cutNumber: prev.length + 1, lengthInput: '', unit: 'm', notes: '' }
        ]);
      }
    }
  };

  // Manejador para actualizar longitud, unidad o notas de un corte
  const handleUpdateCut = (index: number, field: string, value: string) => {
    setCuts(prev => {
      const copy = [...prev];
      if (!copy[index]) return prev;
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Manejador para agregar otro corte adicional (3, 4, ...)
  const handleAddAdditionalCut = () => {
    playFeedbackSound('click');
    setCuts(prev => [
      ...prev,
      { id: `cut-${prev.length + 1}`, cutNumber: prev.length + 1, lengthInput: '', unit: 'm', notes: '' }
    ]);
  };

  // Manejador para eliminar corte adicional
  const handleRemoveCut = (index: number) => {
    playFeedbackSound('click');
    setCuts(prev => {
      const filtered = prev.filter((_, i) => i !== index);
      const renumbered = filtered.map((c, i) => ({ ...c, cutNumber: i + 1 }));
      if (renumbered.length <= 1) {
        setHasSecondCut(false);
      }
      return renumbered.length > 0 ? renumbered : [{ id: 'cut-1', cutNumber: 1, lengthInput: '', unit: 'm', notes: '' }];
    });
  };

  // Parsear datos numéricos de cortes
  const parsedCutsData = useMemo(() => {
    if (!hasCuts) return [];
    return cuts.map((c, idx) => {
      const trimmed = c.lengthInput.trim().replace(',', '.');
      const val = parseFloat(trimmed);
      const lengthMeters = !isNaN(val) && val > 0 
        ? (c.unit === 'mm' ? val / 1000 : val) 
        : null;
      return {
        ...c,
        cutNumber: idx + 1,
        lengthMeters
      };
    });
  }, [hasCuts, cuts]);

  const totalCutsLengthMeters = useMemo(() => {
    const valid = parsedCutsData.filter((c): c is typeof c & { lengthMeters: number } => c.lengthMeters !== null);
    if (valid.length === 0) return 0;
    return Math.round(valid.reduce((sum, c) => sum + c.lengthMeters, 0) * 1000) / 1000;
  }, [parsedCutsData]);

  // Parse measured length
  const measuredValMeters = useMemo(() => {
    const trimmed = measuredLengthInput.trim().replace(',', '.');
    const parsed = parseFloat(trimmed);
    if (isNaN(parsed) || parsed <= 0) return null;
    return lengthInputUnit === 'mm' ? parsed / 1000 : parsed;
  }, [measuredLengthInput, lengthInputUnit]);

  // Deviation in millimeters: (measured - nominal) * 1000
  const deviationMm = useMemo(() => {
    if (measuredValMeters === null || nominalLength <= 0) return null;
    return Math.round((measuredValMeters - nominalLength) * 1000 * 10) / 10;
  }, [measuredValMeters, nominalLength]);

  // AISC Tolerance Evaluation
  const aiscToleranceStatus = useMemo(() => {
    if (deviationMm === null) return null;
    const absDev = Math.abs(deviationMm);
    if (absDev === 0) {
      return { status: 'exact', label: 'Exacta (0 mm) - 100% Plano', color: 'emerald' };
    }
    if (absDev <= 3.2) {
      return { status: 'ideal', label: `Δ ${deviationMm > 0 ? '+' : ''}${deviationMm} mm (Tolerancia Óptima AISC ±3 mm)`, color: 'emerald' };
    }
    if (absDev <= 6.4) {
      return { status: 'accepted', label: `Δ ${deviationMm > 0 ? '+' : ''}${deviationMm} mm (Permitido por AISC ±6.4 mm)`, color: 'blue' };
    }
    return { status: 'exceeded', label: `Δ ${deviationMm > 0 ? '+' : ''}${deviationMm} mm (Excede Tolerancia Estándar AISC)`, color: 'amber' };
  }, [deviationMm]);

  // Paint statistics
  const numericPaintSamples = useMemo(() => {
    return paintSamples.map(s => {
      const trimmed = s.trim().replace(',', '.');
      const val = parseFloat(trimmed);
      return !isNaN(val) && val >= 0 ? val : null;
    });
  }, [paintSamples]);

  const validPaintSamplesCount = useMemo(() => {
    return numericPaintSamples.filter(s => s !== null).length;
  }, [numericPaintSamples]);

  const paintAverage = useMemo(() => {
    const valid = numericPaintSamples.filter((s): s is number => s !== null);
    if (valid.length === 0) return null;
    const sum = valid.reduce((a, b) => a + b, 0);
    return Math.round((sum / valid.length) * 100) / 100;
  }, [numericPaintSamples]);

  const paintMinMax = useMemo(() => {
    const valid = numericPaintSamples.filter((s): s is number => s !== null);
    if (valid.length === 0) return null;
    return {
      min: Math.min(...valid),
      max: Math.max(...valid)
    };
  }, [numericPaintSamples]);

  // Handle sample change
  const handleSampleChange = (index: number, val: string) => {
    const updated = [...paintSamples] as [string, string, string, string];
    updated[index] = val;
    setPaintSamples(updated);
  };

  // Quick helper to fill nominal length
  const handleCopyNominalLength = () => {
    playFeedbackSound('click');
    if (lengthInputUnit === 'mm') {
      setMeasuredLengthInput(String(Math.round(nominalLength * 1000)));
    } else {
      setMeasuredLengthInput(nominalLength.toFixed(3));
    }
  };

  // Quick helper to fill recommended standard paint samples
  const handleFillStandardPaint = () => {
    playFeedbackSound('click');
    if (paintUnit === 'mils') {
      setPaintSamples(['6.2', '6.5', '5.8', '6.4']);
    } else {
      setPaintSamples(['155', '165', '148', '162']);
    }
  };

  // Auto-generate technical summary note
  const handleInsertSummaryNote = () => {
    playFeedbackSound('click');
    const parts: string[] = [];
    if (measuredValMeters !== null) {
      const devStr = deviationMm !== null ? ` (Δ ${deviationMm > 0 ? '+' : ''}${deviationMm} mm)` : '';
      parts.push(`Longitud física verificada: ${measuredValMeters.toFixed(3)} m${devStr}`);
    }
    if (hasCuts) {
      const validCuts = parsedCutsData.filter((c): c is typeof c & { lengthMeters: number } => c.lengthMeters !== null);
      if (validCuts.length > 0) {
        const cutsStr = validCuts.map(c => `Corte ${c.cutNumber}: ${c.lengthMeters.toFixed(3)}m${c.notes ? ` (${c.notes})` : ''}`).join(', ');
        parts.push(`Pieza con corte [${cutsStr} | Total: ${totalCutsLengthMeters.toFixed(3)}m]`);
      }
    }
    if (paintAverage !== null) {
      parts.push(`EPS Pintura promedio: ${paintAverage.toFixed(2)} ${paintUnit} (${validPaintSamplesCount}/4 lecturas)`);
    }
    if (parts.length > 0) {
      const summary = parts.join(' | ') + '. ' + (notes ? notes : 'Conforme a especificación.');
      setNotes(summary);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playFeedbackSound('success');

    const finalCuts = hasCuts 
      ? parsedCutsData.filter((c): c is typeof c & { lengthMeters: number } => c.lengthMeters !== null).map(c => ({
          id: c.id,
          cutNumber: c.cutNumber,
          lengthMeters: c.lengthMeters,
          unit: c.unit,
          notes: c.notes || undefined
        }))
      : [];

    const qcData = {
      nominalLengthMeters: nominalLength,
      measuredLengthMeters: measuredValMeters ?? undefined,
      lengthDeviationMm: deviationMm ?? undefined,
      hasCuts,
      hasAdditionalCut: hasSecondCut,
      cuts: finalCuts,
      paintSamples: numericPaintSamples,
      paintAverageMils: paintAverage ?? undefined,
      paintUnit,
      checklist: {
        visualWelding: weldCheck,
        dimensionalCheck: dimensionCheck,
        coatingThickness: paintCheck,
      }
    };

    onSubmit(insp.id, status, notes, inspectorName, qcData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-2 sm:p-4 md:p-6 overflow-hidden">
      <div className="bg-white rounded-2xl w-full max-w-xl md:max-w-3xl lg:max-w-4xl border border-[#c3c6d7] shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[94vh] sm:max-h-[92vh]">
        {/* Pinned Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-3.5 border-b border-[#e2e8f8] bg-[#f9fafb] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#004ac6]/10 text-[#004ac6] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-[15px] sm:text-[17px] text-[#151c27]">
                  Hoja de Inspección y Liberación QC
                </h3>
                <span className="font-mono font-bold text-[12px] sm:text-[13px] px-2 py-0.5 bg-[#f0f3ff] text-[#004ac6] border border-[#c3c6d7]/60 rounded-md">
                  {insp.pieceMark}
                </span>
                {insp.qcStatus && insp.qcStatus !== 'Pendiente' && (
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                    insp.qcStatus === 'Aprobada' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                    insp.qcStatus === 'Rechazada' ? 'bg-red-50 text-red-700 border-red-300' :
                    'bg-amber-50 text-amber-700 border-amber-300'
                  }`}>
                    {insp.qcStatus}
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-[12px] text-[#555f6f] truncate mt-0.5">
                {insp.type} {insp.profile} • Proyecto: <strong className="text-[#151c27]">{insp.project}</strong>
                {relatedPiece?.dimensions && ` • Dimensiones: ${relatedPiece.dimensions}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#737686] hover:text-[#151c27] p-1.5 rounded-lg hover:bg-[#e2e8f8] transition-colors shrink-0 ml-2 cursor-pointer"
            title="Cerrar modal"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Container with Scrollable Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3.5 sm:p-5 md:p-6 space-y-4 text-[13px]">
            {/* Quick Summary Pill / Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-[#f0f3ff] rounded-xl border border-[#c3c6d7]/40 text-[12px]">
              <div>
                <span className="text-[10px] text-[#555f6f] uppercase font-bold block">Marca / Tipo</span>
                <span className="font-mono font-bold text-[#151c27] truncate block">{insp.pieceMark} ({insp.type})</span>
              </div>
              <div>
                <span className="text-[10px] text-[#555f6f] uppercase font-bold block">Perfil Estructural</span>
                <span className="font-semibold text-[#151c27] truncate block">{insp.profile}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#555f6f] uppercase font-bold block">Proyecto</span>
                <span className="font-semibold text-[#004ac6] truncate block">{insp.project}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#555f6f] uppercase font-bold block">Longitud Plano</span>
                <span className="font-mono font-bold text-[#151c27] block">
                  {nominalLength.toFixed(3)} m <span className="text-[10px] font-normal text-[#555f6f]">({Math.round(nominalLength * 1000)} mm)</span>
                </span>
              </div>
            </div>

            {/* SECCIÓN 1: CONTROL DIMENSIONAL DE LONGITUD (AISC) */}
            <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-[#e2e8f8] space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-[#004ac6] flex items-center justify-center shrink-0">
                    <Ruler className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#151c27] text-[13px]">
                      Control Dimensional: Longitud en Plano vs Físico
                    </h4>
                    <p className="text-[11px] text-[#555f6f]">
                      Tolerancia estándar AISC para corte y armado de vigas/columnas
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="text-[#555f6f]">Unidad de entrada:</span>
                  <div className="inline-flex rounded-lg border border-[#c3c6d7] p-0.5 bg-white">
                    <button
                      type="button"
                      onClick={() => setLengthInputUnit('m')}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                        lengthInputUnit === 'm' ? 'bg-[#004ac6] text-white shadow-2xs' : 'text-[#434655] hover:bg-slate-50'
                      }`}
                    >
                      Metros (m)
                    </button>
                    <button
                      type="button"
                      onClick={() => setLengthInputUnit('mm')}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                        lengthInputUnit === 'mm' ? 'bg-[#004ac6] text-white shadow-2xs' : 'text-[#434655] hover:bg-slate-50'
                      }`}
                    >
                      Milímetros (mm)
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid: Nominal Length vs Physical Input */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                {/* Longitud que tiene (Plano) */}
                <div className="sm:col-span-5 bg-white p-3 rounded-xl border border-[#c3c6d7]/70 shadow-2xs flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-bold text-[#737686] tracking-wider block mb-1">
                    Longitud que tiene (Plano / Diseño)
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[20px] font-mono font-bold text-[#151c27]">
                      {nominalLength.toFixed(3)}
                    </span>
                    <span className="text-[12px] font-semibold text-[#555f6f]">metros</span>
                    <span className="text-[11px] text-[#004ac6] font-mono bg-blue-50 px-1.5 py-0.5 rounded ml-auto">
                      {Math.round(nominalLength * 1000)} mm
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] text-[#555f6f] flex items-center justify-between">
                    <span>Tolerancia esperada: ±3 a ±6 mm</span>
                    <button
                      type="button"
                      onClick={handleCopyNominalLength}
                      className="text-[#004ac6] hover:text-[#2563eb] text-[11px] font-semibold inline-flex items-center gap-1 hover:underline cursor-pointer"
                      title="Copiar longitud teórica al campo físico"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copiar a físico</span>
                    </button>
                  </div>
                </div>

                {/* Longitud detectada en físico */}
                <div className="sm:col-span-7 bg-white p-3 rounded-xl border border-[#c3c6d7]/70 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase font-bold text-[#004ac6] tracking-wider block">
                      Longitud Detectada en Físico ({lengthInputUnit}) <span className="text-red-500">*</span>
                    </label>
                    {measuredValMeters !== null && (
                      <span className="text-[11px] font-mono text-[#555f6f]">
                        Equivale a: <strong>{measuredValMeters.toFixed(3)} m</strong> ({Math.round(measuredValMeters * 1000)} mm)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={measuredLengthInput}
                        onChange={(e) => setMeasuredLengthInput(e.target.value)}
                        placeholder={lengthInputUnit === 'm' ? nominalLength.toFixed(3) : String(Math.round(nominalLength * 1000))}
                        className="w-full h-10 px-3 font-mono text-[14px] font-bold bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-hidden focus:border-[#004ac6] focus:bg-white transition-colors"
                      />
                      <span className="absolute right-3 top-2.5 text-[12px] font-semibold text-[#737686] pointer-events-none">
                        {lengthInputUnit}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyNominalLength}
                      className="h-10 px-3 bg-slate-100 hover:bg-[#e2e8f8] text-[#151c27] text-[12px] font-semibold rounded-lg border border-[#c3c6d7] transition-colors shrink-0 cursor-pointer"
                      title="Copiar valor exacto de plano"
                    >
                      Exacta
                    </button>
                  </div>

                  {/* Realtime Deviation Badge */}
                  {aiscToleranceStatus ? (
                    <div className={`p-2 rounded-lg border text-[11px] font-medium flex items-center justify-between ${
                      aiscToleranceStatus.color === 'emerald' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' :
                      aiscToleranceStatus.color === 'blue' ? 'bg-blue-50 text-blue-900 border-blue-200' :
                      'bg-amber-50 text-amber-900 border-amber-200'
                    }`}>
                      <span className="flex items-center gap-1.5 font-semibold">
                        {aiscToleranceStatus.color === 'emerald' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> :
                         aiscToleranceStatus.color === 'blue' ? <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" /> :
                         <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                        <span>{aiscToleranceStatus.label}</span>
                      </span>
                      <span className="font-mono font-bold">
                        {deviationMm !== null && (deviationMm === 0 ? 'Δ 0.0 mm' : `${deviationMm > 0 ? '+' : ''}${deviationMm} mm`)}
                      </span>
                    </div>
                  ) : (
                    <p className="text-[11px] text-[#737686] italic">
                      Ingrese la medición tomada con cinta métrica certificada o láser.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: PIEZA CON CORTE Y CORTES ADICIONALES */}
            <div className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
              hasCuts ? 'bg-amber-50/50 border-amber-300 shadow-xs' : 'bg-slate-50 border-[#e2e8f8]'
            } space-y-3`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={hasCuts}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setHasCuts(checked);
                      playFeedbackSound('click');
                      if (checked && cuts.length === 0) {
                        setCuts([{ id: 'cut-1', cutNumber: 1, lengthInput: '', unit: 'm', notes: '' }]);
                      }
                    }}
                    className="rounded text-amber-600 h-5 w-5 focus:ring-amber-500 cursor-pointer accent-amber-600"
                  />
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      hasCuts ? 'bg-amber-600 text-white shadow-2xs' : 'bg-amber-100 text-amber-800'
                    }`}>
                      <Scissors className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#151c27] text-[13px] sm:text-[14px]">
                          Pieza con corte
                        </span>
                        {hasCuts && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.2 rounded-full bg-amber-200 text-amber-900 border border-amber-300">
                            Corte Activo
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#555f6f] block">
                        Marque si la pieza estructural lleva corte longitudinal, destaje o inglete
                      </span>
                    </div>
                  </div>
                </label>

                {hasCuts && totalCutsLengthMeters > 0 && (
                  <div className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-950 flex items-center gap-1.5 shadow-2xs">
                    <span>Suma cortes:</span>
                    <strong className="text-[12px] text-amber-800">{totalCutsLengthMeters.toFixed(3)} m</strong>
                    <span className="text-[#737686] text-[10px]">({Math.round(totalCutsLengthMeters * 1000)} mm)</span>
                  </div>
                )}
              </div>

              {/* Contenido desplegable si "Pieza con corte" está activado */}
              {hasCuts && (
                <div className="pt-3 border-t border-amber-200/90 space-y-3.5 animate-in fade-in-50 duration-200">
                  {/* Corte 1 */}
                  <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-amber-300 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-amber-600 text-white font-bold text-[11px] flex items-center justify-center shadow-2xs">
                          1
                        </span>
                        <label className="font-bold text-[#151c27] text-[12px] sm:text-[13px]">
                          Longitud del Corte 1 ({cuts[0]?.unit || 'm'}) <span className="text-red-500">*</span>
                        </label>
                      </div>
                      <span className="text-[10px] text-[#555f6f] font-medium">Primer corte / seccionamiento</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                      <div className="sm:col-span-6 relative">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={cuts[0]?.lengthInput ?? ''}
                          onChange={(e) => handleUpdateCut(0, 'lengthInput', e.target.value)}
                          placeholder={cuts[0]?.unit === 'm' ? 'Ej: 1.250' : 'Ej: 1250'}
                          className="w-full h-10 px-3 font-mono text-[14px] font-bold bg-[#fef9ee] border border-amber-300 rounded-lg outline-hidden focus:border-amber-600 focus:bg-white transition-colors"
                        />
                        <div className="absolute right-1.5 top-1.5 inline-flex rounded-md border border-[#c3c6d7] p-0.5 bg-white text-[10px]">
                          <button
                            type="button"
                            onClick={() => handleUpdateCut(0, 'unit', 'm')}
                            className={`px-1.5 py-0.5 rounded font-semibold cursor-pointer transition-colors ${
                              (cuts[0]?.unit || 'm') === 'm' ? 'bg-amber-600 text-white' : 'text-[#434655] hover:bg-slate-50'
                            }`}
                          >
                            m
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateCut(0, 'unit', 'mm')}
                            className={`px-1.5 py-0.5 rounded font-semibold cursor-pointer transition-colors ${
                              cuts[0]?.unit === 'mm' ? 'bg-amber-600 text-white' : 'text-[#434655] hover:bg-slate-50'
                            }`}
                          >
                            mm
                          </button>
                        </div>
                      </div>

                      <div className="sm:col-span-6">
                        <input
                          type="text"
                          value={cuts[0]?.notes ?? ''}
                          onChange={(e) => handleUpdateCut(0, 'notes', e.target.value)}
                          placeholder="Referencia o ubicación (ej: Destaje patín, Bisel A, etc.)"
                          className="w-full h-10 px-3 text-[12px] bg-slate-50 border border-[#c3c6d7] rounded-lg outline-hidden focus:border-amber-600 focus:bg-white transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Consulta interactiva: ¿Lleva otro corte más? */}
                  <div className="p-3 bg-white rounded-xl border border-amber-300 shadow-2xs space-y-2.5">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-amber-600" />
                        <span className="font-bold text-[#151c27] text-[12px] sm:text-[13px]">
                          ¿Lleva otro corte más?
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleSecondCut(true)}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                            hasSecondCut 
                              ? 'bg-amber-600 text-white shadow-xs' 
                              : 'bg-slate-100 text-[#434655] hover:bg-slate-200 border border-slate-200'
                          }`}
                        >
                          Sí, lleva otro corte
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleSecondCut(false)}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                            !hasSecondCut 
                              ? 'bg-slate-700 text-white shadow-xs' 
                              : 'bg-slate-100 text-[#434655] hover:bg-slate-200 border border-slate-200'
                          }`}
                        >
                          No, solo un corte
                        </button>
                      </div>
                    </div>

                    {/* Formulario desplegable para el Corte 2 y adicionales */}
                    {hasSecondCut && (
                      <div className="pt-2.5 border-t border-amber-100 space-y-2.5 animate-in fade-in-50 duration-200">
                        {cuts.slice(1).map((cut, idx) => {
                          const cutIndex = idx + 1;
                          return (
                            <div key={cut.id} className="bg-amber-50/40 p-2.5 sm:p-3 rounded-lg border border-amber-200 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded-full bg-amber-700 text-white font-bold text-[11px] flex items-center justify-center">
                                    {cutIndex + 1}
                                  </span>
                                  <label className="font-bold text-[#151c27] text-[12px]">
                                    Longitud del Corte {cutIndex + 1} ({cut.unit || 'm'}) <span className="text-red-500">*</span>
                                  </label>
                                </div>
                                {cutIndex > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveCut(cutIndex)}
                                    className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                    title="Eliminar este corte adicional"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                                <div className="sm:col-span-6 relative">
                                  <input
                                    type="text"
                                    inputMode="decimal"
                                    value={cut.lengthInput}
                                    onChange={(e) => handleUpdateCut(cutIndex, 'lengthInput', e.target.value)}
                                    placeholder={cut.unit === 'm' ? 'Ej: 0.850' : 'Ej: 850'}
                                    className="w-full h-9 px-3 font-mono text-[13px] font-bold bg-white border border-amber-300 rounded-lg outline-hidden focus:border-amber-600 transition-colors"
                                  />
                                  <div className="absolute right-1.5 top-1.5 inline-flex rounded-md border border-[#c3c6d7] p-0.5 bg-white text-[10px]">
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateCut(cutIndex, 'unit', 'm')}
                                      className={`px-1.5 py-0.5 rounded font-semibold cursor-pointer transition-colors ${
                                        (cut.unit || 'm') === 'm' ? 'bg-amber-600 text-white' : 'text-[#434655] hover:bg-slate-50'
                                      }`}
                                    >
                                      m
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateCut(cutIndex, 'unit', 'mm')}
                                      className={`px-1.5 py-0.5 rounded font-semibold cursor-pointer transition-colors ${
                                        cut.unit === 'mm' ? 'bg-amber-600 text-white' : 'text-[#434655] hover:bg-slate-50'
                                      }`}
                                    >
                                      mm
                                    </button>
                                  </div>
                                </div>

                                <div className="sm:col-span-6">
                                  <input
                                    type="text"
                                    value={cut.notes}
                                    onChange={(e) => handleUpdateCut(cutIndex, 'notes', e.target.value)}
                                    placeholder="Referencia opcional (ej: Extremo B, destaje alma, etc.)"
                                    className="w-full h-9 px-3 text-[11px] bg-white border border-[#c3c6d7] rounded-lg outline-hidden focus:border-amber-600 transition-colors"
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={handleAddAdditionalCut}
                            className="text-[11px] font-semibold text-amber-800 hover:text-amber-950 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer border border-amber-300"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Agregar otro corte ({cuts.length + 1})</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Resumen dinámico y validación de cortes */}
                  {totalCutsLengthMeters > 0 && (
                    <div className="p-2.5 rounded-lg bg-amber-100 border border-amber-300 text-[11px] flex items-center justify-between flex-wrap gap-2 text-amber-950">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Scissors className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span>
                          {parsedCutsData.filter(c => c.lengthMeters !== null).length} corte(s) registrado(s): <strong>{totalCutsLengthMeters.toFixed(3)} m</strong> en total
                        </span>
                      </div>
                      {nominalLength > 0 && (
                        <span className="text-[10px] text-amber-900 font-mono">
                          Equivale al {Math.round((totalCutsLengthMeters / nominalLength) * 100)}% de la viga ({nominalLength.toFixed(3)} m)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* SECCIÓN 3: MEDICIÓN DE ESPESOR DE PINTURA (4 MUESTRAS - SSPC-PA 2) */}
            <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-[#e2e8f8] space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <Paintbrush className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#151c27] text-[13px]">
                      Espesor de Película Seca de Pintura (EPS / DFT)
                    </h4>
                    <p className="text-[11px] text-[#555f6f]">
                      Norma SSPC-PA 2 / ASTM D7091: Registro de 4 muestras representativas
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleFillStandardPaint}
                    className="text-[11px] text-[#004ac6] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    title="Llenar muestras sugeridas estándar"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Llenar estándar</span>
                  </button>

                  <div className="inline-flex rounded-lg border border-[#c3c6d7] p-0.5 bg-white text-[11px]">
                    <button
                      type="button"
                      onClick={() => setPaintUnit('mils')}
                      className={`px-2 py-0.5 rounded font-semibold transition-colors ${
                        paintUnit === 'mils' ? 'bg-purple-700 text-white shadow-2xs' : 'text-[#434655] hover:bg-slate-50'
                      }`}
                    >
                      mils (milésimas)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaintUnit('µm')}
                      className={`px-2 py-0.5 rounded font-semibold transition-colors ${
                        paintUnit === 'µm' ? 'bg-purple-700 text-white shadow-2xs' : 'text-[#434655] hover:bg-slate-50'
                      }`}
                    >
                      µm (micras)
                    </button>
                  </div>
                </div>
              </div>

              {/* 4 Muestras Inputs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[0, 1, 2, 3].map((idx) => {
                  const labelMap = [
                    'Muestra 1 (Patín Sup.)',
                    'Muestra 2 (Patín Inf.)',
                    'Muestra 3 (Alma / Web)',
                    'Muestra 4 (Extremo / Placa)'
                  ];
                  return (
                    <div key={idx} className="bg-white p-2.5 rounded-xl border border-[#c3c6d7]/70 shadow-2xs space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] uppercase font-bold text-[#555f6f] block truncate" title={labelMap[idx]}>
                          {labelMap[idx]}
                        </label>
                        <span className="text-[9px] font-mono text-[#737686] bg-slate-100 px-1 rounded">
                          #{idx + 1}
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={paintSamples[idx]}
                          onChange={(e) => handleSampleChange(idx, e.target.value)}
                          placeholder={paintUnit === 'mils' ? '6.0' : '150'}
                          className="w-full h-9 px-2.5 font-mono text-[13px] font-bold bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-hidden focus:border-purple-600 focus:bg-white transition-colors"
                        />
                        <span className="absolute right-2 top-2 text-[10px] font-semibold text-[#737686] pointer-events-none">
                          {paintUnit}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Estadísticas de Pintura en tiempo real */}
              <div className="p-3 bg-white rounded-xl border border-[#c3c6d7]/70 shadow-2xs flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#737686] block">
                      Promedio 4 Muestras:
                    </span>
                    <span className="text-[16px] font-mono font-bold text-purple-900">
                      {paintAverage !== null ? `${paintAverage.toFixed(2)} ${paintUnit}` : 'Sin datos'}
                    </span>
                  </div>

                  {paintMinMax && (
                    <div className="text-[11px] text-[#555f6f] pl-3 border-l border-[#e2e8f8]">
                      <div>Mínimo: <strong className="font-mono text-[#151c27]">{paintMinMax.min} {paintUnit}</strong></div>
                      <div>Máximo: <strong className="font-mono text-[#151c27]">{paintMinMax.max} {paintUnit}</strong></div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold border ${
                    validPaintSamplesCount === 4 ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                    validPaintSamplesCount > 0 ? 'bg-amber-50 text-amber-800 border-amber-300' :
                    'bg-slate-100 text-[#555f6f] border-[#c3c6d7]'
                  }`}>
                    {validPaintSamplesCount === 4 ? '✓ 4/4 Muestras tomadas' : `${validPaintSamplesCount}/4 Muestras`}
                  </span>

                  {paintAverage !== null && (
                    <span className="text-[11px] text-purple-700 bg-purple-50 px-2 py-1 rounded-full font-medium border border-purple-200">
                      {paintUnit === 'mils' 
                        ? (paintAverage >= 5.0 && paintAverage <= 9.0 ? 'Conforme (5.0 - 9.0 mils)' : 'Fuera de rango estándar')
                        : (paintAverage >= 125 && paintAverage <= 230 ? 'Conforme (125 - 230 µm)' : 'Fuera de rango estándar')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* SECCIÓN 3: CRITERIOS DE ACEPTACIÓN TÉCNICA & TRAZABILIDAD CONTRATISTAS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
              {/* Criterios de Aceptación Técnica */}
              <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-[#e2e8f8] space-y-2.5">
                <label className="block font-bold text-[#434655] uppercase text-[11px] tracking-wide flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#004ac6]" />
                  <span>Criterios de Aceptación Técnica</span>
                </label>
                <div className="space-y-2 text-[12px]">
                  <label className="flex items-start gap-2.5 cursor-pointer p-2 rounded-lg hover:bg-white transition-colors border border-transparent hover:border-[#e2e8f8]">
                    <input
                      type="checkbox"
                      checked={dimensionCheck}
                      onChange={(e) => setDimensionCheck(e.target.checked)}
                      className="rounded text-[#004ac6] h-4 w-4 mt-0.5 shrink-0 focus:ring-[#004ac6]"
                    />
                    <span className="text-[#151c27] leading-snug">
                      <strong>Tolerancias dimensionales AISC:</strong> Longitud, alabeo, diagonales y escuadra
                      {deviationMm !== null && Math.abs(deviationMm) <= 6.4 && (
                        <span className="ml-1 text-emerald-700 font-bold">(Verificado)</span>
                      )}
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer p-2 rounded-lg hover:bg-white transition-colors border border-transparent hover:border-[#e2e8f8]">
                    <input
                      type="checkbox"
                      checked={weldCheck}
                      onChange={(e) => setWeldCheck(e.target.checked)}
                      className="rounded text-[#004ac6] h-4 w-4 mt-0.5 shrink-0 focus:ring-[#004ac6]"
                    />
                    <span className="text-[#151c27] leading-snug">
                      <strong>Soldadura AWS D1.1:</strong> Inspección visual sin poros, socavaciones ni grietas
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer p-2 rounded-lg hover:bg-white transition-colors border border-transparent hover:border-[#e2e8f8]">
                    <input
                      type="checkbox"
                      checked={paintCheck}
                      onChange={(e) => setPaintCheck(e.target.checked)}
                      className="rounded text-[#004ac6] h-4 w-4 mt-0.5 shrink-0 focus:ring-[#004ac6]"
                    />
                    <span className="text-[#151c27] leading-snug">
                      <strong>Pintura SSPC-PA 2:</strong> Espesor de película seca uniforme y adherencia
                      {paintAverage !== null && (
                        <span className="ml-1 text-purple-700 font-bold">(Prom: {paintAverage} {paintUnit})</span>
                      )}
                    </span>
                  </label>
                </div>
              </div>

              {/* Trazabilidad Contratistas */}
              <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-[#e2e8f8] flex flex-col justify-between space-y-2.5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-[#434655] uppercase tracking-wide flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-[#004ac6]" />
                      <span>Trazabilidad de Contratistas</span>
                    </span>
                    <span className="text-[10px] text-[#555f6f] bg-white px-1.5 py-0.5 rounded border border-[#e2e8f8]">
                      QC Audit
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[12px]">
                    <div className="bg-white p-2.5 rounded-lg border border-[#e2e8f8]">
                      <span className="text-[10px] uppercase font-bold text-[#737686] block">Soldador</span>
                      <span className="font-semibold text-[#151c27] block truncate" title={relatedPiece?.welderName || 'Sin asignar'}>
                        {relatedPiece?.welderName || 'Sin asignar'}
                      </span>
                      <span className="text-[10px] text-[#555f6f] block mt-0.5">
                        Estado: <strong className="text-[#151c27]">{relatedPiece?.weldingStatus || 'Pendiente'}</strong>
                      </span>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-[#e2e8f8]">
                      <span className="text-[10px] uppercase font-bold text-[#737686] block">Pintor</span>
                      <span className="font-semibold text-[#151c27] block truncate" title={relatedPiece?.painterName || 'Sin asignar'}>
                        {relatedPiece?.painterName || 'Sin asignar'}
                      </span>
                      <span className="text-[10px] text-[#555f6f] block mt-0.5">
                        Estado: <strong className="text-[#151c27]">{relatedPiece?.paintingStatus || 'Pendiente'}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {relatedPiece?.assignmentHistory && relatedPiece.assignmentHistory.length > 0 ? (
                  <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                    <span>Elemento con <strong>{relatedPiece.assignmentHistory.length}</strong> reasignaciones en historial.</span>
                  </div>
                ) : (
                  <div className="text-[11px] text-emerald-800 bg-emerald-50/70 p-2 rounded-lg border border-emerald-200/80 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                    <span>Contratistas iniciales asignados correctamente.</span>
                  </div>
                )}
              </div>
            </div>

            {/* SECCIÓN 4: DICTAMEN FINAL DEL INSPECTOR */}
            <div>
              <label className="block font-bold text-[#434655] uppercase text-[11px] mb-2 tracking-wide">
                Dictamen Final del Inspector <span className="text-[#004ac6]">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    playFeedbackSound('click');
                    setStatus('Aprobada');
                  }}
                  className={`py-2.5 px-3 rounded-xl border font-semibold text-[13px] flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    status === 'Aprobada'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-500/20'
                      : 'bg-white border-[#c3c6d7] text-[#151c27] hover:bg-emerald-50/40 hover:border-emerald-300'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Aprobada</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playFeedbackSound('click');
                    setStatus('Con Observaciones');
                  }}
                  className={`py-2.5 px-3 rounded-xl border font-semibold text-[13px] flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    status === 'Con Observaciones'
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md ring-2 ring-amber-400/20'
                      : 'bg-white border-[#c3c6d7] text-[#151c27] hover:bg-amber-50/40 hover:border-amber-300'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Obs. Menor</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playFeedbackSound('click');
                    setStatus('Rechazada');
                  }}
                  className={`py-2.5 px-3 rounded-xl border font-semibold text-[13px] flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    status === 'Rechazada'
                      ? 'bg-[#ba1a1a] text-white border-[#ba1a1a] shadow-md ring-2 ring-red-500/20'
                      : 'bg-white border-[#c3c6d7] text-[#151c27] hover:bg-red-50/40 hover:border-red-300'
                  }`}
                >
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span>Rechazada</span>
                </button>
              </div>
            </div>

            {/* Inspector Name & Observaciones */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="block font-semibold text-[#434655] text-[12px] mb-1">
                  Inspector Firmante
                </label>
                <input
                  type="text"
                  value={inspectorName}
                  onChange={(e) => setInspectorName(e.target.value)}
                  placeholder="Nombre del inspector"
                  className="w-full h-9 px-3 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-hidden focus:border-[#004ac6] text-[13px]"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-[#434655] text-[12px]">
                    Observaciones / Registro de Medición
                  </label>
                  {(measuredValMeters !== null || paintAverage !== null) && (
                    <button
                      type="button"
                      onClick={handleInsertSummaryNote}
                      className="text-[11px] text-[#004ac6] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Insertar datos de medición en nota</span>
                    </button>
                  )}
                </div>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: Cumple con todas las especificaciones de plano. Listo para pintura y despacho."
                  className="w-full p-2.5 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-hidden focus:border-[#004ac6] text-[13px] resize-y min-h-[52px]"
                />
              </div>
            </div>
          </div>

          {/* Pinned Action Footer (Always visible) */}
          <div className="px-4 py-3 sm:px-6 sm:py-3.5 bg-slate-50 border-t border-[#e2e8f8] flex items-center justify-between gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-2 text-[12px]">
              <span className="text-[#555f6f] font-medium">Dictamen:</span>
              <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                status === 'Aprobada' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                status === 'Con Observaciones' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                'bg-red-100 text-red-800 border border-red-300'
              }`}>
                {status}
              </span>

              {measuredValMeters !== null && (
                <span className="text-[11px] font-mono text-[#555f6f] bg-white px-2 py-0.5 rounded border border-[#c3c6d7]">
                  L: {measuredValMeters.toFixed(3)}m
                </span>
              )}
              {paintAverage !== null && (
                <span className="text-[11px] font-mono text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  Pintura: {paintAverage.toFixed(2)} {paintUnit}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-initial px-4 py-2 bg-white border border-[#c3c6d7] hover:bg-slate-100 rounded-xl font-semibold text-[#151c27] text-[13px] transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 sm:flex-initial px-5 py-2 bg-[#004ac6] hover:bg-[#2563eb] text-white font-semibold rounded-xl text-[13px] shadow-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Registrar Dictamen QC</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
