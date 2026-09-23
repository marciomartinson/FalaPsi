import { useState } from 'react';
import {
  ScreenId,
  PsychiatricPatient,
  TranscriptUtterance,
  ClinicalDecision,
  DoctorUser,
  MOCK_DOCTORS,
  AppNotification,
} from './types/clinical';
import {
  PSYCHIATRIC_PATIENTS,
  TRANSCRIPT_CARLA,
  TRANSCRIPT_ROBERTO,
  TRANSCRIPT_LUCIA,
  TRANSCRIPT_PAULO,
  DECISIONS_CARLA,
  DECISIONS_ROBERTO,
} from './data/mockClinicalData';
import { Header } from './components/Header';
import { ScreenLogin } from './components/screens/ScreenLogin';
import { ScreenFilaPlantao } from './components/screens/ScreenFilaPlantao';
import { ScreenConsentimento } from './components/screens/ScreenConsentimento';
import { ScreenAtendimentoTranscricao } from './components/screens/ScreenAtendimentoTranscricao';
import { ScreenRevisaoRascunho } from './components/screens/ScreenRevisaoRascunho';
import { ScreenExcecaoSemDecisao } from './components/screens/ScreenExcecaoSemDecisao';
import { ScreenResumoAuditoria } from './components/screens/ScreenResumoAuditoria';
import { PrintGuidesModal } from './components/modals/PrintGuidesModal';
import { QrCodeModal } from './components/modals/QrCodeModal';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<DoctorUser>(MOCK_DOCTORS[0]);

  // Psychiatric outpatient agenda
  const [patients, setPatients] = useState<PsychiatricPatient[]>(PSYCHIATRIC_PATIENTS);
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('fila-do-plantao');
  const [selectedCase, setSelectedCase] = useState<any>('carla');
  const [currentPatient, setCurrentPatient] = useState<PsychiatricPatient>(PSYCHIATRIC_PATIENTS[0]);

  // Live active consultation transcription & detected decisions
  const [liveTranscript, setLiveTranscript] = useState<TranscriptUtterance[]>(TRANSCRIPT_CARLA);
  const [liveDecisions, setLiveDecisions] = useState<ClinicalDecision[]>(DECISIONS_CARLA);

  // Clinic and psychiatric regulatory notifications
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif-cfm-1',
      title: 'Salvaguardas CFM 2.314/2022 Ativas',
      description: 'Campos diagnósticos e de conduta sob preenchimento exclusivo do médico psiquiatra.',
      timestamp: '08:00',
      type: 'cfm',
      read: true,
    },
    {
      id: 'notif-agenda-init',
      title: 'Agenda Ambulatorial Sincronizada',
      description: '4 pacientes agendados para a sessão matinal do Consultório 03.',
      timestamp: '08:02',
      type: 'system',
      read: true,
    },
  ]);

  // Modals state
  const [isPrintGuidesModalOpen, setIsPrintGuidesModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Mark notifications read
  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleSelectPatientFromNotification = (patientId: string) => {
    const p = patients.find((x) => x.id === patientId);
    if (p) {
      handleSelectPatient(p, 'consentimento');
    }
  };

  // Login handler
  const handleLogin = (doctor: DoctorUser) => {
    setCurrentUser(doctor);
    setIsAuthenticated(true);
    setCurrentScreen('fila-do-plantao');
  };

  // Logout handler
  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentScreen('fila-do-plantao');
  };

  // Switch synthetic case
  const handleSelectCase = (caseKey: 'carla' | 'roberto' | 'lucia' | 'paulo') => {
    setSelectedCase(caseKey);
    const found = patients.find((p) => p.caseKey === caseKey);
    if (found) {
      setCurrentPatient(found);
    }

    if (caseKey === 'carla') {
      setLiveTranscript(TRANSCRIPT_CARLA);
      setLiveDecisions(DECISIONS_CARLA);
      setCurrentScreen('rascunho');
    } else if (caseKey === 'roberto') {
      setLiveTranscript(TRANSCRIPT_ROBERTO);
      setLiveDecisions(DECISIONS_ROBERTO);
      setCurrentScreen('rascunho');
    } else if (caseKey === 'lucia') {
      setLiveTranscript(TRANSCRIPT_LUCIA);
      setLiveDecisions([]);
      setCurrentScreen('atendimento');
    } else if (caseKey === 'paulo') {
      setLiveTranscript(TRANSCRIPT_PAULO);
      setLiveDecisions([]);
      setCurrentScreen('excecao');
    }
  };

  // Handle patient select from Agenda: starts at Step 2 (Consentimento)
  const handleSelectPatient = (patient: PsychiatricPatient, targetScreen?: ScreenId) => {
    setCurrentPatient(patient);
    setSelectedCase(patient.caseKey);

    if (patient.caseKey === 'roberto') {
      setLiveTranscript(TRANSCRIPT_ROBERTO);
      setLiveDecisions(DECISIONS_ROBERTO);
    } else if (patient.caseKey === 'lucia') {
      setLiveTranscript(TRANSCRIPT_LUCIA);
      setLiveDecisions([]);
    } else if (patient.caseKey === 'paulo') {
      setLiveTranscript(TRANSCRIPT_PAULO);
      setLiveDecisions([]);
    } else {
      setLiveTranscript(TRANSCRIPT_CARLA);
      setLiveDecisions(DECISIONS_CARLA);
    }

    if (targetScreen) {
      setCurrentScreen(targetScreen);
    } else if (patient.caseKey === 'paulo') {
      setCurrentScreen('consentimento');
    } else {
      setCurrentScreen('consentimento');
    }
  };

  if (!isAuthenticated) {
    return <ScreenLogin onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col font-sans selection:bg-[#bae6fd] selection:text-[#0369a1]">
      {/* Universal Fixed Header */}
      <Header
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        selectedCase={selectedCase}
        onSelectCase={handleSelectCase}
        currentUser={currentUser}
        onLogout={handleLogout}
        notifications={notifications}
        onMarkNotificationAsRead={handleMarkNotificationAsRead}
        onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
        onSelectPatientFromNotification={handleSelectPatientFromNotification}
        waitingPatientsCount={patients.filter((p) => p.status === 'Agendado').length}
      />

      {/* Screen Views */}
      <div className="flex-1 flex flex-col">
        {currentScreen === 'fila-do-plantao' && (
          <ScreenFilaPlantao
            patients={patients}
            onSelectPatient={handleSelectPatient}
            onNavigate={setCurrentScreen}
          />
        )}

        {currentScreen === 'consentimento' && (
          <ScreenConsentimento
            currentPatient={currentPatient}
            onNavigate={setCurrentScreen}
            onSelectCase={handleSelectCase}
          />
        )}

        {currentScreen === 'atendimento' && (
          <ScreenAtendimentoTranscricao
            patient={currentPatient}
            onNavigate={setCurrentScreen}
            onSelectCase={handleSelectCase}
            liveTranscript={liveTranscript}
            setLiveTranscript={setLiveTranscript}
            liveDecisions={liveDecisions}
            setLiveDecisions={setLiveDecisions}
          />
        )}

        {currentScreen === 'rascunho' && (
          <ScreenRevisaoRascunho
            currentPatient={currentPatient}
            onNavigate={setCurrentScreen}
            onOpenPrintGuidesModal={() => setIsPrintGuidesModalOpen(true)}
            onSelectCase={handleSelectCase}
          />
        )}

        {currentScreen === 'excecao' && (
          <ScreenExcecaoSemDecisao
            currentPatient={currentPatient}
            onNavigate={setCurrentScreen}
            onSelectCase={handleSelectCase}
          />
        )}

        {currentScreen === 'auditoria' && (
          <ScreenResumoAuditoria
            currentPatient={currentPatient}
            onNavigate={setCurrentScreen}
            onOpenQrModal={() => setIsQrModalOpen(true)}
          />
        )}
      </div>

      {/* MODALS */}
      {/* 1. Print Guides Modal */}
      <PrintGuidesModal
        isOpen={isPrintGuidesModalOpen}
        onClose={() => setIsPrintGuidesModalOpen(false)}
        patientName={currentPatient.name}
        recordNumber={currentPatient.recordNumber}
      />

      {/* 2. QR Code Auditor Mobile Modal */}
      <QrCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        patientName={currentPatient.name}
        documentHash="CFM-2314-PSI-SP"
      />
    </div>
  );
}
