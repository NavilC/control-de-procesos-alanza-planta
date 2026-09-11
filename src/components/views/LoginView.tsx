import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  Building2, 
  KeyRound, 
  Eye, 
  EyeOff, 
  AlertCircle,
  HelpCircle,
  X
} from 'lucide-react';
import { playFeedbackSound } from '../../utils/audioFeedback';

export const LoginView: React.FC = () => {
  const { login } = useApp();
  
  const [identifier, setIdentifier] = useState('jperez@alanza.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSupportModal, setShowSupportModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);
    playFeedbackSound('click');

    setTimeout(() => {
      const result = login(identifier.trim(), password, rememberMe);
      if (result.success) {
        playFeedbackSound('success');
      } else {
        setErrorMessage(result.message || 'Credenciales no válidas.');
        playFeedbackSound('error');
        setIsLoading(false);
      }
    }, 400);
  };

  return (
    <div className="min-h-screen w-screen flex flex-col justify-between bg-gradient-to-br from-[#0a1128] via-[#101f42] to-[#040817] text-white p-4 sm:p-6 md:p-8 font-['Inter',sans-serif]">
      {/* Top Brand Bar */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0052cc] to-[#2563eb] flex items-center justify-center shadow-lg shadow-blue-900/50 border border-blue-400/30">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-black text-[22px] tracking-tight text-white block leading-none">
              ALANZA
            </span>
            <span className="text-[10px] tracking-widest text-slate-400 uppercase font-semibold">
              Estructuras de Acero & Trazabilidad
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[12px] bg-slate-900/70 px-3.5 py-1.5 rounded-full border border-slate-700/60 text-slate-300 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Servidor Cloud En Línea • Portal Corporativo</span>
        </div>
      </header>

      {/* Main Login Area */}
      <main className="max-w-md w-full mx-auto my-auto py-4 sm:py-6">
        <div className="bg-[#151f38]/95 backdrop-blur-md rounded-2xl border border-slate-700/70 p-6 sm:p-8 shadow-2xl shadow-black/80">
          
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400 mb-3">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="text-[22px] font-bold text-white tracking-tight">
              Iniciar Sesión
            </h1>
            <p className="text-[13px] text-slate-400 mt-1">
              Plataforma Integral de Trazabilidad Estructural
            </p>
          </div>

          {/* Direct Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Alert Banner */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-950/70 border border-red-800 text-[12px] text-red-200 flex items-start gap-2.5 animate-in fade-in zoom-in-95">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">{errorMessage}</p>
                  <p className="text-[11px] text-red-300/80 mt-0.5">
                    Verifique que el usuario o correo haya sido creado por el Administrador.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setErrorMessage(null)}
                  className="text-red-400 hover:text-white p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div>
              <label className="block text-[12px] font-medium text-slate-300 mb-1.5">
                Correo Electrónico o Usuario
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="login-email-input"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  placeholder="usuario@alanza.com o nombre_usuario"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-[13px] text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-slate-300 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="login-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Contraseña asignada"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-[13px] text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
                  title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[12px] pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-200 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 text-blue-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                />
                <span>Recordar sesión</span>
              </label>
              <button
                type="button"
                onClick={() => setShowSupportModal(true)}
                className="text-blue-400 hover:text-blue-300 hover:underline cursor-pointer flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>¿Problemas para acceder?</span>
              </button>
            </div>

            <button
              id="btn-login-submit"
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-[#0052cc] hover:from-blue-500 hover:to-blue-600 text-white font-bold text-[14px] rounded-xl shadow-lg shadow-blue-900/50 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-70 active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Verificando credenciales...</span>
                </>
              ) : (
                <>
                  <span>Iniciar Sesión</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security footnote */}
          <div className="mt-6 pt-4 border-t border-slate-800 text-center flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Trazabilidad Estructural Certificada • AISC & AWS D1.1</span>
          </div>
        </div>
      </main>

      {/* Support & Admin Management Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-[#151f38] rounded-2xl max-w-md w-full border border-slate-700 shadow-2xl p-6 text-left animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2 text-white font-bold text-[16px]">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
                <span>Soporte de Acceso</span>
              </div>
              <button
                type="button"
                onClick={() => setShowSupportModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-[13px] text-slate-300 leading-relaxed">
              <p>
                Si olvidaste tu contraseña o necesitas solicitar acceso a la plataforma de trazabilidad, comunícate con el Administrador del Sistema.
              </p>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                <span className="font-semibold text-white block text-[12px]">Contacto del Administrador Principal:</span>
                <p className="text-[12px] text-slate-300"><strong>Nombre:</strong> Juan Pérez (Administrador de Planta y Sistemas)</p>
                <p className="text-[12px] text-slate-300"><strong>Correo:</strong> jperez@alanza.com</p>
                <p className="text-[12px] text-slate-300"><strong>Extensión:</strong> Ext. 104 - Control Operativo</p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSupportModal(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto text-center py-2 text-[11px] text-slate-500">
        © {new Date().getFullYear()} ALANZA. Todos los derechos reservados. Módulo de Autenticación Centralizada de Planta y Campo.
      </footer>
    </div>
  );
};
