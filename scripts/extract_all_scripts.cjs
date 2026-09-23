const fs = require('fs');
const path = require('path');

const files = [
  '0_fala_sa_de_logo.html',
  '2_tela_1__fila_do_plant_o.html',
  '5_tela_2__consentimento_e_regra_de_emerg_ncia.html',
  '6_tela_3__atendimento_e_transcri__o_em_tempo_real.html',
  '3_tela_4__revis_o_do_rascunho_cl_nico.html',
  '1_tela_5__exce__o_sem_decis_o_detectada.html',
  '4_tela_6__resumo_e_auditoria_final.html'
];

for (const file of files) {
  const p = path.join('stitch_assets', file);
  if (!fs.existsSync(p)) continue;
  const content = fs.readFileSync(p, 'utf8');
  console.log(`\n================== ${file} ==================`);
  
  // Extract scripts
  const scripts = content.match(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi) || [];
  for (const s of scripts) {
    const code = s.replace(/<script[^>]*>/, '').replace(/<\/script>/, '').trim();
    if (!code.includes('tailwind.config')) {
      console.log('--- Embedded Script ---');
      console.log(code.slice(0, 1500));
    }
  }
}
