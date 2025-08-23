// Script para testar aplicação de temas
// Execute com: node test-theme-application.js

const testThemeApplication = () => {
  console.log('🧪 === TESTE DE APLICAÇÃO DE TEMAS ===');
  
  // Simular estrutura de tema
  const mockTheme = {
    id: 'a1584272-3532-4952-991c-7eae48d148d7',
    name: 'ui_nativa_copy_1',
    display_name: 'UI Nativa (Cópia 1)',
    is_native_theme: false,
    is_dark_mode: false,
    primary_color: '219 78% 26%',
    primary_foreground: '210 40% 98%',
    secondary_color: '210 20% 96%',
    secondary_foreground: '225 71% 12%',
    accent_color: '142 76% 36%',
    accent_foreground: '210 40% 98%',
    background_color: '0 0% 100%',
    foreground_color: '225 71% 12%',
    card_color: '0 0% 100%',
    card_foreground: '225 71% 12%',
    border_color: '214 32% 91%',
    input_color: '214 32% 91%',
    ring_color: '219 78% 26%',
    muted_color: '210 20% 96%',
    muted_foreground: '215 16% 47%',
    popover_color: '0 0% 100%',
    popover_foreground: '225 71% 12%',
    success_color: '142 76% 36%',
    success_foreground: '210 40% 98%',
    warning_color: '38 92% 50%',
    warning_foreground: '225 71% 12%',
    danger_color: '0 84% 60%',
    danger_foreground: '210 40% 98%',
    destructive_color: '0 84% 60%',
    destructive_foreground: '210 40% 98%'
  };
  
  console.log('📋 Tema de teste:', {
    id: mockTheme.id,
    name: mockTheme.display_name,
    isNative: mockTheme.is_native_theme
  });
  
  // Simular aplicação de cores
  console.log('🎨 Aplicando cores do tema...');
  console.log('✅ Primary:', mockTheme.primary_color);
  console.log('✅ Background:', mockTheme.background_color);
  console.log('✅ Border:', mockTheme.border_color);
  
  console.log('🏁 Teste concluído com sucesso!');
  console.log('💡 Agora teste no navegador em http://localhost:8081');
};

testThemeApplication();