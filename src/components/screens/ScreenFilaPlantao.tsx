import React, { useState } from 'react';
import { PsychiatricPatient, ScreenId, AppointmentStatus } from '../../types/clinical';
import { SyntheticNoticeBanner } from '../SyntheticNoticeBanner';

interface ScreenFilaPlantaoProps {
  patients: PsychiatricPatient[];
  onSelectPatient: (patient: PsychiatricPatient, targetScreen?: ScreenId) => void;
  onCallPatient?: (patient: PsychiatricPatient) => void;
  onNavigate: (screenId: ScreenId) => void;
  nextArrivalCountdown?: number | null;
  onSimulateArrivalNow?: () => void;
}

export const ScreenFilaPlantao: React.FC<ScreenFilaPlantaoProps> = ({
  patients,
  onSelectPatient,
  onNavigate,
}) => {
  const [filterType, setFilterType] = useState<string>('todos');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPatients = patients.filter((p) => {
    const matchesType = filterType === 'todos' || p.type === filterType;
    const matchesStatus = filterStatus === 'todos' || p.status === filterStatus;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.recordNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.synopsis.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'Em consulta':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0284c7]/10 text-[#0284c7] text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0284c7] animate-pulse"></span>
            Em consulta
          </span>
        );
      case 'Rascunho para revisão':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0284c7]/10 text-[#0369a1] text-[11px] font-bold">
            <span className="material-symbols-outlined text-[13px]">rate_review</span>
            Rascunho para revisão
          </span>
        );
      case 'Pendência':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#b45309]/10 text-[#b45309] text-[11px] font-bold">
            <span className="material-symbols-outlined text-[13px]">pending</span>
            Pendência
          </span>
        );
      case 'Assinado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0284c7]/15 text-[#0369a1] text-[11px] font-bold">
            <span className="material-symbols-outlined text-[13px]">verified</span>
            Assinado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#f1f5f9] text-[#475569] text-[11px] font-medium">
            <span className="material-symbols-outlined text-[13px]">event</span>
            Agendado
          </span>
        );
    }
  };

  return (
    <main className="w-full pt-20 pb-20 bg-[#f8f9ff] min-h-screen">
      {/* Fixed synthetic notice banner at top */}
      <SyntheticNoticeBanner />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* Top Header & Context */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-[#e5eeff]">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0284c7] text-[28px]">calendar_month</span>
              <h1 className="text-2xl font-bold text-[#0b1c30] tracking-tight">Agenda do Dia</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#0284c7]/10 text-[#0284c7] text-[11px] font-mono font-bold">
                Ambulatório de Psiquiatria
              </span>
            </div>
            <p className="text-[13px] text-[#45464d] mt-1">
              Consultas agendadas com apoio do <strong>Fala Psi</strong> • Transcrição consentida, comparação factual com o histórico e rascunho de evolução sem alucinação diagnóstica.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-center">
            <div className="bg-[#ffffff] px-4 py-2 rounded-xl border border-[#d3e4fe] shadow-xs flex items-center gap-3 text-[12px]">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-mono font-bold text-[#76777d]">Total Agendados</span>
                <span className="text-[15px] font-bold text-[#0b1c30]">{patients.length} consultas</span>
              </div>
              <div className="h-6 w-px bg-[#e5eeff]" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-mono font-bold text-[#76777d]">Data do Atendimento</span>
                <span className="text-[12px] font-semibold text-[#0284c7]">23/09/2026 (Hoje)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Synthetic Test Scenarios Selector (Os 4 Casos da PoC) */}
        <div className="bg-[#ffffff] p-4 sm:p-5 rounded-2xl border border-[#d3e4fe] shadow-sm flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e5eeff] pb-2.5">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0284c7] text-[20px]">science</span>
              <h2 className="font-bold text-[#0b1c30] text-[14px]">
                Casos Sintéticos de Demonstração (Clique para navegar diretamente)
              </h2>
            </div>
            <span className="text-[11px] font-mono text-[#76777d]">
              Cenários validados para psiquiatria ambulatorial
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Caso 1 */}
            <button
              type="button"
              onClick={() => {
                const c = patients.find((p) => p.caseKey === 'carla');
                if (c) onSelectPatient(c, 'rascunho');
              }}
              className="p-3.5 rounded-xl border border-[#bae6fd] bg-[#f0f9ff] hover:bg-[#e0f2fe] text-left flex flex-col gap-2 transition-all cursor-pointer shadow-xs group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[13px] text-[#0284c7] group-hover:underline">
                  Caso 1 (Sucesso)
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#bae6fd] text-[#0369a1]">
                  08:30 • Retorno
                </span>
              </div>
              <strong className="text-[13px] text-[#0f172a]">Carla Mendes (29 anos)</strong>
              <p className="text-[11px] text-[#0369a1] leading-relaxed">
                Melhora do sono e humor. Médico: "vamos manter e encaminhar para psicoterapia". Todos os campos com fonte.
              </p>
              <div className="pt-2 border-t border-[#bae6fd]/60 flex items-center justify-between text-[11px] font-semibold text-[#0284c7]">
                <span>Ver Rascunho Completo</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
              </div>
            </button>

            {/* Caso 2 */}
            <button
              type="button"
              onClick={() => {
                const c = patients.find((p) => p.caseKey === 'roberto');
                if (c) onSelectPatient(c, 'rascunho');
              }}
              className="p-3.5 rounded-xl border border-[#fed7aa] bg-[#fff7ed] hover:bg-[#ffedd5] text-left flex flex-col gap-2 transition-all cursor-pointer shadow-xs group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[13px] text-[#9a3412] group-hover:underline">
                  Caso 2 (Contradição & Bloqueio)
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#fed7aa] text-[#7c2d12]">
                  09:15 • Retorno
                </span>
              </div>
              <strong className="text-[13px] text-[#0f172a]">Roberto Alencar (45 anos)</strong>
              <p className="text-[11px] text-[#9a3412] leading-relaxed">
                Lítio em dias alternados vs uso diário. Litemia há 9 meses. EEM bloqueado para sugestão da IA.
              </p>
              <div className="pt-2 border-t border-[#fed7aa]/60 flex items-center justify-between text-[11px] font-semibold text-[#c2410c]">
                <span>Ver Contradição & Fontes</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
              </div>
            </button>

            {/* Caso 3 */}
            <button
              type="button"
              onClick={() => {
                const c = patients.find((p) => p.caseKey === 'lucia');
                if (c) onSelectPatient(c, 'rascunho');
              }}
              className="p-3.5 rounded-xl border border-[#fecaca] bg-[#fef2f2] hover:bg-[#fee2e2] text-left flex flex-col gap-2 transition-all cursor-pointer shadow-xs group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[13px] text-[#991b1b] group-hover:underline">
                  Caso 3 (Alerta de Risco)
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#fecaca] text-[#7f1d1d]">
                  10:00 • Retorno
                </span>
              </div>
              <strong className="text-[13px] text-[#0f172a]">Lúcia Ferreira (38 anos)</strong>
              <p className="text-[11px] text-[#991b1b] leading-relaxed">
                Em 14:22 verbalizou: "às vezes penso que seria melhor não acordar". Alerta literal no topo; assinatura bloqueada.
              </p>
              <div className="pt-2 border-t border-[#fecaca]/60 flex items-center justify-between text-[11px] font-semibold text-[#b91c1c]">
                <span>Ver Alerta & Avaliação</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
              </div>
            </button>

            {/* Caso 4 */}
            <button
              type="button"
              onClick={() => {
                const c = patients.find((p) => p.caseKey === 'paulo');
                if (c) onSelectPatient(c, 'consentimento');
              }}
              className="p-3.5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] hover:bg-[#f1f5f9] text-left flex flex-col gap-2 transition-all cursor-pointer shadow-xs group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[13px] text-[#475569] group-hover:underline">
                  Caso 4 (Exceção / Recusa)
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#e2e8f0] text-[#334155]">
                  10:45 • 1ª Consulta
                </span>
              </div>
              <strong className="text-[13px] text-[#0f172a]">Paulo Silveira (52 anos)</strong>
              <p className="text-[11px] text-[#475569] leading-relaxed">
                Paciente recusa consentimento de escuta. Encaminha para documentação médica estritamente manual.
              </p>
              <div className="pt-2 border-t border-[#cbd5e1] flex items-center justify-between text-[11px] font-semibold text-[#334155]">
                <span>Testar Recusa de Escuta</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
              </div>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-[#ffffff] p-4 rounded-xl border border-[#e5eeff] shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-mono font-bold text-[#76777d] uppercase mr-1">Filtros:</span>
            
            {/* Type Filter */}
            <div className="inline-flex rounded-lg border border-[#d3e4fe] p-0.5 bg-[#eff4ff]">
              <button
                type="button"
                onClick={() => setFilterType('todos')}
                className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  filterType === 'todos' ? 'bg-[#ffffff] text-[#0284c7] shadow-2xs' : 'text-[#45464d] hover:text-[#0b1c30]'
                }`}
              >
                Todos os Tipos
              </button>
              <button
                type="button"
                onClick={() => setFilterType('Retorno')}
                className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  filterType === 'Retorno' ? 'bg-[#ffffff] text-[#0284c7] shadow-2xs' : 'text-[#45464d] hover:text-[#0b1c30]'
                }`}
              >
                Retorno
              </button>
              <button
                type="button"
                onClick={() => setFilterType('Primeira consulta')}
                className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  filterType === 'Primeira consulta' ? 'bg-[#ffffff] text-[#0284c7] shadow-2xs' : 'text-[#45464d] hover:text-[#0b1c30]'
                }`}
              >
                Primeira Consulta
              </button>
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-[12px] px-3 py-1.5 rounded-lg border border-[#d3e4fe] bg-[#ffffff] text-[#0b1c30] focus:outline-none focus:border-[#0284c7]"
            >
              <option value="todos">Todos os Status</option>
              <option value="Agendado">Agendado</option>
              <option value="Em consulta">Em consulta</option>
              <option value="Rascunho para revisão">Rascunho para revisão</option>
              <option value="Pendência">Pendência</option>
              <option value="Assinado">Assinado</option>
            </select>
          </div>

          <div className="relative">
            <span className="material-symbols-outlined text-[18px] text-[#76777d] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por paciente, prontuário..."
              className="pl-9 pr-3 py-1.5 rounded-lg border border-[#d3e4fe] text-[12px] bg-[#f8f9ff] text-[#0b1c30] focus:outline-none focus:border-[#0284c7] w-full sm:w-64"
            />
          </div>
        </div>

        {/* Patients Table */}
        <div className="bg-[#ffffff] rounded-2xl border border-[#e5eeff] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-[#e5eeff] bg-[#f8f9ff] text-[#45464d] text-[11px] font-mono uppercase tracking-wider">
                  <th className="py-3 px-4 font-bold">Horário</th>
                  <th className="py-3 px-4 font-bold">Paciente</th>
                  <th className="py-3 px-4 font-bold">Tipo</th>
                  <th className="py-3 px-4 font-bold">Última Consulta</th>
                  <th className="py-3 px-4 font-bold">Medicações em Uso</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f4fc]">
                {filteredPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="hover:bg-[#f8f9ff] transition-colors cursor-pointer group"
                    onClick={() => onSelectPatient(patient)}
                  >
                    {/* Horário */}
                    <td className="py-3.5 px-4 font-mono font-bold text-[#0284c7] whitespace-nowrap">
                      {patient.time}
                    </td>

                    {/* Paciente */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#0b1c30] group-hover:text-[#0284c7] transition-colors text-[13px]">
                          {patient.name}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-[#76777d]">
                          <span>{patient.age} anos</span>
                          <span>•</span>
                          <span className="font-mono">{patient.recordNumber}</span>
                        </div>
                      </div>
                    </td>

                    {/* Tipo de consulta */}
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#eff4ff] text-[#0284c7] border border-[#d3e4fe]">
                        {patient.type}
                      </span>
                    </td>

                    {/* Última Consulta */}
                    <td className="py-3.5 px-4 text-[#45464d] text-[12px] font-mono">
                      {patient.lastConsultationDate}
                    </td>

                    {/* Medicações em Uso */}
                    <td className="py-3.5 px-4 text-[#45464d] text-[12px]">
                      {patient.currentMedications && patient.currentMedications.length > 0 ? (
                        <span className="inline-block px-2 py-0.5 rounded bg-[#f1f5f9] text-[#334155] font-mono text-[11px]">
                          {patient.currentMedications[0]}
                        </span>
                      ) : (
                        <span className="text-[#94a3b8] italic text-[11px]">Nenhuma cadastrada</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(patient.status)}
                    </td>

                    {/* Ação */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        {patient.status === 'Rascunho para revisão' ? (
                          <button
                            type="button"
                            onClick={() => onSelectPatient(patient, 'rascunho')}
                            className="px-3 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
                          >
                            <span>Revisar Rascunho</span>
                            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                          </button>
                        ) : patient.status === 'Em consulta' ? (
                          <button
                            type="button"
                            onClick={() => onSelectPatient(patient, 'atendimento')}
                            className="px-3 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
                          >
                            <span>Entrar na Consulta</span>
                            <span className="material-symbols-outlined text-[14px]">graphic_eq</span>
                          </button>
                        ) : patient.status === 'Assinado' ? (
                          <button
                            type="button"
                            onClick={() => onSelectPatient(patient, 'auditoria')}
                            className="px-3 py-1.5 bg-[#eff4ff] hover:bg-[#d8e8fe] text-[#0284c7] border border-[#d3e4fe] rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <span>Ver Prontuário</span>
                            <span className="material-symbols-outlined text-[14px]">visibility</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onSelectPatient(patient, 'consentimento')}
                            className="px-3 py-1.5 bg-[#eff4ff] hover:bg-[#d8e8fe] text-[#0284c7] border border-[#d3e4fe] rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <span>Iniciar Consulta</span>
                            <span className="material-symbols-outlined text-[14px]">play_arrow</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
};
