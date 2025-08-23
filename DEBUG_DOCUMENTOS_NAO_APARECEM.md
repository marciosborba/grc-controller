# 🔍 DEBUG: DOCUMENTOS NÃO APARECEM NO CARD E MODAL

## 🚨 **Problema Reportado**

**Status:** \"nem o card da política em elaboração e nem o modal de edição apresentam o documento anexados\"

**Sintomas:**
- ✅ Upload de arquivos funciona
- ✅ Arquivos são salvos no banco de dados
- ❌ Documentos não aparecem no card da política
- ❌ Documentos não aparecem no modal de edição

---

## 🔧 **Debug Implementado**

### **Logs Adicionados:**

#### **1. Debug no Carregamento de Documentos**
```javascript
// Em loadExistingDocuments()
console.log('=== 📁 DEBUG CARREGAMENTO DE DOCUMENTOS ===');
console.log('📁 Dados completos da política:', policy);
console.log('📁 document_url valor:', (policy as any).document_url);
console.log('📁 metadata valor:', (policy as any).metadata);
```

#### **2. Debug na Abertura do Modal**
```javascript
// Em handlePolicyAction('edit')
console.log('=== ✏️ DEBUG ABERTURA DO MODAL DE EDIÇÃO ===');
console.log('📝 Política selecionada para edição:', policyToEdit);
console.log('📝 document_url:', (policyToEdit as any).document_url);
console.log('📝 metadata:', (policyToEdit as any).metadata);
```

#### **3. Debug no Card da Política**
```javascript
// Em PolicyProcessCard
console.log('=== 📄 DEBUG DOCUMENTOS NO CARD ===');
console.log('📄 Política ID:', policy.id);
console.log('📄 document_url:', policy.document_url);
console.log('📄 metadata completo:', policy.metadata);
```

---

## 🧪 **Como Testar**

### **1. Acesse a aplicação:**
```
http://localhost:8080
```

### **2. Abra o Console do Navegador:**
- **Chrome/Firefox:** F12 → Console
- **Safari:** Cmd+Option+C

### **3. Teste o fluxo completo:**

#### **Passo 1: Verificar política com anexos**
1. Vá para \"Gestão de Políticas\" → \"Elaboração\"
2. Procure pela política \"Politica de BYOD2\" (que sabemos ter anexos)
3. **Observe os logs no console:**

**Logs esperados no card:**
```
=== 📄 DEBUG DOCUMENTOS NO CARD ===
📄 Política ID: 09a096a4-f9f3-4b82-892c-1455f0406058
📄 Título: Politica de BYOD2
📄 document_url: https://myxvxponlmulnjstbjwd.supabase.co/storage/v1/object/public/policy-documents/...
📄 metadata completo: {\"attachedDocuments\":[{\"id\":\"...\",\"name\":\"relatorio-riscos-2025-08-19.pdf\",...}]}
📄 Metadata é string, fazendo parse...
📄 Metadata parseado: {attachedDocuments: [...]}
📄 Documentos encontrados: 1
📄 Lista de documentos: [{id: \"...\", name: \"relatorio-riscos-2025-08-19.pdf\", ...}]
📄 Tem documentos? true
📄 document_url existe? true
📄 attachedDocs.length: 1
```

#### **Passo 2: Abrir modal de edição**
1. Clique no botão \"Editar\" da política
2. **Observe os logs no console:**

**Logs esperados na abertura:**
```
=== ✏️ DEBUG ABERTURA DO MODAL DE EDIÇÃO ===
📝 Política selecionada para edição: {id: \"...\", title: \"Politica de BYOD2\", ...}
📝 document_url: https://myxvxponlmulnjstbjwd.supabase.co/storage/v1/object/public/policy-documents/...
📝 metadata: {\"attachedDocuments\":[{...}]}

🔄 Chamando loadExistingDocuments...

=== 📁 DEBUG CARREGAMENTO DE DOCUMENTOS ===
📁 Carregando documentos existentes para política: 09a096a4-f9f3-4b82-892c-1455f0406058
📁 Dados completos da política: {id: \"...\", document_url: \"...\", metadata: \"...\"}
🔍 Verificando document_url...
  - document_url existe? true
  - document_url valor: https://myxvxponlmulnjstbjwd.supabase.co/storage/v1/object/public/policy-documents/...
✅ Documento principal encontrado, adicionando...
📄 Documento principal adicionado: {id: \"main-document\", name: \"Politica de BYOD2.pdf\", ...}

🔍 Verificando metadados...
  - metadata existe? true
  - metadata tipo: string
  - metadata valor: {\"attachedDocuments\":[{...}]}
📝 Metadata é string, fazendo parse...
📝 Metadata parseado: {attachedDocuments: [...]}
🔍 Verificando attachedDocuments...
  - attachedDocuments existe? true
  - attachedDocuments é array? true
  - attachedDocuments valor: [{...}]
✅ Documentos encontrados nos metadados: 1
📄 Processando documento 1: {id: \"...\", name: \"relatorio-riscos-2025-08-19.pdf\", ...}
✅ Documento 1 adicionado: {id: \"...\", name: \"relatorio-riscos-2025-08-19.pdf\", ...}

📊 RESUMO DO CARREGAMENTO:
📁 Total de documentos carregados: 2
📁 Lista de documentos: [{...}, {...}]
🔄 Definindo attachedDocuments no estado...
```

#### **Passo 3: Verificar se documentos aparecem**
1. No modal aberto, role até a seção \"Documentos Anexados\"
2. Verifique se os documentos aparecem na lista
3. No card da política, expanda e veja a seção \"DOCUMENTOS\"

---

## 🔍 **Possíveis Problemas e Soluções**

### **Problema 1: Dados não estão chegando do banco**
**Sintoma:** Logs mostram `document_url: null` e `metadata: null`

**Logs esperados:**
```
📄 document_url: null
📄 metadata completo: null
❌ Nenhum document_url encontrado
❌ Nenhum metadata encontrado
📁 Total de documentos carregados: 0
```

**Solução:** Verificar se os dados foram realmente salvos no banco

### **Problema 2: Metadata não está sendo parseado**
**Sintoma:** Erro ao fazer JSON.parse dos metadados

**Logs esperados:**
```
📝 Metadata é string, fazendo parse...
❌ Erro ao carregar documentos dos metadados: SyntaxError: Unexpected token...
```

**Solução:** Verificar formato dos metadados no banco

### **Problema 3: Estrutura dos metadados incorreta**
**Sintoma:** Metadata existe mas attachedDocuments não é array

**Logs esperados:**
```
📝 Metadata parseado: {someOtherField: \"...\"}
🔍 Verificando attachedDocuments...
  - attachedDocuments existe? false
  - attachedDocuments é array? false
❌ Nenhum attachedDocuments válido encontrado
```

**Solução:** Verificar estrutura dos metadados salvos

### **Problema 4: Estado não está sendo atualizado**
**Sintoma:** Documentos carregados mas não aparecem na interface

**Logs esperados:**
```
📁 Total de documentos carregados: 2
🔄 Definindo attachedDocuments no estado...
```

**Mas documentos não aparecem na tela**

**Solução:** Verificar se o componente está re-renderizando

---

## 🛠️ **Verificações Adicionais**

### **1. Verificar dados no banco:**
```sql
-- Conectar ao banco remoto
psql \"postgresql://postgres:Vo1agPUE4QGwlwqS@db.myxvxponlmulnjstbjwd.supabase.co:5432/postgres\"

-- Verificar política específica
SELECT id, title, document_url, metadata 
FROM policies 
WHERE id = '09a096a4-f9f3-4b82-892c-1455f0406058';

-- Verificar estrutura dos metadados
SELECT id, title, 
       CASE 
         WHEN metadata IS NULL THEN 'NULL'
         WHEN metadata = '{}' THEN 'VAZIO'
         ELSE 'COM DADOS'
       END as metadata_status,
       LENGTH(metadata::text) as metadata_size
FROM policies 
WHERE document_url IS NOT NULL 
   OR metadata IS NOT NULL
ORDER BY updated_at DESC 
LIMIT 5;
```

### **2. Verificar no DevTools:**
1. Abra DevTools → Network
2. Recarregue a página
3. Procure pela requisição que carrega as políticas
4. Verifique se `document_url` e `metadata` estão na resposta

### **3. Verificar estado do React:**
1. Instale React DevTools
2. Procure pelo componente `PolicyElaboration`
3. Verifique o estado `attachedDocuments`
4. Verifique se muda quando abre o modal

---

## 📋 **Checklist de Debug**

### **No Card da Política:**
- [ ] Logs mostram dados da política
- [ ] `document_url` tem valor
- [ ] `metadata` tem valor e é string JSON válida
- [ ] Metadata parseado contém `attachedDocuments`
- [ ] Array `attachedDocuments` não está vazio
- [ ] Documentos aparecem na seção \"DOCUMENTOS\"

### **No Modal de Edição:**
- [ ] Logs mostram abertura do modal
- [ ] `loadExistingDocuments` é chamado
- [ ] Documentos são carregados corretamente
- [ ] Estado `attachedDocuments` é atualizado
- [ ] Lista de documentos aparece no modal

### **Dados no Banco:**
- [ ] `document_url` não é null
- [ ] `metadata` não é null
- [ ] `metadata` contém JSON válido
- [ ] JSON contém `attachedDocuments` array
- [ ] Array não está vazio

---

## 🎯 **Próximos Passos**

1. **Execute o teste** seguindo os passos acima
2. **Copie todos os logs** do console
3. **Identifique** em qual etapa o problema ocorre:
   - Dados não chegam do banco?
   - Dados chegam mas não são processados?
   - Dados são processados mas não aparecem na tela?
4. **Verifique** os dados diretamente no banco
5. **Reporte** os logs específicos onde o problema acontece

---

## 📊 **Estrutura Esperada dos Dados**

### **No Banco (policies table):**
```sql
document_url: 'https://myxvxponlmulnjstbjwd.supabase.co/storage/v1/object/public/policy-documents/...'
metadata: '{\"attachedDocuments\":[{\"id\":\"1755974969931\",\"name\":\"relatorio-riscos-2025-08-19.pdf\",\"size\":29,\"type\":\"application/pdf\",\"url\":\"https://...\",\"storagePath\":\"...\",\"uploadedAt\":\"2025-08-23T18:49:29.931Z\"}]}'
```

### **No Estado React (attachedDocuments):**
```javascript
[
  {
    id: \"main-document\",
    name: \"Politica de BYOD2.pdf\",
    size: 1024000,
    type: \"application/pdf\",
    url: \"https://myxvxponlmulnjstbjwd.supabase.co/storage/v1/object/public/policy-documents/...\",
    storagePath: \"\",
    uploadedAt: \"2025-08-23T18:49:29.931Z\"
  },
  {
    id: \"1755974969931\",
    name: \"relatorio-riscos-2025-08-19.pdf\",
    size: 29,
    type: \"application/pdf\",
    url: \"https://myxvxponlmulnjstbjwd.supabase.co/storage/v1/object/public/policy-documents/...\",
    storagePath: \"46b1c048-85a1-423b-96fc-776007c8de1f/1755974969392-hxpuznndqbg.pdf\",
    uploadedAt: \"2025-08-23T18:49:29.931Z\"
  }
]
```

---

*Debug implementado em: 23 de Agosto de 2025*  
*Problema: Documentos anexados não aparecem no card e modal*  
*Status: Aguardando logs de teste para identificar causa raiz*

## 🚀 **TESTE AGORA E REPORTE OS LOGS!**

Com os logs detalhados implementados, será possível identificar exatamente onde o problema está ocorrendo e corrigi-lo rapidamente.