import { ClinicalDecision } from '../types/clinical';

export type DiarizationMode = 'auto' | 'doctor' | 'patient';

export interface SpeakerDiarizationResult {
  role: 'doctor' | 'patient';
  speaker: string;
  confidence: number;
  reason: string;
  isQuestion: boolean;
  questionType?: 'doctor_probe' | 'patient_inquiry';
  badge: string;
}

/**
 * Checks if a transcribed sentence is an interrogation/question.
 */
export function isQuestionUtterance(text: string): boolean {
  const clean = text.trim().toLowerCase();
  if (clean.includes('?')) return true;

  // Interrogative beginnings in spoken Portuguese
  return /^(como|onde|quando|quanto|quantos|qual|quais|por que|porque|quem|será que|você|vc|o senhor|a senhora|dói|sente|consegue|está|tem|já|posso|vou|devo|é grave|é normal|quebrou|trincou)\b/i.test(clean);
}

/**
 * Intelligent speaker identification for medical consultations.
 * Automatically detects whether speech or questions belong to the Doctor or the Patient.
 */
export function detectSpeakerRole(
  text: string,
  patientName: string,
  doctorName: string = 'Dr. Marcelo Ribeiro',
  lastRole?: 'doctor' | 'patient',
  forcedMode: DiarizationMode = 'auto',
  lastUtteranceText?: string
): SpeakerDiarizationResult {
  const clean = text.toLowerCase().trim();
  const isQuestion = isQuestionUtterance(text);

  if (forcedMode === 'doctor') {
    return {
      role: 'doctor',
      speaker: doctorName,
      confidence: 1.0,
      reason: 'Modo fixado no Médico',
      isQuestion,
      questionType: isQuestion ? 'doctor_probe' : undefined,
      badge: isQuestion ? 'Pergunta Médica' : 'Fala do Médico',
    };
  }

  if (forcedMode === 'patient') {
    return {
      role: 'patient',
      speaker: patientName,
      confidence: 1.0,
      reason: 'Modo fixado no Paciente',
      isQuestion,
      questionType: isQuestion ? 'patient_inquiry' : undefined,
      badge: isQuestion ? 'Pergunta do Paciente' : 'Relato do Paciente',
    };
  }

  // 1. Direct address to Doctor -> High confidence Patient (asking or answering)
  if (/\b(doutor|doutora|dr\.|dra\.|dr\b|dra\b|o senhor|a senhora)\b/i.test(clean)) {
    return {
      role: 'patient',
      speaker: patientName,
      confidence: 0.98,
      reason: isQuestion ? 'Pergunta direcionada ao médico ("Doutor...")' : 'Vocativo ao médico ("Doutor...")',
      isQuestion,
      questionType: isQuestion ? 'patient_inquiry' : undefined,
      badge: isQuestion ? 'Pergunta do Paciente' : 'Relato do Paciente',
    };
  }

  // 2. Specific Patient Question Patterns:
  // Patient asking about prognosis, treatment, restrictions, fears, medications
  const patientQuestionPatterns = [
    /\b(vou (precisar|ter que|ficar|poder|conseguir)|posso (pisar|andar|tomar|colocar|fazer|trabalhar|voltar|dirigir|jogar|correr))\b/i,
    /\b(devo (fazer|tomar|colocar|esperar)|tenho que (fazer|tomar|usar|ficar|voltar)|preciso (fazer|tomar|usar|voltar|operar))\b/i,
    /\b(é (grave|perigoso|fratura|normal|ruim|muito sério)|quebrou|trincou|rompeu|tem perigo|vai demorar|vai doer)\b/i,
    /\b(precisa (operar|engessar|de cirurgia|de ponto|de gesso)|quanto tempo (vou ficar|de repouso|vai demorar))\b/i,
    /\b(quando (posso|vou poder|devo voltar|vou estar bom)|o que (eu faço|acontece se|pode ser))\b/i,
    /\b(tem algum remédio|qual remédio|o remédio vai|posso colocar gelo|coloco gelo|dói muito)\b/i,
    /\b(o senhor acha|você acha que quebrou|posso colocar o pé)\b/i,
  ];

  // 3. Specific Doctor Question Patterns:
  // Clinical anamnesis questions investigating symptoms, trauma, medical history, physical sensations
  const doctorQuestionPatterns = [
    /\b(onde (dói|está doendo|bateu|foi o impacto)|como (está|foi|aconteceu|começou|você se sente|é a dor)|quando (aconteceu|começou|foi))\b/i,
    /\b(sente (dor|formigamento|dormência|os dedos|pontada|choque)|dói (aqui|quando|ao|se|nesta|nesse|muito|bastante))\b/i,
    /\b(consegue (apoiar|pisar|mexer|dobrar|levantar|andar|ficar de pé)|está conseguindo (andar|pisar|mexer|dormir))\b/i,
    /\b(você (tem|já teve|toma|tomou|lembra|notou|sentiu|caiu|bateu)|tem (alergia|pressão|diabetes|doença|histórico))\b/i,
    /\b(qual (é a nota|a intensidade|o remédio|é a sua queixa)|de zero a dez|há quanto tempo|desde que horas|quantas horas)\b/i,
    /\b(me (conte|mostre|diga|explique)|alguma (alergia|outra queixa|dúvida|reação)|já quebrou|já torceu)\b/i,
    /\b(tomou alguma medicação|esqueceu alguma dose|teve febre|inchou na hora|deu estalo)\b/i,
  ];

  // 4. General Doctor Markers (orientations, exams, prescriptions, conducts)
  const doctorConductPatterns = [
    /\b(vamos (manter|ajustar|fazer|solicitar|pedir|imobilizar|encaminhar)|vou (pedir|solicitar|prescrever|receitar|examinar|palpar|encaminhar|orientar))\b/i,
    /\b(raio-x|radiografia|tomografia|ressonância|tala|gesso|imobilização|ortopedia|analgésico|anti-inflamatório|dipirona|paracetamol)\b/i,
    /\b(prescrição|receita|posologia|comprimido|comprimidos|repouso|elevação do membro|compressa|gelo por 20 minutos)\b/i,
    /\b(olá|boa tarde|bom dia|pode entrar|fique à vontade|bem-vindo|sente-se)\b/i,
    /\b(compreendo|perfeito|vou verificar|vou avaliar|deixe-me examinar)\b/i,
  ];

  // 5. General Patient Markers (subjective complaints, trauma history, pain adjectives, personal body references)
  const patientReportPatterns = [
    /\b(eu (caí|pisei|torci|bati|sinto|tomei|esqueci|estava|fui)|pisei de mau jeito|deu um estalo|estalo alto|inchou muito|não consigo (pisar|andar|apoiar|colocar o pé))\b/i,
    /\b(meu tornozelo|meu pé|minha perna|meu joelho|minha dor|meu osso|meu ligamento|meus dedos|minha cabeça)\b/i,
    /\b(dói muito|dói demais|tá doendo|dor insuportável|pontada|latejando|queimação|não aguento|ai\, sim|exatamente aí)\b/i,
    /\b(não tenho alergia|nunca tive reação|que eu saiba não|não tomo nada|estava jogando bola|no futebol)\b/i,
    /\b(sim|não|aí mesmo|doeu|na hora inchou)\b/i,
  ];

  let doctorScore = 0;
  let patientScore = 0;

  if (isQuestion) {
    for (const p of patientQuestionPatterns) {
      if (p.test(clean)) patientScore += 3.0;
    }
    for (const p of doctorQuestionPatterns) {
      if (p.test(clean)) doctorScore += 3.0;
    }
  }

  for (const p of doctorConductPatterns) {
    if (p.test(clean)) doctorScore += 1.8;
  }

  for (const p of patientReportPatterns) {
    if (p.test(clean)) patientScore += 1.8;
  }

  // Conversational Turn-Taking context
  const lastWasDoctorQuestion =
    lastRole === 'doctor' &&
    lastUtteranceText &&
    (lastUtteranceText.trim().endsWith('?') ||
      /\b(como|onde|quando|quanto|qual|consegue|sente|tem|dói)\b/i.test(lastUtteranceText));

  const lastWasPatientQuestion =
    lastRole === 'patient' &&
    lastUtteranceText &&
    (lastUtteranceText.trim().endsWith('?') ||
      /\b(doutor|vou precisar|posso|é grave|quebrou)\b/i.test(lastUtteranceText));

  // If doctor asked a question and current utterance is NOT a question, it's very likely the patient answering!
  if (lastWasDoctorQuestion && !isQuestion) {
    patientScore += 2.5;
  }
  // If patient asked a question, doctor will typically respond
  if (lastWasPatientQuestion && !isQuestion) {
    doctorScore += 2.5;
  }

  // Speaker decision
  let selectedRole: 'doctor' | 'patient' = 'doctor';
  let reason = '';
  let badge = '';

  if (patientScore > doctorScore + 0.3) {
    selectedRole = 'patient';
    if (isQuestion) {
      reason = 'Pergunta de dúvida/prognóstico formulada pelo paciente';
      badge = 'Pergunta do Paciente';
    } else {
      reason = lastWasDoctorQuestion ? 'Resposta direta ao questionamento do médico' : 'Relato subjetivo de sintomas do paciente';
      badge = 'Relato do Paciente';
    }
  } else if (doctorScore > patientScore + 0.3) {
    selectedRole = 'doctor';
    if (isQuestion) {
      reason = 'Pergunta clínica de anamnese realizada pelo médico';
      badge = 'Pergunta Médica';
    } else {
      reason = 'Enunciação médica / conduta clínica';
      badge = 'Conduta Médica';
    }
  } else {
    // If scores are tied or ambiguous:
    if (isQuestion) {
      // General questions in clinical context without patient cues are typically clinical inquiries by doctor
      selectedRole = 'doctor';
      reason = 'Pergunta clínica (Médico)';
      badge = 'Pergunta Médica';
    } else if (lastRole === 'doctor') {
      selectedRole = lastWasDoctorQuestion ? 'patient' : 'doctor';
      reason = lastWasDoctorQuestion ? 'Resposta ao médico' : 'Continuidade do médico';
      badge = selectedRole === 'doctor' ? 'Conduta Médica' : 'Relato do Paciente';
    } else if (lastRole === 'patient') {
      selectedRole = 'patient';
      reason = 'Continuidade do paciente';
      badge = 'Relato do Paciente';
    } else {
      selectedRole = 'doctor';
      reason = 'Acolhimento inicial do médico';
      badge = 'Fala do Médico';
    }
  }

  const isDoc = selectedRole === 'doctor';
  return {
    role: selectedRole,
    speaker: isDoc ? doctorName : patientName,
    confidence: Math.min(0.99, 0.85 + Math.abs(doctorScore - patientScore) * 0.05),
    reason,
    isQuestion,
    questionType: isQuestion ? (isDoc ? 'doctor_probe' : 'patient_inquiry') : undefined,
    badge,
  };
}

/**
 * Checks for explicit psychiatric risk expressions in transcribed text.
 */
export function detectRiskMention(text: string): boolean {
  const clean = text.toLowerCase();
  return (
    clean.includes('não acordar') ||
    clean.includes('desaparecer') ||
    clean.includes('morrer') ||
    clean.includes('suicíd') ||
    clean.includes('me matar') ||
    clean.includes('acabar com tudo') ||
    clean.includes('tirar minha vida') ||
    clean.includes('não aguento mais viver') ||
    clean.includes('autoles') ||
    clean.includes('me cortar')
  );
}

/**
 * Extracts formal clinical decisions (exams, referrals, medications) only if spoken by the doctor.
 */
export function detectClinicalDecisions(
  text: string,
  speakerRole: 'doctor' | 'patient',
  timestamp: string
): ClinicalDecision[] {
  if (speakerRole !== 'doctor') return [];

  const clean = text.toLowerCase();
  const decisions: ClinicalDecision[] = [];

  // Orthopedic and Emergency Exams
  if (clean.includes('raio-x') || clean.includes('radiografia') || (clean.includes('exame') && clean.includes('imagem'))) {
    decisions.push({
      id: `dec-${Date.now()}-raiox`,
      type: 'exame',
      title: 'Raio-X de Tornozelo Direito (AP e Perfil)',
      description: 'Regra Ottawa: Dor em maléolo lateral e incapacidade de sustentar peso.',
      doctorUtteranceSource: `Dr. Marcelo: "${text}"`,
      timestamp,
      status: 'confirmado',
    });
  }

  // Orthopedic Referral
  if (clean.includes('ortopedia') || clean.includes('traumatologia') || clean.includes('especialista')) {
    decisions.push({
      id: `dec-${Date.now()}-ortopedia`,
      type: 'encaminhamento',
      title: 'Ortopedia e Traumatologia',
      description: 'Avaliação pós-imagem e imobilização provisória (tala gessada).',
      doctorUtteranceSource: `Dr. Marcelo: "${text}"`,
      timestamp,
      status: 'confirmado',
    });
  }

  // Medications
  if (clean.includes('dipirona') || clean.includes('prescrever') || clean.includes('receitar') || clean.includes('analgésico')) {
    decisions.push({
      id: `dec-${Date.now()}-dipirona`,
      type: 'medicamento',
      title: 'Dipirona Monoidratada 1g',
      description: 'Administração VO se dor aguda. Alergias negativas checadas.',
      doctorUtteranceSource: `Dr. Marcelo: "${text}"`,
      timestamp,
      status: 'confirmado',
    });
  }

  return decisions;
}
