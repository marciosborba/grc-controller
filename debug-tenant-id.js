// Script para entender qual tenant ID está sendo usado
console.log(`
🔍 INSTRUÇÕES PARA DEBUG:

1. Abra o DevTools do navegador (F12)
2. Vá para a aba Console
3. Procure por mensagens que comecem com:
   - "🚀 MATRIZ 1 (PRINCIPAL)" 
   - "🔍 MATRIZ 2 (SOMENTE LEITURA)"

4. Compare os tenant IDs que estão sendo usados:
   - Matrix 1: tenantId
   - Matrix 2: tenantId

5. Verifique se os dados carregados são os mesmos:
   - Matrix 1: "Dados recebidos"
   - Matrix 2: "Configuração carregada do banco"

Se os tenant IDs forem diferentes, isso explicaria a divergência!
`);