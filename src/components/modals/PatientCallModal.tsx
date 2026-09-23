import React, { useEffect, useState } from 'react';
import { PsychiatricPatient } from '../../types/clinical';

interface PatientCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PsychiatricPatient | null;
  onStartConsultation: (patient: PsychiatricPatient) => void;
}

export const PatientCallModal: React.FC<PatientCallModalProps> = ({
  isOpen,
  onClose,
  patient,
  onStartConsultation,
}) => {
  const [pulse, setPulse] = useState(1);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setPulse((p) => (p >= 3 ? 1 : p + 1));
    }, 600);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen || !patient) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0b1c30]/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#ffffff] rounded-2xl max-w-md w-full p-6 flex flex-col gap-4 shadow-2xl relative border border-[#e5eeff] text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#76777d] hover:text-[#0b1c30] p-1 rounded-full cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Chime visualizer */}
        <div className="flex justify-center items-center py-2">
          <div className="relative flex items-center justify-center">
            <span
              className={`absolute w-20 h-20 rounded-full bg-[#bae6fd] opacity-30 transition-transform duration-500 ${
                pulse === 1 ? 'scale-100' : pulse === 2 ? 'scale-125' : 'scale-150'
              }`}
            ></span>
            <div className="w-14 h-14 rounded-2xl bg-[#0284c7] text-white flex items-center justify-center shadow-lg relative z-10">
              <span className="material-symbols-outlined text-[32px] animate-bounce">
                notifications_active
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#0284c7] font-bold">
            Painel Eletrônico de Chamada Ambulatorial
          </span>
          <h3 className="text-[20px] font-bold text-[#0b1c30]">{patient.name}</h3>
          <p className="text-[13px] text-[#45464d]">
            Idade: {patient.age} anos • {patient.recordNumber}
          </p>
        </div>

        <div className="bg-[#eff4ff] p-4 rounded-xl border border-[#d3e4fe] flex flex-col gap-2 text-left">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#76777d] font-mono">Destino:</span>
            <span className="text-[12px] font-bold text-[#0284c7]">Consultório 03 • Psiquiatria</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#76777d] font-mono">Tipo de Consulta:</span>
            <span className="text-[11px] font-bold text-[#0b1c30]">{patient.type}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#76777d] font-mono">Quadro:</span>
            <span className="text-[11px] text-[#45464d] truncate max-w-[220px]">{patient.synopsis}</span>
          </div>
        </div>

        <div className="p-3 bg-[#f8f9ff] rounded-lg border border-[#e5eeff] text-[11px] text-[#45464d] italic">
          "Atenção: Paciente {patient.name}, favor dirigir-se ao Consultório 03 com Dr. Roberto Guimarães."
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 text-[#45464d] hover:bg-[#eff4ff] rounded-lg text-[12px] font-medium transition-colors cursor-pointer"
          >
            Apenas Notificar
          </button>
          <button
            onClick={() => {
              onStartConsultation(patient);
              onClose();
            }}
            className="flex-1 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg text-[12px] font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">psychology</span>
            Iniciar Consulta
          </button>
        </div>
      </div>
    </div>
  );
};
