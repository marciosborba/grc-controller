import * as React from 'react';

function App() {
  const containerStyle = {
    padding: '20px',
    backgroundColor: '#f0f9ff',
    minHeight: '100vh',
    fontFamily: 'Arial, sans-serif'
  };

  const cardStyle = {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '20px'
  };

  const titleStyle = {
    color: '#1e40af',
    marginBottom: '20px'
  };

  const linkStyle = {
    color: '#3b82f6',
    textDecoration: 'none',
    marginRight: '10px'
  };

  const handleNavigation = (path: string) => {
    window.history.pushState({}, '', path);
    window.location.reload();
  };

  const currentPath = window.location.pathname;

  if (currentPath === '/vulnerabilities/classification') {
    return React.createElement('div', { style: containerStyle },
      React.createElement('h1', { style: titleStyle }, '🎯 CLASSIFICAÇÃO DE VULNERABILIDADES'),
      React.createElement('div', { style: cardStyle },
        React.createElement('h2', null, '✅ Página de Classificação Funcionando!'),
        React.createElement('p', null, 'A rota /vulnerabilities/classification está funcionando corretamente.'),
        React.createElement('p', null, React.createElement('strong', null, 'URL atual: '), currentPath),
        React.createElement('p', null, React.createElement('strong', null, 'Timestamp: '), new Date().toLocaleString()),
        React.createElement('button', {
          style: { ...linkStyle, background: 'none', border: 'none', cursor: 'pointer' },
          onClick: () => handleNavigation('/')
        }, 'Voltar ao início')
      )
    );
  }

  if (currentPath === '/test') {
    return React.createElement('div', { style: containerStyle },
      React.createElement('h1', null, '🧪 Página de Teste'),
      React.createElement('div', { style: cardStyle },
        React.createElement('p', null, 'Esta é uma página de teste simples.'),
        React.createElement('button', {
          style: { ...linkStyle, background: 'none', border: 'none', cursor: 'pointer' },
          onClick: () => handleNavigation('/')
        }, 'Voltar')
      )
    );
  }

  // Página principal
  return React.createElement('div', { style: containerStyle },
    React.createElement('h1', { style: titleStyle }, '🎯 APLICAÇÃO FUNCIONANDO'),
    React.createElement('div', { style: cardStyle },
      React.createElement('h2', null, '✅ React está funcionando!'),
      React.createElement('p', null, 'Se você está vendo esta mensagem, a aplicação está funcionando corretamente.'),
      React.createElement('p', null, React.createElement('strong', null, 'URL atual: '), currentPath),
      React.createElement('p', null, React.createElement('strong', null, 'Timestamp: '), new Date().toLocaleString()),
      React.createElement('div', { style: { marginTop: '20px', padding: '15px', backgroundColor: '#dcfce7', borderLeft: '4px solid #16a34a' } },
        React.createElement('h3', null, 'Status do Sistema:'),
        React.createElement('ul', null,
          React.createElement('li', null, '✅ React renderizando'),
          React.createElement('li', null, '✅ Vite funcionando'),
          React.createElement('li', null, '✅ Servidor ativo na porta 8080'),
          React.createElement('li', null, '✅ JavaScript executando')
        )
      ),
      React.createElement('div', { style: { marginTop: '20px' } },
        React.createElement('h3', null, 'Rotas de Teste:'),
        React.createElement('div', null,
          React.createElement('button', {
            style: { ...linkStyle, background: 'none', border: 'none', cursor: 'pointer', display: 'block', marginBottom: '10px' },
            onClick: () => handleNavigation('/test')
          }, '🧪 Teste'),
          React.createElement('button', {
            style: { ...linkStyle, background: 'none', border: 'none', cursor: 'pointer', display: 'block' },
            onClick: () => handleNavigation('/vulnerabilities/classification')
          }, '🎯 Classificação de Vulnerabilidades')
        )
      )
    )
  );
}

export default App;