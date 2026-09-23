const fs = require('fs');
const path = require('path');

const files = [
  { id: 'screen1', name: '2_tela_1__fila_do_plant_o.html' },
  { id: 'screen2', name: '5_tela_2__consentimento_e_regra_de_emerg_ncia.html' },
  { id: 'screen3', name: '6_tela_3__atendimento_e_transcri__o_em_tempo_real.html' },
  { id: 'screen4', name: '3_tela_4__revis_o_do_rascunho_cl_nico.html' },
  { id: 'screen5', name: '1_tela_5__exce__o_sem_decis_o_detectada.html' },
  { id: 'screen6', name: '4_tela_6__resumo_e_auditoria_final.html' }
];

for (const { id, name } of files) {
  const content = fs.readFileSync(path.join('stitch_assets', name), 'utf8');
  // Extract main
  const mainMatch = content.match(/<main[\s\S]*?<\/main>/i);
  console.log(`\n=== ${id}: ${name} ===`);
  if (mainMatch) {
    console.log(`Main length: ${mainMatch[0].length} chars`);
    fs.writeFileSync(`screen_${id}_main.html`, mainMatch[0]);
  } else {
    console.log('No <main> tag found, checking body');
    const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
      fs.writeFileSync(`screen_${id}_main.html`, bodyMatch[1]);
      console.log(`Body length: ${bodyMatch[1].length} chars`);
    }
  }
}
