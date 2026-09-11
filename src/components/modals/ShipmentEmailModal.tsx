import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Mail, 
  Send, 
  Check, 
  Copy, 
  Truck, 
  Building2, 
  ShieldCheck, 
  User, 
  MapPin, 
  Calendar,
  Layers,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { Shipment, ShipmentRecipient } from '../../types';
import { playFeedbackSound } from '../../utils/audioFeedback';

interface ShipmentEmailModalProps {
  shipment: Shipment | null;
  onClose: () => void;
  onResend?: (shipment: Shipment) => void;
}

export const ShipmentEmailModal: React.FC<ShipmentEmailModalProps> = ({
  shipment,
  onClose,
  onResend
}) => {
  const { pieces, showToast, addAudit } = useApp();
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!shipment) return null;

  const emailData = shipment.emailNotification;
  const recipients: ShipmentRecipient[] = emailData?.recipients || [
    {
      name: shipment.project === 'Mhotivo' ? 'Jorge Ramírez' : 'Ing. Carlos Ruiz',
      email: shipment.project === 'Mhotivo' ? 'jramirez@alanza.com' : 'cruiz@alanza.com',
      role: 'Residente de Obra',
      department: 'Sitio de Obra / Campo',
      included: true
    },
    {
      name: shipment.manager || 'Carlos Gómez (Coord. Despacho)',
      email: 'cgomez@alanza.com',
      role: 'Coordinador de Despacho',
      department: 'Dpto. de Despacho ALANZA',
      included: true
    },
    {
      name: 'Ing. Ana Gómez',
      email: 'agomez@alanza.com',
      role: 'Inspector QC',
      department: 'Control de Calidad en Planta',
      included: true
    },
    {
      name: shipment.driverName || 'Roberto Mendoza',
      email: 'rmendoza.chofer@alanza.com',
      role: 'Conductor / Operador',
      department: shipment.carrier || 'Flota Interna',
      included: true
    },
    {
      name: 'Ing. Roberto Mendoza',
      email: 'rmendoza@alanza.com',
      role: 'Gerente de Planta',
      department: 'Operaciones & Fabricación',
      included: true
    }
  ];

  const subject = emailData?.subject || 
    `[DESPACHO ALANZA] Nuevo Envío ${shipment.id} en tránsito hacia ${shipment.project} - Manifiesto de Carga`;

  const sentDate = emailData?.sentAt || shipment.date || 'Hoy';

  // Lookup piece details
  const shipmentPieces = pieces.filter(p => shipment.pieces?.includes(p.mark) || p.refId === shipment.id);
  const piecesToDisplay = shipmentPieces.length > 0 ? shipmentPieces : (shipment.pieces || []).map(mark => ({
    id: mark,
    mark,
    type: mark.startsWith('C') ? 'Columna' : mark.startsWith('V') ? 'Viga' : 'Perfil Estructural',
    profile: mark.startsWith('C') ? 'W14x132' : 'W24x76',
    weightKg: 520,
    qcStatus: 'Aprobada'
  }));

  const handleCopy = () => {
    const textToCopy = `ASUNTO: ${subject}
DE: Departamento de Despacho ALANZA <despacho@alanza.com>
PARA: ${recipients.map(r => `${r.name} (${r.role}) <${r.email}>`).join(', ')}
FECHA: ${sentDate}

ESTIMADO EQUIPO DE OBRA Y LOGÍSTICA:
Se ha despachado el manifiesto ${shipment.id} con destino a ${shipment.project}.

DATOS DEL TRANSPORTE Y DESPACHO:
• Unidad: ${shipment.carrier}
• Conductor: ${shipment.driverName || 'Roberto Mendoza'}
• Coordinador de Despacho: ${shipment.manager}
• Destino: ${shipment.destination || shipment.project}
• Carga: ${shipment.piecesCount} piezas estructurales (${shipment.totalWeightTons} Toneladas)

PIEZAS DESPACHADAS:
${piecesToDisplay.map(p => `- Marca ${p.mark}: ${p.type} ${p.profile} (${p.weightKg} kg) - Estado QC: ${p.qcStatus || 'Aprobada'}`).join('\n')}

INSTRUCCIONES PARA RECEPCIÓN EN OBRA:
Al arribo del camión, favor de cotejar cada elemento físico e ingresar al módulo de Recepción en Campo para registrar novedades o firmar el acta digital de entrega.

Departamento de Despacho y Logística • ALANZA Construcción`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    playFeedbackSound('click');
    showToast('Contenido del correo copiado al portapapeles', 'info');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleResend = () => {
    setIsSending(true);
    playFeedbackSound('click');

    setTimeout(() => {
      setIsSending(false);
      setSentSuccess(true);
      playFeedbackSound('success');
      showToast(`Correo reenviado con éxito a ${recipients.length} personas involucradas`, 'success');
      addAudit('Reenvío de Correo', 'Envíos', `Correo de despacho reenviado para ${shipment.id} a ${recipients.map(r => r.email).join(', ')}`);

      if (onResend) {
        onResend(shipment);
      }

      setTimeout(() => setSentSuccess(false), 3500);
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#c3c6d7] shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh] sm:max-h-[85vh]">
        {/* Header Bar */}
        <div className="p-4 border-b border-[#e2e8f8] bg-[#f9fafb] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#004ac6] flex items-center justify-center shadow-xs">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[16px] text-[#151c27]">
                  Notificación por Correo Electrónico
                </h3>
                <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Enviado a Involucrados
                </span>
              </div>
              <p className="text-[12px] text-[#555f6f]">
                Copia digital enviada automáticamente al residente de obra, despacho, QC y chofer
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#737686] hover:text-[#151c27] p-1.5 rounded-lg hover:bg-[#e2e8f8] transition-colors cursor-pointer"
            title="Cerrar vista de correo"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Email Preview */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-[13px] bg-[#f4f6fb]">
          {/* Metadata Bar (Headers) */}
          <div className="bg-white rounded-xl p-4 border border-[#c3c6d7] shadow-2xs space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-[12.5px]">
              <span className="font-bold text-[#555f6f] w-16 shrink-0">De:</span>
              <span className="font-mono text-[#151c27] bg-[#f0f3ff] px-2 py-0.5 rounded border border-[#dbe4f9] text-[12px]">
                Departamento de Despacho ALANZA &lt;despacho@alanza.com&gt;
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2 text-[12.5px]">
              <span className="font-bold text-[#555f6f] w-16 shrink-0 pt-0.5">Para:</span>
              <div className="flex flex-wrap gap-1.5 flex-1">
                {recipients.map((rec) => (
                  <span
                    key={rec.email}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-[#151c27] border border-slate-300 shadow-2xs"
                    title={`${rec.name} • ${rec.role} (${rec.department || ''})`}
                  >
                    <User className="w-3 h-3 text-[#004ac6]" />
                    <strong className="text-[#151c27]">{rec.name}</strong>
                    <span className="text-[#555f6f]">({rec.role})</span>
                    <span className="text-[#004ac6] font-mono text-[10px] hidden sm:inline">&lt;{rec.email}&gt;</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-[12.5px]">
              <span className="font-bold text-[#555f6f] w-16 shrink-0">Asunto:</span>
              <span className="font-semibold text-[#151c27] break-words">
                {subject}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11.5px] text-[#555f6f] pt-1 border-t border-[#f0f2f5]">
              <Calendar className="w-3.5 h-3.5 text-[#737686]" />
              <span>Enviado: <strong>{sentDate}</strong></span>
              <span className="text-[#c3c6d7]">•</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Entrega confirmada por servidor de correo
              </span>
            </div>
          </div>

          {/* Email Body Card */}
          <div className="bg-white rounded-xl border border-[#c3c6d7] shadow-sm overflow-hidden">
            {/* Top Brand Banner */}
            <div className="bg-gradient-to-r from-[#002b75] via-[#004ac6] to-[#002b75] text-white p-4 sm:p-5">
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-200" />
                    <span className="font-bold tracking-wider text-[15px] uppercase">
                      ALANZA CONSTRUCCIÓN
                    </span>
                  </div>
                  <p className="text-blue-100 text-[12px] mt-0.5">
                    Departamento de Despacho & Control de Montaje de Estructuras
                  </p>
                </div>
                <div className="text-right hidden sm:block">
                  <span className="px-2.5 py-1 rounded bg-white/15 text-white font-mono font-bold text-[12px] border border-white/20">
                    {shipment.id}
                  </span>
                </div>
              </div>
            </div>

            {/* Email Message Content */}
            <div className="p-4 sm:p-6 space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5">
                <Truck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-[13px] text-amber-900">
                    Aviso de Salida y Transporte en Tránsito
                  </h4>
                  <p className="text-[12px] text-amber-800 mt-0.5">
                    Se notifica a los responsables de obra, aseguramiento de calidad y logística que el cargamento <strong>{shipment.id}</strong> ha salido de los talleres centrales rumbo al frente de obra del proyecto <strong>{shipment.project}</strong>.
                  </p>
                </div>
              </div>

              {/* Grid with shipment logistics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12.5px]">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">Unidad de Transporte</span>
                  <div className="font-bold text-[#151c27] flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-[#004ac6]" />
                    <span>{shipment.carrier}</span>
                  </div>
                  <div className="text-[#555f6f] text-[11.5px]">
                    Coordinador: <strong>{shipment.manager}</strong>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">Conductor Asignado</span>
                  <div className="font-bold text-[#151c27] flex items-center gap-1.5">
                    <User className="w-4 h-4 text-[#004ac6]" />
                    <span>{shipment.driverName || 'Roberto Mendoza'}</span>
                  </div>
                  <div className="text-[#555f6f] text-[11.5px]">
                    Operador del Dpto. de Despacho
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">Destino de Entrega</span>
                  <div className="font-bold text-[#151c27] flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>{shipment.destination}</span>
                  </div>
                  <div className="text-[#555f6f] text-[11.5px]">
                    Proyecto: <strong>{shipment.project}</strong>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">Total de Carga Liberada</span>
                  <div className="font-bold text-[#151c27] flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#004ac6]" />
                    <span>{shipment.piecesCount} Piezas ({shipment.totalWeightTons} Toneladas)</span>
                  </div>
                  <div className="text-emerald-700 text-[11.5px] font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> 100% Liberado por Control de Calidad
                  </div>
                </div>
              </div>

              {/* Piece List Manifest Table */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-bold text-[12px] text-[#434655] uppercase">
                    Piezas Estructurales Incluidas en este Envío:
                  </span>
                  <span className="text-[11px] text-[#555f6f]">
                    {piecesToDisplay.length} elementos
                  </span>
                </div>
                <div className="border border-[#e2e8f8] rounded-lg overflow-hidden bg-white">
                  <table className="w-full text-left text-[12px]">
                    <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">Marca</th>
                        <th className="py-2 px-3">Tipo</th>
                        <th className="py-2 px-3">Perfil</th>
                        <th className="py-2 px-3 text-right">Peso</th>
                        <th className="py-2 px-3 text-center">QC</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {piecesToDisplay.map((p, idx) => (
                        <tr key={p.mark || idx} className="hover:bg-slate-50">
                          <td className="py-1.5 px-3 font-mono font-bold text-[#004ac6]">
                            {p.mark}
                          </td>
                          <td className="py-1.5 px-3 text-slate-700">
                            {p.type}
                          </td>
                          <td className="py-1.5 px-3 font-mono text-slate-600">
                            {p.profile || 'W18x50'}
                          </td>
                          <td className="py-1.5 px-3 text-right font-mono text-slate-600">
                            {p.weightKg || 420} kg
                          </td>
                          <td className="py-1.5 px-3 text-center">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {p.qcStatus || 'Aprobada'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Instructions Callout for Field Staff */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-[12px] text-blue-900 leading-relaxed">
                <strong className="block font-bold mb-0.5 flex items-center gap-1 text-[#004ac6]">
                  <ShieldCheck className="w-4 h-4" /> Instrucciones al Residente de Obra:
                </strong>
                Al arribo de la unidad de despacho, cotejar el estado de cada marca física contra esta lista. En caso de discrepancia, rayadura o doblez durante el viaje, reportarla de inmediato en el módulo <em>Recepción en Campo</em> de la plataforma ALANZA.
              </div>
            </div>

            {/* Email Footer Sign-off */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 text-center text-slate-500 text-[11px]">
              <p>Este es un correo automático generado por el Sistema de Trazabilidad Estructural ALANZA.</p>
              <p className="mt-0.5 font-semibold text-slate-600">Departamento de Despacho & Logística • Planta Central ALANZA Construcción</p>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons (Fixed Footer) */}
        <div className="p-3.5 sm:p-4 border-t border-[#e2e8f8] bg-[#f9fafb] flex flex-wrap justify-between items-center gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-1.5 bg-white border border-[#c3c6d7] hover:border-[#004ac6] hover:bg-[#f0f3ff] text-[#151c27] rounded-lg text-[12.5px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-[#004ac6]" />}
              <span>{copied ? 'Copiado' : 'Copiar Texto'}</span>
            </button>

            <button
              onClick={handleResend}
              disabled={isSending}
              className="px-3.5 py-1.5 bg-[#004ac6] hover:bg-[#2563eb] text-white rounded-lg text-[12.5px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
            >
              <Send className={`w-4 h-4 ${isSending ? 'animate-spin' : ''}`} />
              <span>{isSending ? 'Enviando...' : (sentSuccess ? '¡Reenviado!' : 'Reenviar Correo a Involucrados')}</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#151c27] rounded-lg text-[12.5px] font-medium transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
