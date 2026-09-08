import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  UserCheck, 
  Layers, 
  Lock, 
  Mail, 
  ArrowRight, 
  CheckCircle2, 
  Building2, 
  HardHat, 
  Boxes,
  Truck,
  Briefcase,
  Factory,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';
import { playFeedbackSound } from '../../utils/audioFeedback';

export const LoginView: React.FC = () => {
  const { login } = useApp();
  const [selectedRole, setSelectedRole] = useState<'Administrador' | 'Producción' | 'Inspector QC'>('Administrador');
  const [email, setEmail] = useState('jperez@alanza.com');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const rolePresets = [
    {
      role: 'Administrador' as const,
      name: 'Juan Pérez',
      email: 'jperez@alanza.com',
      icon: ShieldCheck,
      color: 'border-blue-500 bg-blue-50 text-blue-700',
      badge: 'Control Total',
      desc: 'Administración de usuarios, proyectos y auditoría'
    },
    {
      role: 'Producción' as const,
      name: 'Ing. Roberto Mendoza',
      email: 'rmendoza@alanza.com',
      icon: Factory,
      color: 'border-amber-500 bg-amber-50 text-amber-700',
      badge: 'Planta & Taller',
      desc: 'Asignación de cuadrillas, avance y fabricación'
    },
    {
      role: 'Inspector QC' as const,
      name: 'Ing. Ana Gómez',
      email: 'agomez@alanza.com',
      icon: Layers,
      color: 'border-emerald-500 bg-emerald-50 text-emerald-700',
      badge: 'Control de Calidad',
      desc: 'Liberación END, pruebas dimensionales y pintura'
    }
  ];

  const handleSelectRole = (role: 'Administrador' | 'Producción' | 'Inspector QC', userEmail: string) => {
    setSelectedRole(role);
    setEmail(userEmail);
    playFeedbackSound('click');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    playFeedbackSound('click');

    setTimeout(() => {
      login(selectedRole);
      playFeedbackSound('success');
      setIsLoading(false);
    }, 450);
  };

  return (
    <div className="min-h-screen w-screen flex flex-col justify-between bg-gradient-to-br from-[#0a1128] via-[#101f42] to-[#040817] text-white p-4 sm:p-8 font-['Inter',sans-serif]">
      {/* Top Brand Bar */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0052cc] to-[#2563eb] flex items-center justify-center shadow-lg shadow-blue-900/50 border border-blue-400/30">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-black text-[20px] tracking-tight text-white block leading-none">
              ALANZA <span className="text-blue-400 font-light">METÁLICA</span>
            </span>
            <span className="text-[10px] tracking-widest text-slate-400 uppercase font-semibold">
              Estructuras de Acero & Trazabilidad
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[12px] bg-slate-900/60 px-3 py-1.5 rounded-full border border-slate-700/60 text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Servidor Cloud En Línea • v2.6.4</span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="max-w-md w-full mx-auto my-auto py-6">
        <div className="bg-[#151f38]/90 backdrop-blur-md rounded-2xl border border-slate-700/70 p-6 sm:p-8 shadow-2xl shadow-black/80">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400 mb-3">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="text-[22px] font-bold text-white tracking-tight">
              Acceso al Sistema
            </h1>
            <p className="text-[13px] text-slate-400 mt-1">
              Ingresa tus credenciales o selecciona un perfil operativo
            </p>
          </div>

          {/* Quick Profile Selectors */}
          <div className="mb-6">
            <label className="block text-[11px] uppercase font-bold tracking-wider text-slate-400 mb-2">
              Selección Rápida de Perfil:
            </label>
            <div className="space-y-2">
              {rolePresets.map((preset) => {
                const Icon = preset.icon;
                const isSelected = selectedRole === preset.role;
                return (
                  <button
                    key={preset.role}
                    type="button"
                    onClick={() => handleSelectRole(preset.role, preset.email)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600/25 border-blue-500 shadow-md shadow-blue-900/40 text-white'
                        : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[13px]">{preset.name}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            isSelected ? 'bg-blue-500/30 text-blue-200' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {preset.badge}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 block">{preset.desc}</span>
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-slate-300 mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="usuario@alanza.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-slate-700 rounded-lg text-[13px] text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
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
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-9 py-2 bg-slate-900/80 border border-slate-700 rounded-lg text-[13px] text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[12px] pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-200">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 text-blue-600 focus:ring-0 w-3.5 h-3.5"
                />
                <span>Recordar sesión</span>
              </label>
              <button
                type="button"
                onClick={() => alert('Para restablecer contraseña, comunícate con el administrador de sistemas IT (it@alanza.com).')}
                className="text-blue-400 hover:text-blue-300 hover:underline cursor-pointer"
              >
                ¿Olvidaste tu clave?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-[#0052cc] hover:from-blue-500 hover:to-blue-600 text-white font-bold text-[14px] rounded-xl shadow-lg shadow-blue-900/50 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Autenticando...</span>
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
          <div className="mt-5 pt-4 border-t border-slate-800 text-center flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Acceso Seguro • Certificación AISC & AWS D1.1</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto text-center py-2 text-[11px] text-slate-500">
        © {new Date().getFullYear()} Alanza Metálica S.A. de C.V. Todos los derechos reservados. Módulo de Autenticación de Planta y Campo.
      </footer>
    </div>
  );
};
