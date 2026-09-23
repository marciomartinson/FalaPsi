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
  
  // Extract body or main content
  const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const body = bodyMatch ? bodyMatch[1] : content;
  
  // Extract color definitions or tailwind config from <style> or tailwind script
  const tailwindConfig = content.match(/tailwind\.config\s*=\s*({[\s\S]*?});/);
  
  console.log(`\n============================= ${file} =============================`);
  if (tailwindConfig) {
    console.log('Tailwind config theme:', tailwindConfig[1].slice(0, 300));
  }
  // Print first 500 chars of body
  console.log('Body snippet:', body.replace(/\s+/g, ' ').slice(0, 400));
}
