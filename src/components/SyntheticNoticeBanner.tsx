import React from 'react';

export const SyntheticNoticeBanner: React.FC = () => {
  return (
    <aside
      aria-label="Aviso de PoC"
      className="w-full bg-[#fef3c7] border-b border-[#fde047] text-[#854d0e] px-4 py-1.5 text-center text-[11px] sm:text-[12px] font-semibold flex items-center justify-center gap-2 z-30 shadow-xs"
    >
      <span className="material-symbols-outlined text-[16px] text-[#ca8a04]">info</span>
      <span>
        <strong>PoC com dados sintéticos:</strong> não usar com pacientes reais
      </span>
      <span className="hidden md:inline-block text-[#a16207] text-[11px] font-mono">
        • Fala Psi: Assistente de Documentação para Psiquiatria Ambulatorial • Resolução CFM 2.314/2022
      </span>
    </aside>
  );
};
