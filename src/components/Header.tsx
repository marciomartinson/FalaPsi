import React, { useState, useRef, useEffect } from 'react';
import { ScreenId, DoctorUser, MOCK_DOCTORS, AppNotification } from '../types/clinical';

interface HeaderProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  onOpenStitchGallery?: () => void;
  selectedCase?: string;
  onSelectCase?: (caseKey: any) => void;
  currentUser?: DoctorUser;
  onLogout?: () => void;
  notifications?: AppNotification[];
  onMarkNotificationAsRead?: (id: string) => void;
  onMarkAllNotificationsAsRead?: () => void;
  onSelectPatientFromNotification?: (patientId: string) => void;
  waitingPatientsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  currentUser = MOCK_DOCTORS[0],
  onLogout,
  notifications = [],
  onMarkNotificationAsRead,
  onMarkAllNotificationsAsRead,
  onSelectPatientFromNotification,
  waitingPatientsCount = 6,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close dropdowns on click outside or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setIsUserMenuOpen(false);
      }
      if (notificationsMenuRef.current && !notificationsMenuRef.current.contains(target)) {
        setIsNotificationsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsUserMenuOpen(false);
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const steps: { id: ScreenId; label: string; badge?: string }[] = [
    { id: 'fila-do-plantao', label: '1. Agenda do Dia', badge: String(waitingPatientsCount) },
    { id: 'consentimento', label: '2. Consentimento' },
    { id: 'atendimento', label: '3. Consulta em Andamento' },
    { id: 'rascunho', label: '4. Revisão' },
    { id: 'excecao', label: '5. Exceções' },
    { id: 'auditoria', label: '6. Resumo e Auditoria' },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex flex-col">
      {/* Top hospital regulatory banner */}
      <div className="w-full bg-[#ffffff] border-b border-[#e5eeff] px-4 lg:px-6 py-1 flex items-center justify-between text-[11px] backdrop-blur-sm text-[#45464d] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-2 mx-auto sm:mx-0">
          <span className="w-2 h-2 rounded-full bg-[#0284c7] animate-pulse"></span>
          <span className="font-mono font-medium text-[#0284c7]">PSIQUIATRIA AMBULATORIAL</span>
          <span className="text-[#c6c6cd]">•</span>
          <span className="hidden sm:inline font-mono text-[#45464d]">CFM 2.314/2022 • IA Passiva com Fontes Auditáveis</span>
          <span className="hidden md:inline text-[#c6c6cd]">•</span>
          <span className="hidden md:inline text-[#45464d]">Sem Diagnóstico Automático</span>
        </div>

        <div className="hidden sm:flex items-center gap-3">
          <span className="font-mono text-[11px] text-[#76777d]">{currentUser.boxLocation}</span>
          <span className="text-[#c6c6cd]">|</span>
          <span className="font-semibold text-[#0b1c30]">{currentUser.name} ({currentUser.crm})</span>
        </div>
      </div>

      {/* Main Header */}
      <header className="w-full bg-[#ffffff]/95 backdrop-blur-md border-b border-[#e5eeff] px-4 lg:px-6 shadow-sm">
        <div className="h-16 flex items-center justify-between gap-3">
          {/* Logo brand: Fala Psi */}
          <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => onNavigate('fila-do-plantao')}>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0284c7] to-[#0369a1] text-white flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-[22px]">psychology_alt</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[18px] text-[#0f172a] leading-tight tracking-tight">Fala Psi</span>
                <span className="font-mono font-semibold text-[9px] text-[#0284c7] tracking-wider uppercase">Psiquiatria Ambulatorial</span>
              </div>
            </div>
          </div>

          {/* Navigation Steps */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#eff4ff]/80 p-1 rounded-full border border-[#e5eeff] max-w-full overflow-x-auto">
            {steps.map((step) => {
              const isActive = currentScreen === step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => onNavigate(step.id)}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-[#ffffff] text-[#0b1c30] shadow-sm font-semibold border border-[#d3e4fe]'
                      : 'text-[#45464d] hover:text-[#0b1c30] hover:bg-[#ffffff]/50'
                  }`}
                >
                  <span>{step.label}</span>
                  {step.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive
                          ? 'bg-[#bae6fd] text-[#0369a1] font-bold'
                          : 'bg-[#e5eeff] text-[#45464d]'
                      }`}
                    >
                      {step.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls: Notification Bell + Doctor Profile Dropdown */}
          <div className="flex items-center gap-2">
            {/* 1. NOTIFICATION BELL WITH FLOATING MENU */}
            <div className="relative shrink-0" ref={notificationsMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsUserMenuOpen(false);
                }}
                className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all cursor-pointer shadow-xs relative ${
                  isNotificationsOpen
                    ? 'bg-[#eff4ff] border-[#0284c7] text-[#0284c7]'
                    : 'bg-[#ffffff] hover:bg-[#eff4ff] border-[#e5eeff] text-[#45464d] hover:text-[#0284c7]'
                }`}
                title="Avisos do Consultório"
                aria-label="Avisos do Consultório"
                aria-expanded={isNotificationsOpen}
              >
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-[#ba1a1a] text-white text-[10px] font-bold font-mono shadow-xs animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Floating Notifications Popover */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-[#e5eeff] py-3 z-50 animate-fadeIn text-[#0b1c30]">
                  {/* Header */}
                  <div className="px-4 pb-2.5 border-b border-[#e5eeff] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-[#0284c7]">notifications_active</span>
                      <span className="font-bold text-[13px] text-[#0b1c30]">Avisos da Agenda do Dia</span>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-[#ffdad6] text-[#ba1a1a] text-[10px] font-mono font-bold">
                          {unreadCount} novo{unreadCount > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && onMarkAllNotificationsAsRead && (
                      <button
                        onClick={onMarkAllNotificationsAsRead}
                        className="text-[11px] text-[#0284c7] hover:underline font-semibold cursor-pointer"
                      >
                        Marcar como lidos
                      </button>
                    )}
                  </div>

                  {/* List of Notifications */}
                  <div className="max-h-84 overflow-y-auto divide-y divide-[#f0f4fc]">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-[#76777d] flex flex-col items-center gap-1.5">
                        <span className="material-symbols-outlined text-[32px] text-[#c6c6cd]">notifications_off</span>
                        <span className="text-[12px] font-medium">Nenhum aviso recente</span>
                        <span className="text-[10px] text-[#9ca3af]">Atualizações da recepção e prontuário aparecerão aqui</span>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3 transition-colors flex items-start gap-2.5 hover:bg-[#f8f9ff] ${
                            !notif.read ? 'bg-[#eff4ff]/60' : ''
                          }`}
                          onClick={() => onMarkNotificationAsRead?.(notif.id)}
                        >
                          <div className="w-8 h-8 rounded-xl bg-[#0284c7]/15 text-[#0284c7] flex items-center justify-center shrink-0 mt-0.5">
                            <span className="material-symbols-outlined text-[18px]">
                              {notif.type === 'alert' ? 'warning' : notif.type === 'cfm' ? 'verified' : 'event_available'}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-[12px] text-[#0b1c30] truncate">
                                {notif.title}
                              </span>
                              <span className="text-[10px] font-mono text-[#76777d] shrink-0">
                                {notif.timestamp}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#45464d] mt-0.5 leading-snug">
                              {notif.description}
                            </p>

                            {notif.patientId && (
                              <div className="mt-2 flex items-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onMarkNotificationAsRead?.(notif.id);
                                    onSelectPatientFromNotification?.(notif.patientId!);
                                    setIsNotificationsOpen(false);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                                >
                                  <span>Abrir Consulta</span>
                                  <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-4 pt-2.5 border-t border-[#e5eeff] flex items-center justify-between text-[11px] text-[#76777d]">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                      Recepção Conectada
                    </span>
                    <button
                      onClick={() => {
                        onNavigate('fila-do-plantao');
                        setIsNotificationsOpen(false);
                      }}
                      className="text-[#0284c7] hover:underline font-semibold cursor-pointer"
                    >
                      Ver Agenda Completa
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 2. DOCTOR PROFILE & METRICS DROPDOWN */}
            <div className="relative shrink-0" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setIsUserMenuOpen(!isUserMenuOpen);
                  setIsNotificationsOpen(false);
                }}
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-[12px] border transition-all cursor-pointer shadow-xs relative ${
                  isUserMenuOpen
                    ? 'bg-[#d8e8fe] border-[#0284c7] text-[#0284c7]'
                    : 'bg-[#eff4ff] hover:bg-[#d8e8fe] text-[#0284c7] border-[#d3e4fe]'
                }`}
                title={`${currentUser.name} (Clique para ver métricas da agenda)`}
                aria-label="Menu do Médico Psiquiatra"
                aria-expanded={isUserMenuOpen}
              >
                <span>{currentUser.initials}</span>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#10b981] border-2 border-white"></span>
              </button>

              {/* Floating Doctor & Metrics Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white rounded-2xl shadow-xl border border-[#e5eeff] py-3 z-50 animate-fadeIn text-[#0b1c30]">
                  {/* User Info Header */}
                  <div className="px-4 pb-3 border-b border-[#e5eeff] flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-[#eff4ff] text-[#0284c7] flex items-center justify-center font-bold text-[15px] border border-[#d3e4fe] shrink-0">
                      {currentUser.initials}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-[13px] text-[#0b1c30] truncate">
                        {currentUser.name}
                      </span>
                      <span className="text-[11px] font-mono text-[#0284c7] font-semibold">
                        {currentUser.crm}
                      </span>
                      <span className="text-[10px] text-[#76777d]">
                        {currentUser.specialty} • {currentUser.boxLocation}
                      </span>
                    </div>
                  </div>

                  {/* Operational Metrics Section */}
                  <div className="px-4 py-3 bg-[#f8f9ff] border-b border-[#e5eeff] flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#76777d]">
                        Métricas da Agenda Ambulatorial
                      </span>
                      <span className="text-[9px] font-mono text-[#0284c7] font-bold bg-[#bae6fd]/30 px-1.5 py-0.5 rounded">
                        Hoje
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      {/* Metric 1 */}
                      <div className="bg-white p-2.5 rounded-xl border border-[#e5eeff] flex items-center justify-between shadow-2xs">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[#eff4ff] text-[#0284c7] flex items-center justify-center">
                            <span className="material-symbols-outlined text-[16px]">schedule</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[11px] font-semibold text-[#0b1c30]">Duração Média de Consulta</span>
                            <span className="text-[9px] text-[#0284c7]">Sem pressa documental (meta: 45 min)</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[16px] font-bold text-[#0b1c30] font-mono">42 min</span>
                          <span className="block text-[9px] text-[#76777d]">média</span>
                        </div>
                      </div>

                      {/* Metric 2 */}
                      <div className="bg-white p-2.5 rounded-xl border border-[#e5eeff] flex items-center justify-between shadow-2xs">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[#eff4ff] text-[#0284c7] flex items-center justify-center">
                            <span className="material-symbols-outlined text-[16px]">graphic_eq</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[11px] font-semibold text-[#0b1c30]">Escuta Consentida</span>
                            <span className="text-[9px] text-[#0284c7] font-medium">92% dos retornos</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[16px] font-bold text-[#0b1c30] font-mono">5 / 6</span>
                          <span className="block text-[9px] text-[#16a34a] font-bold">consentidos</span>
                        </div>
                      </div>

                      {/* Metric 3 */}
                      <div className="bg-white p-2.5 rounded-xl border border-[#e5eeff] flex items-center justify-between shadow-2xs">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[#bae6fd]/30 text-[#0369a1] flex items-center justify-center">
                            <span className="material-symbols-outlined text-[16px]">verified</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[11px] font-semibold text-[#0b1c30]">Salvaguardas CFM & Risco</span>
                            <span className="text-[9px] text-[#0284c7] font-semibold">Zero alucinação diagnóstica</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[16px] font-bold text-[#0284c7] font-mono">100%</span>
                          <span className="block text-[9px] text-[#76777d]">auditado</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Navigation & Actions */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        onNavigate('fila-do-plantao');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-[12px] text-[#45464d] hover:text-[#0b1c30] hover:bg-[#eff4ff] transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-[#0284c7]">calendar_month</span>
                        <span>Ver Agenda do Dia</span>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-[#0284c7] bg-[#eff4ff] px-2 py-0.5 rounded-full">
                        {waitingPatientsCount} pacientes
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        onNavigate('auditoria');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-[12px] text-[#45464d] hover:text-[#0b1c30] hover:bg-[#eff4ff] transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px] text-[#0284c7]">verified</span>
                      <span>Auditoria Forense & Rastreabilidade</span>
                    </button>
                  </div>

                  {/* Footer / Logout */}
                  <div className="pt-2 mt-1 border-t border-[#e5eeff] px-4">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        if (onLogout) {
                          onLogout();
                        } else {
                          onNavigate('fila-do-plantao');
                        }
                      }}
                      className="w-full py-1.5 text-center text-[11px] text-[#ba1a1a] hover:bg-[#ffdad6]/40 font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">logout</span>
                      <span>Encerrar Atendimento (Sair)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Subnav */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-[#e5eeff]">
          {steps.map((step) => {
            const isActive = currentScreen === step.id;
            return (
              <button
                key={step.id}
                onClick={() => onNavigate(step.id)}
                className={`px-2.5 py-1 rounded-full text-[11px] whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#0284c7] text-[#ffffff] font-semibold'
                    : 'bg-[#eff4ff] text-[#45464d]'
                }`}
              >
                {step.label}
              </button>
            );
          })}
        </div>
      </header>
    </div>
  );
};
