import React, { useState } from 'react';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  documentHash: string;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({
  isOpen,
  onClose,
  patientName,
  documentHash,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const validatorUrl = `https://validador.cfm.org.br/verificar?hash=${encodeURIComponent(documentHash)}`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(validatorUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#131b2e]/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#ffffff] rounded-2xl max-w-md w-full p-6 flex flex-col gap-5 shadow-2xl relative border border-[#e5eeff]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#76777d] hover:text-[#0b1c30] p-1 rounded-full hover:bg-[#eff4ff] cursor-pointer"
        >
          <span className="material-symbols-outlined text-[22px]">close</span>
        </button>

        <div className="flex flex-col items-center text-center gap-1.5 pt-2">
          <div className="w-12 h-12 rounded-xl bg-[#bae6fd] text-[#0369a1] flex items-center justify-center mb-1 shadow-xs">
            <span className="material-symbols-outlined text-[28px]">qr_code_scanner</span>
          </div>
          <h3 className="text-[18px] text-[#0b1c30] font-bold">Validação de Autenticidade Digital</h3>
          <p className="text-[12px] text-[#45464d] leading-relaxed max-w-xs">
            Aponte a câmera para inspecionar o prontuário assinado no validador do Conselho Federal de Medicina (CFM).
          </p>
        </div>

        {/* QR Code SVG */}
        <div className="flex flex-col items-center justify-center p-6 bg-[#eff4ff]/60 rounded-xl border border-[#d3e4fe]">
          <svg className="w-48 h-48 text-[#0b1c30]" viewBox="0 0 160 160" fill="currentColor">
            {/* Position Marks */}
            <rect x="10" y="10" width="40" height="40" rx="4" />
            <rect x="18" y="18" width="24" height="24" fill="#eff4ff" rx="2" />
            <rect x="24" y="24" width="12" height="12" rx="1" />

            <rect x="110" y="10" width="40" height="40" rx="4" />
            <rect x="118" y="18" width="24" height="24" fill="#eff4ff" rx="2" />
            <rect x="124" y="24" width="12" height="12" rx="1" />

            <rect x="10" y="110" width="40" height="40" rx="4" />
            <rect x="18" y="118" width="24" height="24" fill="#eff4ff" rx="2" />
            <rect x="24" y="124" width="12" height="12" rx="1" />

            {/* Simulated Data Matrix dots */}
            <rect x="60" y="20" width="8" height="8" />
            <rect x="75" y="15" width="8" height="8" />
            <rect x="90" y="25" width="8" height="8" />
            <rect x="65" y="38" width="8" height="8" />
            <rect x="80" y="42" width="8" height="8" />

            <rect x="20" y="60" width="8" height="8" />
            <rect x="35" y="70" width="8" height="8" />
            <rect x="15" y="85" width="8" height="8" />
            <rect x="38" y="90" width="8" height="8" />

            <rect x="60" y="60" width="40" height="40" rx="3" fill="#0284c7" />
            <circle cx="80" cy="80" r="10" fill="#bae6fd" />

            <rect x="115" y="65" width="8" height="8" />
            <rect x="130" y="75" width="8" height="8" />
            <rect x="120" y="90" width="8" height="8" />
            <rect x="138" y="95" width="8" height="8" />

            <rect x="60" y="115" width="8" height="8" />
            <rect x="75" y="125" width="8" height="8" />
            <rect x="90" y="118" width="8" height="8" />
            <rect x="68" y="135" width="8" height="8" />
            <rect x="85" y="140" width="8" height="8" />

            <rect x="115" y="115" width="8" height="8" />
            <rect x="130" y="122" width="8" height="8" />
            <rect x="120" y="135" width="8" height="8" />
            <rect x="135" y="140" width="8" height="8" />
          </svg>
          <span className="mt-3 text-[11px] font-mono text-[#0284c7] font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">verified</span>
            Hash: {documentHash.slice(0, 18)}...
          </span>
        </div>

        {/* Audit Details */}
        <div className="bg-[#eff4ff]/40 p-3 rounded-xl border border-[#e5eeff] flex flex-col gap-1 text-[11px]">
          <div className="flex justify-between">
            <span className="text-[#76777d]">Titular da Assinatura:</span>
            <span className="font-semibold text-[#0b1c30]">Dr. Renato Guimarães</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#76777d]">Registro Profissional:</span>
            <span className="font-mono text-[#0b1c30]">CRM/SP 148.920</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#76777d]">Paciente Vinculado:</span>
            <span className="font-semibold text-[#0b1c30]">{patientName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#76777d]">Padrão Criptográfico:</span>
            <span className="font-mono text-[#0284c7]">ICP-Brasil A3 (SHA-256)</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleCopy}
            className="flex-1 py-2 bg-[#eff4ff] hover:bg-[#e5eeff] text-[#0284c7] rounded-lg font-semibold text-[12px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">
              {copied ? 'done' : 'link'}
            </span>
            {copied ? 'Link Copiado!' : 'Copiar Link CFM'}
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg font-semibold text-[12px] transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
