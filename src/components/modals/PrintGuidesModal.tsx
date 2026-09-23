import React, { useState } from 'react';

interface GuideItem {
  id: string;
  type: 'lab' | 'referral' | 'prescription' | 'ticket';
  title: string;
  code: string;
  category: string;
  indication: string;
  justification: string;
  cid: string;
  transcriptionAnchor?: string;
  manualNote: string;
  status: 'pending' | 'printed';
}

interface PrintGuidesModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  recordNumber: string;
}

const INITIAL_PSYCHIATRIC_GUIDES: GuideItem[] = [
  {
    id: 'guide-lab-litio',
    type: 'lab',
    title: 'Litemia Sérica + TSH + T4 Livre',
    code: 'TUSS: 4.03.02.19-9',
    category: 'Laboratório / Monitoramento Terapêutico',
    indication: 'Monitoramento de nível sérico de Lítio e rastreio de função tireoidiana em paciente sob uso de Carbonato de Lítio.',
    justification: 'Última litemia registrada há 9 meses e relato de irregularidade posológica recente. Risco de escape terapêutico ou toxicidade.',
    cid: 'CID-10: F31.0 (Transtorno Afetivo Bipolar)',
    transcriptionAnchor: 'Dr. Roberto: "Vou pedir litemia e função da tireoide agora mesmo" (09:18:25)',
    manualNote: 'Colher pela manhã após 12 horas da última tomada de Lítio, estritamente em jejum.',
    status: 'pending',
  },
  {
    id: 'guide-referral-tcc',
    type: 'referral',
    title: 'Encaminhamento para Psicoterapia Cognitivo-Comportamental (TCC)',
    code: 'TUSS: 2.01.01.02-3',
    category: 'Encaminhamento Interdisciplinar / Psicologia',
    indication: 'Acompanhamento psicoterápico em TCC para suporte e fortalecimento do processo de remissão de sintomas depressivos.',
    justification: 'Paciente em remissão favorável após ajuste posológico. Indicação de psicoterapia para consolidação profilática de longo prazo.',
    cid: 'CID-10: F33.0 (Transtorno Depressivo Recorrente)',
    transcriptionAnchor: 'Dr. Roberto: "vou te encaminhar para psicoterapia cognitivo-comportamental" (08:34:40)',
    manualNote: 'Frequência semanal sugerida. Ênfase em manejo de estresse ocupacional e regulação do sono.',
    status: 'pending',
  },
  {
    id: 'guide-prescription-c1',
    type: 'prescription',
    title: 'Receita de Controle Especial (Carbonato de Lítio 300mg)',
    code: 'Portaria SVS/MS 344/98 - Lista C1',
    category: 'Receituário de Controle Especial',
    indication: 'Tratamento de manutenção profilática do Transtorno Afetivo Bipolar.',
    justification: 'Carbonato de Lítio 300mg: Tomar 1 comprimido de 12 em 12 horas continuamente (600mg ao dia).',
    cid: 'CID-10: F31.0',
    transcriptionAnchor: 'Verbalização clínica médica confirmada',
    manualNote: 'Manter uso diário contínuo rigoroso. Não alterar a frequência sem prévia avaliação médica.',
    status: 'pending',
  },
  {
    id: 'guide-ticket',
    type: 'ticket',
    title: 'Comprovante de Comparecimento Ambulatorial',
    code: 'CFM 2.314/22 / Declaração',
    category: 'Documento Administrativo do Paciente',
    indication: 'Declaração de permanência para fins de justificativa de horário de trabalho/estudo.',
    justification: 'Declaro para os devidos fins que o paciente esteve sob consulta psiquiátrica ambulatorial nesta data.',
    cid: 'Ambulatório de Especialidades Médicas',
    transcriptionAnchor: 'Consulta Finalizada',
    manualNote: 'Paciente permaneceu em consulta das 09:15 às 10:00.',
    status: 'pending',
  },
];

export const PrintGuidesModal: React.FC<PrintGuidesModalProps> = ({
  isOpen,
  onClose,
  patientName,
  recordNumber,
}) => {
  const [guides, setGuides] = useState<GuideItem[]>(INITIAL_PSYCHIATRIC_GUIDES);
  const [selectedGuideId, setSelectedGuideId] = useState<string | null>('guide-lab-litio');
  const [editingGuideId, setEditingGuideId] = useState<string | null>(null);
  const [tempNoteText, setTempNoteText] = useState<string>('');
  const [printedFeedback, setPrintedFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedGuide = guides.find((g) => g.id === selectedGuideId) || null;

  const handleSelectPreview = (guideId: string) => {
    setSelectedGuideId(guideId);
  };

  const handleStartEdit = (guide: GuideItem) => {
    setEditingGuideId(guide.id);
    setTempNoteText(guide.manualNote);
  };

  const handleSaveNote = (guideId: string) => {
    setGuides((prev) =>
      prev.map((g) => (g.id === guideId ? { ...g, manualNote: tempNoteText } : g))
    );
    setEditingGuideId(null);
  };

  const handlePrintSingle = (guideId: string) => {
    setGuides((prev) =>
      prev.map((g) => (g.id === guideId ? { ...g, status: 'printed' } : g))
    );
    const targetGuide = guides.find((g) => g.id === guideId);
    setPrintedFeedback(`Guia "${targetGuide?.title}" enviada com sucesso para impressão!`);
    setTimeout(() => setPrintedFeedback(null), 3500);
  };

  const handlePrintAll = () => {
    setGuides((prev) => prev.map((g) => ({ ...g, status: 'printed' })));
    setPrintedFeedback('Todas as 4 guias foram enviadas para impressão com certificado digital!');
    setTimeout(() => setPrintedFeedback(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1c30]/50 backdrop-blur-xs p-4 animate-fadeIn">
      <div
        className={`bg-[#ffffff] rounded-3xl shadow-2xl border border-[#e5eeff] flex flex-col overflow-hidden transition-all duration-300 ${
          selectedGuide ? 'w-full max-w-5xl h-[88vh]' : 'w-full max-w-2xl max-h-[88vh]'
        }`}
      >
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-[#e5eeff] flex items-center justify-between bg-[#f8f9ff]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0284c7]/10 text-[#0284c7] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[22px]">print</span>
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-[#0b1c30]">
                Emissão de Guias e Documentos Psiquiátricos
              </h2>
              <p className="text-[12px] text-[#76777d]">
                Paciente: <strong>{patientName}</strong> • Prontuário: <span className="font-mono">{recordNumber}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#76777d] hover:bg-[#eff4ff] hover:text-[#0b1c30] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Feedback Alert if Printed */}
        {printedFeedback && (
          <div className="px-6 py-2 bg-[#f0f9ff] border-b border-[#bae6fd] text-[#0369a1] text-[12px] font-semibold flex items-center gap-2 animate-fadeIn">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{printedFeedback}</span>
          </div>
        )}

        {/* Modal Body: Left List + Right Expandable Document Preview */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* LEFT LIST: Guides & Action buttons */}
          <div
            className={`flex flex-col p-5 overflow-y-auto divide-y divide-[#f0f4fc] border-r border-[#e5eeff] transition-all duration-300 ${
              selectedGuide ? 'w-full md:w-1/2' : 'w-full'
            }`}
          >
            <div className="pb-3 flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase font-bold text-[#76777d]">
                Documentos Detectados ({guides.length})
              </span>
              <span className="text-[10px] text-[#0284c7] font-mono bg-[#bae6fd]/30 px-2 py-0.5 rounded font-bold">
                Fonte Verbal do Médico
              </span>
            </div>

            <div className="flex flex-col gap-3.5 pt-3">
              {guides.map((guide) => {
                const isSelected = selectedGuideId === guide.id;
                const isEditing = editingGuideId === guide.id;

                return (
                  <div
                    key={guide.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col gap-2.5 ${
                      isSelected
                        ? 'bg-[#eff6ff] border-[#bfdbfe] shadow-xs'
                        : 'bg-[#ffffff] border-[#e5eeff] hover:bg-[#f8f9ff]'
                    }`}
                  >
                    {/* Top Guide Info */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#0284c7]/10 text-[#0284c7] flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[18px]">
                            {guide.type === 'lab'
                              ? 'biotechnology'
                              : guide.type === 'referral'
                              ? 'forward'
                              : guide.type === 'prescription'
                              ? 'medication'
                              : 'receipt_long'}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-[13px] text-[#0b1c30]">{guide.title}</span>
                          <span className="text-[10px] font-mono text-[#76777d]">
                            {guide.code} • {guide.category}
                          </span>
                        </div>
                      </div>

                      {guide.status === 'printed' ? (
                        <span className="px-2 py-0.5 rounded bg-[#f0f9ff] text-[#0369a1] text-[10px] font-mono font-bold flex items-center gap-1 border border-[#bae6fd]">
                          <span className="material-symbols-outlined text-[12px]">check</span>
                          Impresso
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-[#f1f5f9] text-[#475569] text-[10px] font-mono font-semibold">
                          Pendente
                        </span>
                      )}
                    </div>

                    {/* Summary Indication */}
                    <p className="text-[11px] text-[#45464d] leading-relaxed line-clamp-2">
                      {guide.indication}
                    </p>

                    {/* Manual Note Display or Input */}
                    {isEditing ? (
                      <div className="p-2.5 bg-white rounded-xl border border-[#0284c7] flex flex-col gap-1.5 animate-fadeIn">
                        <label className="text-[10px] font-mono font-bold text-[#0284c7] uppercase">
                          Editar Anotação Clínica Manual:
                        </label>
                        <textarea
                          value={tempNoteText}
                          onChange={(e) => setTempNoteText(e.target.value)}
                          rows={2}
                          className="w-full text-[12px] p-2 rounded-lg border border-[#d3e4fe] bg-[#f8f9ff] text-[#0b1c30] focus:outline-none focus:border-[#0284c7] resize-none"
                          placeholder="Adicione orientações de preparo, posologia ou observações..."
                        />
                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setEditingGuideId(null)}
                            className="px-2.5 py-1 rounded text-[11px] font-semibold text-[#64748b] hover:bg-[#f1f5f9] cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveNote(guide.id)}
                            className="px-3 py-1 rounded bg-[#0284c7] text-white text-[11px] font-bold hover:bg-[#0369a1] transition-all cursor-pointer"
                          >
                            Salvar Anotação
                          </button>
                        </div>
                      </div>
                    ) : (
                      guide.manualNote && (
                        <div className="p-2 bg-[#f8f9ff] rounded-lg border border-[#e5eeff] text-[11px] text-[#475569] flex items-start gap-1.5">
                          <span className="material-symbols-outlined text-[14px] text-[#0284c7] shrink-0 mt-0.5">
                            sticky_note_2
                          </span>
                          <span className="italic flex-1">
                            <strong>Anotação:</strong> {guide.manualNote}
                          </span>
                        </div>
                      )
                    )}

                    {/* Action Buttons in Row */}
                    <div className="pt-2 border-t border-[#f1f5f9] flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => handleSelectPreview(guide.id)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#0284c7] text-white shadow-2xs'
                            : 'bg-[#ffffff] text-[#0284c7] border border-[#d3e4fe] hover:bg-[#eff4ff]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[14px]">visibility</span>
                        <span>{isSelected ? 'Visualizando' : 'Visualizar'}</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(guide)}
                          className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-[#475569] bg-[#f8f9ff] hover:bg-[#eff4ff] border border-[#e5eeff] flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[14px]">edit_note</span>
                          <span>Editar Anotação</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handlePrintSingle(guide.id)}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-white bg-[#0284c7] hover:bg-[#0369a1] flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                        >
                          <span className="material-symbols-outlined text-[14px]">print</span>
                          <span>Imprimir</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT EXPANDABLE PANEL: Realistic Document Preview */}
          {selectedGuide && (
            <div className="w-full md:w-1/2 p-6 bg-[#f8fafc] flex flex-col overflow-y-auto animate-fadeIn">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-[#475569] uppercase flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#0284c7]">description</span>
                  Visualização Prévia da Guia Homologada
                </span>

                <button
                  type="button"
                  onClick={() => setSelectedGuideId(null)}
                  className="text-[11px] text-[#64748b] hover:text-[#0f172a] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                  <span>Recolher</span>
                </button>
              </div>

              {/* Realistic Paper Layout */}
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#cbd5e1] shadow-sm flex flex-col gap-4 text-[#1e293b]">
                {/* Hospital & Specialty Header */}
                <div className="flex items-center justify-between border-b-2 border-[#0284c7] pb-3">
                  <div className="flex flex-col">
                    <span className="font-bold text-[14px] text-[#0284c7] uppercase tracking-wider">
                      Fala Psi • Ambulatório de Psiquiatria
                    </span>
                    <span className="text-[10px] text-[#64748b] font-mono">
                      Hospital Santa Helena • Consultório 03
                    </span>
                  </div>
                  <span className="text-[10px] font-mono bg-[#f1f5f9] px-2 py-1 rounded text-[#475569] font-bold">
                    CFM 2.314/2022
                  </span>
                </div>

                {/* Document Type Title */}
                <div className="text-center py-2 bg-[#f8fafc] rounded-xl border border-[#e2e8f0]">
                  <h3 className="font-extrabold text-[15px] text-[#0f172a] uppercase tracking-wide">
                    {selectedGuide.title}
                  </h3>
                  <span className="text-[10px] font-mono text-[#0284c7]">
                    Código: {selectedGuide.code}
                  </span>
                </div>

                {/* Patient Information Section */}
                <div className="grid grid-cols-2 gap-2 text-[11px] p-3 bg-[#f8fafc] rounded-xl border border-[#e2e8f0]">
                  <div>
                    <span className="text-[#64748b]">Paciente: </span>
                    <strong className="text-[#0f172a]">{patientName}</strong>
                  </div>
                  <div>
                    <span className="text-[#64748b]">Prontuário: </span>
                    <strong className="text-[#0f172a] font-mono">{recordNumber}</strong>
                  </div>
                  <div>
                    <span className="text-[#64748b]">Data de Emissão: </span>
                    <strong className="text-[#0f172a]">23/09/2026</strong>
                  </div>
                  <div>
                    <span className="text-[#64748b]">Classificação: </span>
                    <strong className="text-[#0284c7]">{selectedGuide.cid}</strong>
                  </div>
                </div>

                {/* Clinical Indication */}
                <div className="flex flex-col gap-1 text-[12px]">
                  <strong className="font-bold text-[#0f172a] text-[11px] uppercase font-mono text-[#0284c7]">
                    Indicação Clínica:
                  </strong>
                  <p className="p-2.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] text-[#334155] leading-relaxed">
                    {selectedGuide.indication}
                  </p>
                </div>

                {/* Clinical Justification */}
                <div className="flex flex-col gap-1 text-[12px]">
                  <strong className="font-bold text-[#0f172a] text-[11px] uppercase font-mono text-[#0284c7]">
                    Justificativa Médica:
                  </strong>
                  <p className="p-2.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] text-[#334155] leading-relaxed">
                    {selectedGuide.justification}
                  </p>
                </div>

                {/* Manual Note if provided */}
                {selectedGuide.manualNote && (
                  <div className="flex flex-col gap-1 text-[12px]">
                    <strong className="font-bold text-[#0f172a] text-[11px] uppercase font-mono text-[#0284c7]">
                      Observações & Preparo:
                    </strong>
                    <p className="p-2.5 rounded-lg bg-[#eff6ff] border border-[#bfdbfe] text-[#1e40af] font-medium leading-relaxed">
                      {selectedGuide.manualNote}
                    </p>
                  </div>
                )}

                {/* Physician Signature Box */}
                <div className="pt-4 mt-2 border-t border-[#e2e8f0] flex items-end justify-between">
                  <div className="flex flex-col text-[10px] font-mono text-[#64748b]">
                    <span>Certificado ICP-Brasil</span>
                    <span>Validação: TX-PSI-88419</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-40 border-b border-[#0f172a] mb-1"></div>
                    <span className="font-bold text-[12px] text-[#0f172a]">Dr. Roberto Guimarães</span>
                    <span className="text-[10px] text-[#64748b]">CRM/SP 148.920 • RQE 82.119</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="px-6 py-3.5 border-t border-[#e5eeff] bg-[#f8f9ff] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#d3e4fe] text-[12px] font-bold text-[#45464d] hover:bg-[#eff4ff] cursor-pointer"
          >
            Fechar
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrintAll}
              className="px-5 py-2 bg-[#0284c7] text-white text-[12px] font-bold rounded-xl hover:bg-[#0369a1] transition-all cursor-pointer flex items-center gap-2 shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              <span>Imprimir Todas as Guias</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
