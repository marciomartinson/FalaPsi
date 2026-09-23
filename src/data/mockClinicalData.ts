import {
  PsychiatricPatient,
  PsychiatricHistory,
  TranscriptUtterance,
  ClinicalAttentionPoint,
  ClinicalDecision,
  PsychiatricEvolutionDraft,
  RiskAlertData,
} from '../types/clinical';

export const PSYCHIATRIC_PATIENTS: PsychiatricPatient[] = [
  {
    id: 'p-carla',
    name: 'Carla Mendes',
    age: 29,
    time: '08:30',
    type: 'Retorno',
    lastConsultationDate: '24/07/2026',
    status: 'Rascunho para revisão',
    recordNumber: 'PSI-883.210',
    caseKey: 'carla',
    synopsis: 'Transtorno Depressivo Recorrente em remissão parcial. Relata estabilização do humor e sono regularizado.',
    currentMedications: ['Escitalopram 15mg/dia'],
  },
  {
    id: 'p-roberto',
    name: 'Roberto Alencar',
    age: 45,
    time: '09:15',
    type: 'Retorno',
    lastConsultationDate: '15/05/2026',
    status: 'Em consulta',
    recordNumber: 'PSI-492.019',
    caseKey: 'roberto',
    synopsis: 'Transtorno Afetivo Bipolar tipo I em manutenção. Histórico de uso diário de Lítio e litemia defasada há 9 meses.',
    currentMedications: ['Carbonato de Lítio 300mg (2x/dia)'],
  },
  {
    id: 'p-lucia',
    name: 'Lúcia Ferreira',
    age: 38,
    time: '10:00',
    type: 'Retorno',
    lastConsultationDate: '10/08/2026',
    status: 'Rascunho para revisão',
    recordNumber: 'PSI-610.442',
    caseKey: 'lucia',
    synopsis: 'Episódio depressivo moderado/grave. Verbalizou frase literal de ideação passiva aos 14:22 da consulta.',
    currentMedications: ['Sertralina 50mg/dia', 'Zolpidem 5mg SOS'],
  },
  {
    id: 'p-paulo',
    name: 'Paulo Silveira',
    age: 52,
    time: '10:45',
    type: 'Primeira consulta',
    lastConsultationDate: 'Primeira consulta',
    status: 'Agendado',
    recordNumber: 'PSI-104.992',
    caseKey: 'paulo',
    synopsis: 'Encaminhamento pela cardiologia para avaliação de sintomas ansiosos. Recusou captação acústica por IA.',
    currentMedications: ['Losartana 50mg/dia'],
  },
  {
    id: 'p-mariana',
    name: 'Mariana Costa',
    age: 33,
    time: '08:00',
    type: 'Retorno',
    lastConsultationDate: '18/06/2026',
    status: 'Assinado',
    recordNumber: 'PSI-291.834',
    caseKey: 'mariana',
    synopsis: 'Transtorno de Ansiedade Generalizada com melhora sustentada. Documento homologado e assinado digitalmente.',
    currentMedications: ['Venlafaxina 75mg/dia'],
  },
  {
    id: 'p-eduardo',
    name: 'Eduardo Ramos',
    age: 41,
    time: '11:30',
    type: 'Retorno',
    lastConsultationDate: '02/08/2026',
    status: 'Agendado',
    recordNumber: 'PSI-335.719',
    caseKey: 'eduardo',
    synopsis: 'TDAH em acompanhamento ambulatorial adulto. Consulta de reavaliação periódica.',
    currentMedications: ['Metilfenidato 20mg/dia'],
  },
];

// Alias for backwards compatibility
export const INITIAL_PATIENTS = PSYCHIATRIC_PATIENTS;

// ==========================================
// CASO 1: CARLA MENDES (Sucesso)
// ==========================================
export const HISTORY_CARLA: PsychiatricHistory = {
  consultations: [
    {
      date: '24/07/2026',
      summary: 'Retorno com queixa de insônia terminal e anedonia moderada. Ajustada dose de Escitalopram de 10mg para 15mg/dia.',
      doctor: 'Dr. Roberto Guimarães',
      conduct: 'Aumento para Escitalopram 15mg/dia pela manhã. Retorno agendado em 60 dias.',
    },
    {
      date: '20/05/2026',
      summary: 'Consulta inicial com sintomas depressivos pós-término de relacionamento. HAM-D basal de 18 pontos.',
      doctor: 'Dr. Roberto Guimarães',
      conduct: 'Iniciado Escitalopram 10mg/dia. Psicoeducação sobre tempo de latência.',
    },
  ],
  medications: [
    {
      name: 'Escitalopram',
      dosage: '15mg',
      posology: '1 comprimido pela manhã após o desjejum',
      startedDate: '24/07/2026',
      status: 'em_uso',
    },
  ],
  labExams: [
    {
      name: 'Hemograma + TSH + Vitamina D',
      date: '22/05/2026',
      result: 'TSH: 2.1 mUI/L • Vitamina D: 32 ng/mL • Hemograma normal',
      reference: 'TSH: 0.4 a 4.5 mUI/L',
      isOutdated: false,
    },
  ],
  pendingItems: [
    {
      id: 'pend-c1',
      date: '24/07/2026',
      text: 'Avaliar indicação de psicoterapia cognitivo-comportamental se houvesse estabilização inicial dos sintomas.',
      resolved: true,
    },
  ],
};

export const TRANSCRIPT_CARLA: TranscriptUtterance[] = [
  {
    id: 'tc-01',
    speaker: 'Dr. Roberto Guimarães',
    role: 'doctor',
    timestamp: '08:31:10',
    text: 'Bom dia, Carla. Como você tem passado nesses dois últimos meses desde que ajustamos o Escitalopram para 15 miligramas?',
  },
  {
    id: 'tc-02',
    speaker: 'Carla Mendes',
    role: 'patient',
    timestamp: '08:31:28',
    text: 'Bom dia, doutor. Olha, senti uma melhora muito grande. Meu sono finalmente normalizou, estou dormindo cerca de sete a oito horas seguidas e acordando disposta.',
    evidenceId: 'EVID-SONO-01',
  },
  {
    id: 'tc-03',
    speaker: 'Dr. Roberto Guimarães',
    role: 'doctor',
    timestamp: '08:32:05',
    text: 'Que ótimo relato. E quanto ao ânimo para o trabalho e o humor no dia a dia?',
  },
  {
    id: 'tc-04',
    speaker: 'Carla Mendes',
    role: 'patient',
    timestamp: '08:32:22',
    text: 'O humor melhorou bastante também. Voltei a caminhar no parque e a concentração no escritório está bem mais firme. Não sinto mais aquele peso no peito.',
    evidenceId: 'EVID-HUMOR-01',
  },
  {
    id: 'tc-05',
    speaker: 'Dr. Roberto Guimarães',
    role: 'doctor',
    timestamp: '08:33:00',
    text: 'Você tem tomado o remédio todos os dias sem falhar? Sentiu algum efeito colateral, como náusea ou perda de apetite?',
  },
  {
    id: 'tc-06',
    speaker: 'Carla Mendes',
    role: 'patient',
    timestamp: '08:33:16',
    text: 'Tomo pontualmente todos os dias de manhã com o café. Não tive náusea nenhuma e o apetite está perfeitamente normal.',
    evidenceId: 'EVID-ADESAO-01',
  },
  {
    id: 'tc-07',
    speaker: 'Carla Mendes',
    role: 'patient',
    timestamp: '08:34:02',
    text: 'Apenas nas duas primeiras semanas senti uma leve sonolência à tarde, mas logo passou.',
    isUncertain: true,
  },
  {
    id: 'tc-08',
    speaker: 'Dr. Roberto Guimarães',
    role: 'doctor',
    timestamp: '08:34:40',
    text: 'Excelente. Como você teve uma resposta muito consistente, vamos manter como está a medicação e vou te encaminhar para psicoterapia cognitivo-comportamental para fortalecer esse processo.',
    evidenceId: 'EVID-DECISAO-01',
  },
  {
    id: 'tc-09',
    speaker: 'Carla Mendes',
    role: 'patient',
    timestamp: '08:35:10',
    text: 'Perfeito, doutor. Acho que conversar com uma terapeuta agora vai me ajudar bastante a lidar com a rotina.',
  },
];

export const ATTENTION_POINTS_CARLA: ClinicalAttentionPoint[] = [
  {
    id: 'att-c1',
    text: 'Relatou insônia terminal em 24/07; hoje relata sono regularizado de 7-8 horas (08:31).',
    sourceTranscription: 'Transcrição 08:31:28',
    sourceHistory: 'Prontuário de 24/07/2026',
    timestamp: '08:31:28',
    historyDate: '24/07/2026',
  },
  {
    id: 'att-c2',
    text: 'Adesão diária confirmada sem esquecimentos para Escitalopram 15mg/dia.',
    sourceTranscription: 'Transcrição 08:33:16',
    sourceHistory: 'Prescrição em vigor',
    timestamp: '08:33:16',
  },
  {
    id: 'att-c3',
    text: 'Pendência resolvida: médico verbalizou encaminhamento para psicoterapia TCC.',
    sourceTranscription: 'Transcrição 08:34:40',
    sourceHistory: 'Pendência registrada em 24/07/2026',
    timestamp: '08:34:40',
  },
];

export const DECISIONS_CARLA: ClinicalDecision[] = [
  {
    id: 'dec-c1',
    type: 'encaminhamento',
    title: 'Encaminhamento para Psicoterapia Cognitivo-Comportamental',
    description: 'Acompanhamento psicoterápico em TCC para suporte na consolidação de remissão de sintomas depressivos.',
    doctorUtteranceSource: 'Dr. Roberto: "vamos manter como está e vou te encaminhar para psicoterapia"',
    timestamp: '08:34:40',
    status: 'confirmado',
  },
];

export const EVOLUTION_DRAFT_CARLA: PsychiatricEvolutionDraft = {
  patientReport: {
    id: 'f-c-relato',
    title: 'Relato do Paciente',
    value: 'Paciente refere melhora substancial do quadro clínico geral nos últimos 60 dias. Relata que o sono se regularizou (dormindo 7 a 8 horas contínuas, sem despertares precoces) e que houve retomada espontânea de atividades físicas e sociais. Nega novos picos de angústia ou sintomas ansiosos incapacitantes.',
    status: 'com_fonte',
    statusLabel: 'Com fonte verificável',
    sourceText: 'Carla: "Meu sono finalmente normalizou, estou dormindo cerca de sete a oito horas seguidas e acordando disposta... Voltei a caminhar no parque"',
    sourceTimestamp: '08:31:28 e 08:32:22',
  },
  changesSinceLastConsultation: {
    id: 'f-c-mudancas',
    title: 'Mudanças Desde a Última Consulta',
    value: 'Evolução favorável comparada ao atendimento de 24/07/2026, quando apresentava insônia terminal, anedonia moderada e dificuldade de concentração laboral. Houve remissão dos despertares noturnos e recuperação do nível de energia diário.',
    status: 'com_fonte',
    statusLabel: 'Com fonte verificável',
    sourceText: 'Comparação factual entre o registro de 24/07/2026 e relato de 08:31:28.',
    sourceTimestamp: '08:31:28',
    sourceHistoryDate: '24/07/2026',
  },
  treatmentAdherence: {
    id: 'f-c-adesao',
    title: 'Adesão ao Tratamento Relatada',
    value: 'Adesão completa referida. Nega falhas ou esquecimentos na tomada matinal de Escitalopram 15mg/dia.',
    status: 'com_fonte',
    statusLabel: 'Com fonte verificável',
    sourceText: 'Carla: "Tomo pontualmente todos os dias de manhã com o café."',
    sourceTimestamp: '08:33:16',
  },
  adverseEffects: {
    id: 'f-c-efeitos',
    title: 'Efeitos Adversos Relatados',
    value: 'Nega náuseas, alterações de apetite ou disfunção gastrointestinal atual. Relata apenas sonolência vespertina transitória nas duas primeiras semanas após o ajuste de dose, já resolvida.',
    status: 'com_fonte',
    statusLabel: 'Com fonte verificável',
    sourceText: 'Carla: "Não tive náusea nenhuma e o apetite está perfeitamente normal... apenas nas duas primeiras semanas senti uma leve sonolência à tarde"',
    sourceTimestamp: '08:33:16 e 08:34:02',
  },
  mentalStatusExam: {
    id: 'f-c-eem',
    title: 'Exame do Estado Mental',
    value: '',
    status: 'bloqueado',
    statusLabel: 'Preenchimento exclusivo do médico',
    isDoctorExclusive: true,
    blockedReason: 'Atribuição clínica indelegável do médico psiquiatra. O assistente não realiza avaliações psicopatológicas.',
  },
  diagnosticHypothesis: {
    id: 'f-c-hd',
    title: 'Hipótese Diagnóstica',
    value: '',
    status: 'bloqueado',
    statusLabel: 'Preenchimento exclusivo do médico',
    isDoctorExclusive: true,
    blockedReason: 'Diagnóstico é ato privativo do médico (Lei 12.842/2013 e Resolução CFM 2.314/2022).',
  },
  planAnnouncedByDoctor: {
    id: 'f-c-plano',
    title: 'Plano Informado pelo Médico',
    value: 'Manutenção da posologia atual de Escitalopram 15mg/dia. Encaminhamento formal para psicoterapia cognitivo-comportamental (TCC). Retorno ambulatorial programado.',
    status: 'com_fonte',
    statusLabel: 'Com fonte verificável',
    sourceText: 'Dr. Roberto: "vamos manter como está a medicação e vou te encaminhar para psicoterapia cognitivo-comportamental"',
    sourceTimestamp: '08:34:40',
  },
};

// ==========================================
// CASO 2: ROBERTO ALENCAR (Contradição e Sugestão Bloqueada)
// ==========================================
export const HISTORY_ROBERTO: PsychiatricHistory = {
  consultations: [
    {
      date: '15/05/2026',
      summary: 'Paciente em fase de manutenção para TAB tipo I. Estável com Carbonato de Lítio 300mg 2x/dia (600mg/dia). Solicitada litemia de controle que ficou pendente de realização.',
      doctor: 'Dr. Roberto Guimarães',
      conduct: 'Manter Lítio 600mg/dia (uso diário contínuo). Solicitada litemia e função tireoidiana.',
    },
    {
      date: '10/01/2026',
      summary: 'Consulta de rotina. Nega episódios de humor expansivo ou depressivo no período.',
      doctor: 'Dr. Roberto Guimarães',
      conduct: 'Renovada prescrição de Lítio.',
    },
  ],
  medications: [
    {
      name: 'Carbonato de Lítio',
      dosage: '300mg',
      posology: '1 comprimido às 08h e 1 comprimido às 20h (Uso contínuo diário)',
      startedDate: '15/05/2026',
      status: 'em_uso',
    },
  ],
  labExams: [
    {
      name: 'Litemia Sérica',
      date: '12/12/2025', // Há 9 meses!
      result: '0.72 mEq/L',
      reference: '0.6 a 1.2 mEq/L (faixa terapêutica)',
      isOutdated: true,
    },
    {
      name: 'Função Tireoidiana (TSH / T4L)',
      date: '12/12/2025',
      result: 'TSH: 2.8 mUI/L • T4L: 1.1 ng/dL',
      reference: 'TSH: 0.4 a 4.5 mUI/L',
      isOutdated: true,
    },
  ],
  pendingItems: [
    {
      id: 'pend-r1',
      date: '15/05/2026',
      text: 'Exames laboratoriais solicitados (Litemia e Função Tireoidiana) não foram apresentados pelo paciente.',
      resolved: false,
    },
  ],
};

export const TRANSCRIPT_ROBERTO: TranscriptUtterance[] = [
  {
    id: 'tr-01',
    speaker: 'Dr. Roberto Guimarães',
    role: 'doctor',
    timestamp: '09:16:05',
    text: 'Bom dia, Roberto. Tudo bem? Já faz quatro meses desde nosso último encontro em maio. Como você tem se sentido?',
  },
  {
    id: 'tr-02',
    speaker: 'Roberto Alencar',
    role: 'patient',
    timestamp: '09:16:22',
    text: 'Bom dia, doutor. Eu tenho me sentido razoavelmente bem, sem crises grandes. Só fico com um pouco de tremor nas mãos de vez em quando.',
  },
  {
    id: 'tr-03',
    speaker: 'Dr. Roberto Guimarães',
    role: 'doctor',
    timestamp: '09:17:00',
    text: 'E a tomada do Lítio de 300 miligramas duas vezes ao dia? Você conseguiu manter a rotina diária?',
  },
  {
    id: 'tr-04',
    speaker: 'Roberto Alencar',
    role: 'patient',
    timestamp: '09:17:18',
    text: 'Então, doutor... para ser bem sincero, como eu estava me sentindo muito bem e o estômago às vezes pesava, comecei a tomar em dias alternados no último mês. Tomo um dia sim e um dia não.',
    evidenceId: 'EVID-CONTRADICAO-01',
  },
  {
    id: 'tr-05',
    speaker: 'Dr. Roberto Guimarães',
    role: 'doctor',
    timestamp: '09:17:50',
    text: 'Entendo o seu relato, Roberto, mas o Lítio precisa ser rigorosamente diário para manter o nível sanguíneo estável e proteger contra recaídas. Deixar de tomar em dias alternados faz o nível sérico despencar.',
  },
  {
    id: 'tr-06',
    speaker: 'Dr. Roberto Guimarães',
    role: 'doctor',
    timestamp: '09:18:25',
    text: 'Inclusive vi no seu histórico que sua última litemia foi feita em dezembro do ano passado, há cerca de nove meses. Vou pedir litemia e função da tireoide agora mesmo.',
    evidenceId: 'EVID-DECISAO-EXAMES',
  },
  {
    id: 'tr-07',
    speaker: 'Roberto Alencar',
    role: 'patient',
    timestamp: '09:18:50',
    text: 'Está certo, doutor. Eu acabei esquecendo de fazer da outra vez, mas prometo que vou colher amanhã de manhã em jejum de doze horas do remédio.',
  },
];

export const ATTENTION_POINTS_ROBERTO: ClinicalAttentionPoint[] = [
  {
    id: 'att-r1',
    text: 'Diz tomar a medicação em dias alternados (09:17); registro indica uso diário contínuo prescrito.',
    sourceTranscription: 'Transcrição 09:17:18',
    sourceHistory: 'Prescrição de 15/05/2026',
    timestamp: '09:17:18',
    historyDate: '15/05/2026',
    isContradiction: true,
  },
  {
    id: 'att-r2',
    text: 'Última litemia registrada há 9 meses (12/12/2025: 0.72 mEq/L). Exame vencido no protocolo.',
    sourceHistory: 'Prontuário de Exames Laboratoriais (12/12/2025)',
    historyDate: '12/12/2025',
  },
  {
    id: 'att-r3',
    text: 'Decisão verbalizada pelo médico: solicitação de Litemia sérica + Função tireoidiana (TSH/T4L).',
    sourceTranscription: 'Transcrição 09:18:25',
    timestamp: '09:18:25',
  },
];

export const DECISIONS_ROBERTO: ClinicalDecision[] = [
  {
    id: 'dec-r1',
    type: 'exame',
    title: 'Pedido de Exame: Litemia Sérica + TSH + T4 Livre',
    description: 'Monitoramento do nível terapêutico de Lítio e rastreio de função tireoidiana em paciente sob uso de Carbonato de Lítio.',
    doctorUtteranceSource: 'Dr. Roberto: "Vou pedir litemia e função da tireoide agora mesmo."',
    timestamp: '09:18:25',
    status: 'confirmado',
  },
];

export const EVOLUTION_DRAFT_ROBERTO: PsychiatricEvolutionDraft = {
  patientReport: {
    id: 'f-r-relato',
    title: 'Relato do Paciente',
    value: 'Paciente em acompanhamento para Transtorno Afetivo Bipolar comparece para consulta de reavaliação. Refere estabilidade relativa do humor, sem sintomas psicóticos ou episódios de virada maníaca recentes. Queixa-se de tremor distal leve e intermitente em membros superiores.',
    status: 'com_fonte',
    statusLabel: 'Com fonte verificável',
    sourceText: 'Roberto: "Eu tenho me sentido razoavelmente bem, sem crises grandes. Só fico com um pouco de tremor nas mãos de vez em quando."',
    sourceTimestamp: '09:16:22',
  },
  changesSinceLastConsultation: {
    id: 'f-r-mudancas',
    title: 'Mudanças Desde a Última Consulta',
    value: 'Relata introdução não orientada de esquema de tomada em dias alternados no último mês, motivada por desconforto gástrico leve. Não realizou os exames solicitados na consulta de 15/05/2026.',
    status: 'com_fonte',
    statusLabel: 'Com fonte verificável',
    sourceText: 'Comparação factual entre o prontuário de 15/05/2026 e o relato de 09:17:18.',
    sourceTimestamp: '09:17:18',
    sourceHistoryDate: '15/05/2026',
  },
  treatmentAdherence: {
    id: 'f-r-adesao',
    title: 'Adesão ao Tratamento Relatada',
    value: 'CONTRADIÇÃO FACTUAL DETECTADA: O paciente verbalizou hoje que está tomando o Carbonato de Lítio em dias alternados ("dia sim, dia não"), divergindo do registro de prontuário que prescreve uso diário contínuo de 300mg de 12/12h.',
    status: 'contraditorio',
    statusLabel: 'Contraditório (Fontes divergentes)',
    isContradiction: true,
    contradictionSourceA: {
      label: 'Prontuário Anterior (15/05/2026)',
      text: 'Carbonato de Lítio 300mg: 1 cp 2x/dia (Uso contínuo diário obrigatório).',
      date: '15/05/2026',
    },
    contradictionSourceB: {
      label: 'Fala do Paciente na Transcrição (09:17)',
      text: 'Roberto: "comecei a tomar em dias alternados no último mês. Tomo um dia sim e um dia não."',
      timestamp: '09:17:18',
    },
  },
  adverseEffects: {
    id: 'f-r-efeitos',
    title: 'Efeitos Adversos Relatados',
    value: 'Tremor fino intermitente em extremidades superiores e relato de peso gástrico ocasional que motivou a irregularidade na posologia.',
    status: 'com_fonte',
    statusLabel: 'Com fonte verificável',
    sourceText: 'Roberto: "o estômago às vezes pesava... um pouco de tremor nas mãos"',
    sourceTimestamp: '09:16:22 e 09:17:18',
  },
  mentalStatusExam: {
    id: 'f-r-eem',
    title: 'Exame do Estado Mental',
    value: '',
    status: 'sugestao_bloqueada',
    statusLabel: 'Sugestão bloqueada pelo sistema',
    isDoctorExclusive: true,
    isBlockedSuggestion: true,
    blockedSuggestionText: 'O modelo de IA inferiu previamente a hipótese de "humor eutímico e afeto congruente", porém a sugestão foi sumariamente bloqueada e riscada por ser atribuição clínica exclusiva do médico psiquiatra.',
    blockedReason: 'Exame do Estado Mental é preenchimento exclusivo do médico. A IA não pode preencher nem sugerir terminologia psicopatológica.',
  },
  diagnosticHypothesis: {
    id: 'f-r-hd',
    title: 'Hipótese Diagnóstica',
    value: '',
    status: 'bloqueado',
    statusLabel: 'Preenchimento exclusivo do médico',
    isDoctorExclusive: true,
    blockedReason: 'Atribuição exclusiva do médico psiquiatra assistente.',
  },
  planAnnouncedByDoctor: {
    id: 'f-r-plano',
    title: 'Plano Informado pelo Médico',
    value: 'Orientação enfática sobre a necessidade estrita de tomada diária contínua do Carbonato de Lítio. Solicitada litemia sérica (em jejum de 12h da última tomada) e função tireoidiana (TSH e T4 livre).',
    status: 'com_fonte',
    statusLabel: 'Com fonte verificável',
    sourceText: 'Dr. Roberto: "o Lítio precisa ser rigorosamente diário... Vou pedir litemia e função da tireoide agora mesmo."',
    sourceTimestamp: '09:17:50 e 09:18:25',
  },
};

// ==========================================
// CASO 3: LÚCIA FERREIRA (Alerta de Risco)
// ==========================================
export const HISTORY_LUCIA: PsychiatricHistory = {
  consultations: [
    {
      date: '10/08/2026',
      summary: 'Retorno ambulatorial. Queixa de fadiga intensa, sobrecarga materna e choro fácil. Iniciada Sertralina 50mg/dia e prescrito Zolpidem 5mg SOS para insônia.',
      doctor: 'Dr. Roberto Guimarães',
      conduct: 'Sertralina 50mg pela manhã. Avaliação de segurança e rede de apoio familiar.',
    },
  ],
  medications: [
    {
      name: 'Sertralina',
      dosage: '50mg',
      posology: '1 comprimido pela manhã',
      startedDate: '10/08/2026',
      status: 'em_uso',
    },
    {
      name: 'Zolpidem',
      dosage: '5mg',
      posology: '1 comprimido ao deitar em caso de insônia refratária (SOS)',
      startedDate: '10/08/2026',
      status: 'em_uso',
    },
  ],
  labExams: [],
  pendingItems: [],
};

export const TRANSCRIPT_LUCIA: TranscriptUtterance[] = [
  {
    id: 'tl-01',
    speaker: 'Dr. Roberto Guimarães',
    role: 'doctor',
    timestamp: '14:20:10',
    text: 'Boa tarde, Lúcia. Como você tem se sentido nas últimas semanas com a Sertralina?',
  },
  {
    id: 'tl-02',
    speaker: 'Lúcia Ferreira',
    role: 'patient',
    timestamp: '14:20:45',
    text: 'Boa tarde, doutor. Tem sido muito difícil. Sinto um cansaço absurdo todos os dias e parece que as coisas não têm mais cor.',
  },
  {
    id: 'tl-03',
    speaker: 'Dr. Roberto Guimarães',
    role: 'doctor',
    timestamp: '14:21:30',
    text: 'Sinto muito ouvir isso. Você tem conseguido dormir ou se alimentar adequadamente?',
  },
  {
    id: 'tl-04',
    speaker: 'Lúcia Ferreira',
    role: 'patient',
    timestamp: '14:22:00',
    text: 'Quase não tenho apetite. E o sono é agitado.',
  },
  {
    id: 'tl-05',
    speaker: 'Lúcia Ferreira',
    role: 'patient',
    timestamp: '14:22:20',
    text: 'Às vezes penso que seria melhor não acordar. Dá uma vontade de que tudo simplesmente parasse.',
    evidenceId: 'EVID-RISCO-LITERAL',
    isRiskMention: true,
  },
  {
    id: 'tl-06',
    speaker: 'Dr. Roberto Guimarães',
    role: 'doctor',
    timestamp: '14:23:00',
    text: 'Lúcia, quero que você saiba que estou aqui com você e vamos cuidar disso com toda a seriedade. Quando você pensa isso, já chegou a pensar em alguma forma de machucar a si mesma ou é uma vontade de sumir?',
  },
  {
    id: 'tl-07',
    speaker: 'Lúcia Ferreira',
    role: 'patient',
    timestamp: '14:23:35',
    text: 'Não planejei nada, doutor. É mais um desespero de cansaço... meus filhos são pequenos e eu amo eles, não faria isso com eles, mas sinto um esgotamento que não passa.',
  },
];

export const RISK_ALERT_LUCIA: RiskAlertData = {
  hasRisk: true,
  literalText: 'às vezes penso que seria melhor não acordar',
  timestamp: '14:22',
  evaluatedByDoctor: false,
  doctorEvaluationNotes: '',
};

export const ATTENTION_POINTS_LUCIA: ClinicalAttentionPoint[] = [
  {
    id: 'att-l1',
    text: 'ALERTA DE RISCO IDENTIFICADO: Em 14:22 a paciente verbalizou literalmente: "às vezes penso que seria melhor não acordar". Avaliação do médico mandatória.',
    sourceTranscription: 'Transcrição 14:22:20',
    timestamp: '14:22:20',
  },
  {
    id: 'att-l2',
    text: 'Persistência de anedonia e hiporexia com 40 dias de Sertralina 50mg/dia.',
    sourceTranscription: 'Transcrição 14:20:45 e 14:22:00',
    timestamp: '14:22:00',
  },
];

export const EVOLUTION_DRAFT_LUCIA: PsychiatricEvolutionDraft = {
  patientReport: {
    id: 'f-l-relato',
    title: 'Relato do Paciente',
    value: 'Paciente relata persistência de humor deprimido, fadiga intensa e anedonia marcada. Verbalizou frase de desânimo existencial aos 14:22: "às vezes penso que seria melhor não acordar". Nega planejamento suicida estruturado, referindo presença de forte fator de proteção (vínculo afetivo com os filhos pequenos).',
    status: 'com_fonte',
    statusLabel: 'Com fonte verificável (Alerta de Risco)',
    sourceText: 'Lúcia: "Às vezes penso que seria melhor não acordar. Dá uma vontade de que tudo simplesmente parasse."',
    sourceTimestamp: '14:22:20',
  },
  changesSinceLastConsultation: {
    id: 'f-l-mudancas',
    title: 'Mudanças Desde a Última Consulta',
    value: 'Quadro sem melhora expressiva em relação à consulta de 10/08/2026. Mantém padrão de sono fragmentado e apetite reduzido.',
    status: 'com_fonte',
    statusLabel: 'Com fonte verificável',
    sourceText: 'Comparação com o prontuário de 10/08/2026 e relato de 14:20:45.',
    sourceTimestamp: '14:20:45',
    sourceHistoryDate: '10/08/2026',
  },
  treatmentAdherence: {
    id: 'f-l-adesao',
    title: 'Adesão ao Tratamento Relatada',
    value: 'Refere uso contínuo de Sertralina 50mg/dia pela manhã conforme prescrição.',
    status: 'com_fonte',
    statusLabel: 'Com fonte verificável',
    sourceText: 'Transcrição 14:20:10 a 14:21:00',
    sourceTimestamp: '14:20:45',
  },
  adverseEffects: {
    id: 'f-l-efeitos',
    title: 'Efeitos Adversos Relatados',
    value: 'Nega efeitos colaterais agudos relatados (como náusea, diarreia ou palpitações).',
    status: 'com_fonte',
    statusLabel: 'Com fonte verificável',
    sourceText: 'Transcrição 14:21:30',
    sourceTimestamp: '14:21:30',
  },
  mentalStatusExam: {
    id: 'f-l-eem',
    title: 'Exame do Estado Mental',
    value: '',
    status: 'bloqueado',
    statusLabel: 'Preenchimento exclusivo do médico',
    isDoctorExclusive: true,
    blockedReason: 'Preenchimento exclusivo do médico. A IA não realiza avaliação psicopatológica.',
  },
  diagnosticHypothesis: {
    id: 'f-l-hd',
    title: 'Hipótese Diagnóstica',
    value: '',
    status: 'bloqueado',
    statusLabel: 'Preenchimento exclusivo do médico',
    isDoctorExclusive: true,
    blockedReason: 'Preenchimento exclusivo do médico.',
  },
  planAnnouncedByDoctor: {
    id: 'f-l-plano',
    title: 'Plano Informado pelo Médico',
    value: 'Acolhimento da queixa com exploração de ideação passiva de morte. Reavaliação de conduta farmacológica e pactuação de segurança.',
    status: 'com_fonte',
    statusLabel: 'Com fonte verificável',
    sourceText: 'Dr. Roberto: "vamos cuidar disso com toda a seriedade... Já pensou em alguma forma de machucar a si mesma ou é uma vontade de sumir?"',
    sourceTimestamp: '14:23:00',
  },
};

// ==========================================
// CASO 4: PAULO SILVEIRA (Recusa de Consentimento / Modo Manual)
// ==========================================
export const HISTORY_PAULO: PsychiatricHistory = {
  consultations: [],
  medications: [
    {
      name: 'Losartana',
      dosage: '50mg',
      posology: '1 comprimido pela manhã',
      startedDate: 'Cardiologia',
      status: 'em_uso',
    },
  ],
  labExams: [],
  pendingItems: [],
};

export const TRANSCRIPT_PAULO: TranscriptUtterance[] = [];
