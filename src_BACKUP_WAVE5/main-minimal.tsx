import { createRoot } from 'react-dom/client'
import './index.css'

// Simple test component
function App() {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f9ff', minHeight: '100vh' }}>
      <h1 style={{ color: '#1e40af', marginBottom: '20px' }}>
        🎯 TESTE MÍNIMO - APLICAÇÃO FUNCIONANDO
      </h1>
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2>✅ React está funcionando!</h2>
        <p>Se você está vendo esta mensagem, o React está renderizando corretamente.</p>
        <p><strong>Timestamp:</strong> {new Date().toLocaleString()}</p>
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#dcfce7', borderLeft: '4px solid #16a34a' }}>
          <h3>Status do Sistema:</h3>
          <ul>
            <li>✅ React renderizando</li>
            <li>✅ Vite funcionando</li>
            <li>✅ Servidor ativo</li>
            <li>✅ JavaScript executando</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Function to remove preloader and show app
function showApp() {
  const preloader = document.getElementById('app-preloader');
  const root = document.getElementById('root');
  
  if (root) {
    root.style.opacity = '1';
  }
  
  if (preloader) {
    preloader.style.opacity = '0';
    setTimeout(() => {
      preloader.remove();
    }, 300);
  }
}

// Create and render the app
const rootElement = document.getElementById("root")!;
const root = createRoot(rootElement);

// Render the app
root.render(<App />);

// Show app after React has rendered
setTimeout(showApp, 100);