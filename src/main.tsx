import { createRoot } from 'react-dom/client'
import App from './AppOptimized.tsx'
import './index.css'

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
