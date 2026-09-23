const fs = require('fs');
const path = require('path');

const files = [
  '2_tela_1__fila_do_plant_o.html',
  '5_tela_2__consentimento_e_regra_de_emerg_ncia.html',
  '6_tela_3__atendimento_e_transcri__o_em_tempo_real.html',
  '3_tela_4__revis_o_do_rascunho_cl_nico.html',
  '1_tela_5__exce__o_sem_decis_o_detectada.html',
  '4_tela_6__resumo_e_auditoria_final.html'
];

for (const file of files) {
  const content = fs.readFileSync(path.join('stitch_assets', file), 'utf8');
  console.log(`\n============================= ${file} =============================`);
  // Look for header or nav tags
  const navs = content.match(/<nav[\s\S]*?<\/nav>/gi) || [];
  console.log('Nav tags count:', navs.length);
  if (navs.length > 0) {
    console.log('Nav snippet:', navs[0].replace(/\s+/g, ' ').slice(0, 300));
  }
  const headers = content.match(/<header[\s\S]*?<\/header>/gi) || [];
  console.log('Header tags count:', headers.length);
  if (headers.length > 0) {
    console.log('Header snippet:', headers[0].replace(/\s+/g, ' ').slice(0, 300));
  }
}
