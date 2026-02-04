// Script para aplicar a diferenciação do relatório técnico

// Adicionar no início da função generateReportHTML (linha 201):

// DIFERENCIAÇÃO REAL: Se for técnico, usar o gerador específico
if (tipo === 'tecnico') {
  return generateTechnicalReportHTML(projeto, projetoDetalhado);
}

// Código original para outros tipos (executivo, compliance, seguimento)

console.log('Patch aplicado: Relatório técnico agora usa gerador específico');