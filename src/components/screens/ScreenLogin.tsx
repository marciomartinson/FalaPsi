import React, { useState } from 'react';
import { DoctorUser, MOCK_DOCTORS } from '../../types/clinical';

interface ScreenLoginProps {
  onLogin: (doctor: DoctorUser) => void;
}

export const ScreenLogin: React.FC<ScreenLoginProps> = ({ onLogin }) => {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(MOCK_DOCTORS[0].id);
  const [email, setEmail] = useState<string>(MOCK_DOCTORS[0].email);
  const [password, setPassword] = useState<string>('••••••••');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showForgotModal, setShowForgotModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const selectedDoctor =
    MOCK_DOCTORS.find((d) => d.id === selectedDoctorId) || MOCK_DOCTORS[0];

  const handleDoctorChange = (doctorId: string) => {
    setSelectedDoctorId(doctorId);
    const doctor = MOCK_DOCTORS.find((d) => d.id === doctorId);
    if (doctor) {
      setEmail(doctor.email);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Smooth transition
    setTimeout(() => {
      setIsLoading(false);
      onLogin(selectedDoctor);
    }, 350);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eff4ff] via-[#f8f9ff] to-[#e6f4f2] flex flex-col justify-between p-4 sm:p-6 font-sans">
      {/* Top Header Regulatory Strip */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between text-[11px] font-mono text-[#76777d] py-2 px-1">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
          Sistema Clínico Ativo
        </span>
        <span>CFM 2.314/2022 • LGPD</span>
      </div>

      {/* Login Card */}
      <div className="max-w-md w-full mx-auto my-auto bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-[#e5eeff] p-6 sm:p-8 animate-fadeIn">
        {/* Logo and Brand */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0284c7] to-[#0369a1] text-white flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-[30px]">psychology_alt</span>
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold text-[22px] text-[#0f172a] leading-tight tracking-tight">Fala Psi</span>
              <span className="font-mono font-semibold text-[10px] text-[#0284c7] tracking-wider uppercase">
                Psiquiatria Ambulatorial
              </span>
            </div>
          </div>
          <h2 className="text-xl font-bold text-[#0b1c30]">Acesso ao Consultório</h2>
          <p className="text-xs text-[#76777d] mt-1">
            Psiquiatria Ambulatorial & Assistente Clínico com Fontes
          </p>
        </div>

        {/* Quick User Selection Dropdown (Menu Suspenso de Usuários) */}
        <div className="mb-5 p-3 rounded-2xl bg-[#eff4ff] border border-[#d3e4fe]">
          <label className="block text-[11px] font-semibold text-[#0284c7] uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">badge</span>
              Médico Psiquiatra
            </span>
            <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-[#d3e4fe] text-[#0284c7] font-mono">
              3 perfis
            </span>
          </label>
          <div className="relative">
            <select
              value={selectedDoctorId}
              onChange={(e) => handleDoctorChange(e.target.value)}
              className="w-full bg-white text-[#0b1c30] text-xs font-medium rounded-xl border border-[#d3e4fe] py-2.5 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-[#0284c7] transition-all cursor-pointer appearance-none shadow-xs"
            >
              {MOCK_DOCTORS.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name} • {doc.crm} ({doc.specialty})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-[#0284c7]">
              <span className="material-symbols-outlined text-[18px]">expand_more</span>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-[#0284c7]">
            <span className="flex items-center gap-1 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0284c7]"></span>
              {selectedDoctor.boxLocation}
            </span>
            <span className="text-[10px] text-[#45464d]">Troca rápida ativa</span>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email field */}
          <div>
            <label className="block text-xs font-semibold text-[#0b1c30] mb-1.5">
              E-mail Institucional
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#76777d]">
                <span className="material-symbols-outlined text-[18px]">mail</span>
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome.doutor@falapsi.med.br"
                className="w-full pl-10 pr-3 py-2.5 text-xs text-[#0b1c30] bg-[#f8f9ff] border border-[#d3e4fe] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0284c7] transition-all shadow-xs"
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-[#0b1c30]">
                Senha
              </label>
              {/* Botão Esqueci a senha */}
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-[11px] text-[#0284c7] hover:text-[#0369a1] hover:underline font-medium cursor-pointer"
              >
                Esqueci a senha
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#76777d]">
                <span className="material-symbols-outlined text-[18px]">lock</span>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Insira qualquer senha para entrar"
                className="w-full pl-10 pr-10 py-2.5 text-xs text-[#0b1c30] bg-[#f8f9ff] border border-[#d3e4fe] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0284c7] transition-all shadow-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#76777d] hover:text-[#0b1c30] cursor-pointer"
                title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            <p className="text-[10px] text-[#76777d] mt-1 font-mono">
              * Acesso livre em modo demonstração: qualquer senha é aceita.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#0284c7]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Iniciando Atendimentos...</span>
              </>
            ) : (
              <>
                <span>Entrar no Plantão</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        {/* Security badges */}
        <div className="mt-6 pt-4 border-t border-[#e5eeff] flex items-center justify-center gap-4 text-[10px] text-[#76777d] font-mono">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px] text-[#10b981]">lock</span>
            AES-256
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px] text-[#0284c7]">verified_user</span>
            ICP-Brasil
          </span>
          <span>•</span>
          <span>CFM 2.314</span>
        </div>
      </div>

      {/* Forgot Password Modal (Aviso Informativo) */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-[#e5eeff] flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#e5eeff]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0284c7] text-[20px]">
                  key_vertical
                </span>
                <h3 className="font-bold text-sm text-[#0b1c30]">
                  Recuperação de Acesso
                </h3>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="text-[#76777d] hover:text-[#0b1c30] p-1 rounded-lg"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <p className="text-xs text-[#45464d] leading-relaxed">
              Por motivos de segurança e sigilo médico hospitalar (CFM 2.314/2022), a redefinição de senhas de prontuário eletrônico é realizada diretamente pela equipe de TI do Hospital.
            </p>

            <div className="bg-[#eff4ff] p-3 rounded-xl border border-[#d3e4fe] text-xs font-mono text-[#0284c7] flex flex-col gap-1">
              <div><strong>Ramal TI:</strong> 4402 / 4403</div>
              <div><strong>E-mail:</strong> suporte.ti@hospital.med.br</div>
              <div><strong>Plantão Técnico:</strong> 24 horas</div>
            </div>

            <button
              onClick={() => setShowForgotModal(false)}
              className="mt-2 w-full py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Bottom Footer */}
      <footer className="max-w-md w-full mx-auto text-center text-[10px] text-[#76777d] font-mono py-2">
        Fala Saúde • Assistente Clínico IA com Escuta Passiva Estrita
      </footer>
    </div>
  );
};
