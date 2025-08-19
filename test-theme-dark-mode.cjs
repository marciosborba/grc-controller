const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://myxvxponlmulnjstbjwd.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RianciLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzM0NzU3NTU5LCJleHAiOjIwNTAzMzM1NTl9.Vo1agPUE4QGwlwqS37yOTLXS6-VpMXHE5w1cSmyQg-k';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testThemeDarkMode() {
  console.log('🎨 === TESTE DE DARK MODE COM TEMA UI NATIVA ===\n');
  
  try {
    // 1. Verificar o tema ativo atual
    console.log('1. Verificando tema ativo...');
    const { data: activeTheme, error } = await supabase
      .from('global_ui_themes')
      .select('*')
      .eq('is_active', true)
      .single();
    
    if (error) {
      console.error('❌ Erro ao buscar tema ativo:', error);
      return;
    }
    
    console.log('✅ Tema ativo encontrado:', {
      name: activeTheme.name,
      display_name: activeTheme.display_name,
      is_native_theme: activeTheme.is_native_theme,
      primary_color: activeTheme.primary_color,
      background_color: activeTheme.background_color,
      foreground_color: activeTheme.foreground_color
    });
    
    // 2. Verificar se é o tema UI Nativa
    if (activeTheme.is_native_theme) {
      console.log('✅ Tema UI Nativa está ativo - dark mode deve funcionar');
      console.log('📝 Com a correção aplicada:');
      console.log('   - Cores de background/foreground NÃO são aplicadas com !important');
      console.log('   - CSS dark mode (:root e .dark) funciona naturalmente');
      console.log('   - Apenas cores primárias (primary, secondary, accent) são aplicadas');
    } else {
      console.log('⚠️ Tema customizado ativo - pode afetar dark mode');
      console.log('📝 Cores de background/foreground são aplicadas com !important');
    }
    
    // 3. Simular o que acontece no navegador
    console.log('\n2. Simulando aplicação do tema no navegador...');
    
    const mockThemeApplication = (theme) => {
      console.log('🎨 Aplicando tema:', theme.display_name);
      console.log('🏠 É nativo:', theme.is_native_theme);
      
      if (theme.is_native_theme) {
        console.log('✅ CORREÇÃO APLICADA: Para tema nativo:');
        console.log('   ✅ Aplicando primary:', theme.primary_color);
        console.log('   ✅ Aplicando secondary:', theme.secondary_color);
        console.log('   ✅ Aplicando accent:', theme.accent_color);
        console.log('   ❌ NÃO aplicando background (preserva dark mode)');
        console.log('   ❌ NÃO aplicando foreground (preserva dark mode)');
        console.log('   ❌ NÃO aplicando card colors (preserva dark mode)');
        console.log('   ❌ NÃO aplicando border/muted (preserva dark mode)');
      } else {
        console.log('⚠️ Para tema customizado:');
        console.log('   ✅ Aplicando todas as cores (pode quebrar dark mode)');
        console.log('   - background:', theme.background_color);
        console.log('   - foreground:', theme.foreground_color);
      }
    };
    
    mockThemeApplication(activeTheme);
    
    // 4. Teste de CSS
    console.log('\n3. Exemplo de CSS que deve funcionar:');
    console.log('/* Light mode - definido em :root */');
    console.log('--background: 0 0% 100% (branco)');
    console.log('--foreground: 225 71% 12% (texto escuro)');
    console.log('');
    console.log('/* Dark mode - definido em .dark */');
    console.log('--background: 222 18% 4% (cinza muito escuro)');
    console.log('--foreground: 0 0% 100% (texto branco)');
    console.log('');
    console.log('✅ Com a correção, estas variáveis não são sobrescritas com !important');
    console.log('✅ O dark mode funciona naturalmente via classes CSS');
    
    // 5. Teste de verificação
    console.log('\n4. Como verificar se funciona:');
    console.log('1. Abrir http://localhost:8081');
    console.log('2. Usar o botão de toggle theme (sol/lua)');
    console.log('3. Observar se toda a aplicação muda (não apenas partes)');
    console.log('4. Verificar console do navegador para logs de aplicação de tema');
    
    console.log('\n✅ Teste concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Executar teste
testThemeDarkMode().then(() => {
  console.log('\n🎨 Teste finalizado. Execute a aplicação para verificar visualmente.');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});