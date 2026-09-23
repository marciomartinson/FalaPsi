export type ScreenId =
  | 'fila-do-plantao'
  | 'consentimento'
  | 'atendimento'
  | 'rascunho'
  | 'excecao'
  | 'auditoria';

export type ConsultationType = 'Primeira consulta' | 'Retorno';

export type AppointmentStatus =
  | 'Agendado'
  | 'Em consulta'
  | 'Rascunho para revisão'
  | 'Pendência'
  | 'Assinado';

export interface PsychiatricPatient {
  id: string;
  name: string;
  age: number;
  time: string;
  type: ConsultationType;
  lastConsultationDate: string;
  status: AppointmentStatus;
  recordNumber: string;
  caseKey: 'carla' | 'roberto' | 'lucia' | 'paulo' | 'mariana' | 'eduardo';
  synopsis: string;
  currentMedications?: string[];
}

// Alias for compatibility
export type Patient = PsychiatricPatient;

export interface MedicalHistoryItem {
  date: string;
  summary: string;
  doctor: string;
  conduct: string;
}

export interface PsychiatricHistory {
  consultations: MedicalHistoryItem[];
  medications: Array<{
    name: string;
    dosage: string;
    posology: string;
    startedDate: string;
    status: 'em_uso' | 'suspenso' | 'ajustado';
  }>;
  labExams: Array<{
    name: string;
    date: string;
    result: string;
    reference: string;
    isOutdated?: boolean;
  }>;
  pendingItems: Array<{
    id: string;
    date: string;
    text: string;
    resolved: boolean;
  }>;
}

export interface TranscriptUtterance {
  id: string;
  speaker: string;
  role: 'doctor' | 'patient' | 'system';
  timestamp: string;
  text: string;
  evidenceId?: string;
  confidence?: string;
  isUncertain?: boolean; // Trecho incerto sublinhado em cinza
  isRiskMention?: boolean; // Menção a risco literal
}

export interface ClinicalAttentionPoint {
  id: string;
  text: string;
  sourceTranscription?: string;
  sourceHistory?: string;
  timestamp?: string;
  historyDate?: string;
  isContradiction?: boolean;
}

export interface ClinicalDecision {
  id: string;
  type: 'exame' | 'encaminhamento';
  title: string;
  description: string;
  doctorUtteranceSource: string;
  timestamp: string;
  status: 'detectado' | 'confirmado' | 'ignorado';
}

export type FieldStatus =
  | 'com_fonte'
  | 'bloqueado'
  | 'contraditorio'
  | 'sugestao_bloqueada';

export interface DraftField {
  id: string;
  title: string;
  value: string;
  status: FieldStatus;
  statusLabel: string;
  sourceText?: string;
  sourceTimestamp?: string;
  sourceHistory?: string;
  sourceHistoryDate?: string;
  isDoctorExclusive?: boolean;
  blockedReason?: string;
  isBlockedSuggestion?: boolean;
  blockedSuggestionText?: string;
  isContradiction?: boolean;
  contradictionSourceA?: { label: string; text: string; date?: string };
  contradictionSourceB?: { label: string; text: string; timestamp?: string };
  actionState?: 'aceito' | 'editado' | 'ignorado' | 'pendente';
  doctorEditedValue?: string;
}

export interface PsychiatricEvolutionDraft {
  patientReport: DraftField;
  changesSinceLastConsultation: DraftField;
  treatmentAdherence: DraftField;
  adverseEffects: DraftField;
  mentalStatusExam: DraftField; // Preenchimento exclusivo do médico
  diagnosticHypothesis: DraftField; // Preenchimento exclusivo do médico
  planAnnouncedByDoctor: DraftField;
}

export interface RiskAlertData {
  hasRisk: boolean;
  literalText: string;
  timestamp: string;
  evaluatedByDoctor: boolean;
  doctorEvaluationNotes: string;
}

export interface DoctorUser {
  id: string;
  name: string;
  email: string;
  crm: string;
  initials: string;
  specialty: string;
  boxLocation: string;
}

export const MOCK_DOCTORS: DoctorUser[] = [
  {
    id: 'doc-psi-1',
    name: 'Dr. Roberto Guimarães',
    email: 'roberto.guimaraes@falapsi.med.br',
    crm: 'CRM/SP 148.920 • RQE 82.119',
    initials: 'RG',
    specialty: 'Psiquiatria Ambulatorial',
    boxLocation: 'Consultório 03 • Ambulatório de Especialidades',
  },
];

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'arrival' | 'cfm' | 'alert' | 'system';
  read: boolean;
  patientId?: string;
}
