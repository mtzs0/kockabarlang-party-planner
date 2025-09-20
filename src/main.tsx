import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('🚀 Main.tsx loaded');
console.log('📍 Current URL:', window.location.href);
console.log('🏠 Base URL:', import.meta.env.BASE_URL);
console.log('🌍 Environment:', import.meta.env.MODE);

const rootElement = document.getElementById("root");
console.log('📦 Root element found:', !!rootElement);

if (!rootElement) {
  document.body.innerHTML = '<div style="padding: 20px; color: red;">Error: Root element not found!</div>';
} else {
  try {
    console.log('⚛️ Creating React root...');
    const root = createRoot(rootElement);
    console.log('🎯 Rendering App...');
    root.render(<App />);
    console.log('✅ App rendered successfully');
  } catch (error) {
    console.error('❌ Error rendering App:', error);
    rootElement.innerHTML = `<div style="padding: 20px; color: red;">Error rendering app: ${error.message}</div>`;
  }
}
