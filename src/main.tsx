import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/common/ErrorBoundary.tsx';
import { runAppDiagnostics } from './utils/diagnostics.ts';
import './index.css';

// Run full diagnostic report on app load
try {
  runAppDiagnostics();
} catch (diagErr) {
  console.warn('[main.tsx] Diagnostics bootstrap note:', diagErr);
}

const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </StrictMode>
    );

    // Clean up pre-hydration splash if still present
    const preSplash = document.getElementById('pre-hydration-splash');
    if (preSplash) {
      preSplash.style.transition = 'opacity 0.3s ease';
      preSplash.style.opacity = '0';
      setTimeout(() => {
        try {
          if (preSplash.parentNode) {
            preSplash.parentNode.removeChild(preSplash);
          }
        } catch {}
      }, 300);
    }
  } catch (renderError) {
    console.error('[AMOREX FATAL] Failed to render root React app:', renderError);
    // Render Emergency Diagnostic Screen into DOM
    rootElement.innerHTML = `
      <div style="position:fixed;inset:0;background:#090A15;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;text-align:center;font-family:sans-serif;z-index:99999;">
        <h2 style="font-size:20px;font-weight:900;color:#FF2E93;margin-bottom:12px;">Diagnostic Recovery Mode</h2>
        <p style="font-size:13px;color:#aaa;max-width:420px;margin-bottom:20px;">
          The app encountered an initial render condition. Diagnostics have been logged to the browser console.
        </p>
        <pre style="background:#121428;padding:12px;border-radius:12px;border:1px solid rgba(255,46,147,0.3);font-size:11px;color:#00D2FF;max-width:90%;overflow:auto;margin-bottom:20px;">
${String(renderError)}
        </pre>
        <button onclick="localStorage.clear();sessionStorage.clear();window.location.reload();" style="padding:12px 24px;border-radius:999px;background:linear-gradient(90deg,#FF2E93,#00D2FF);color:#fff;font-weight:bold;border:none;cursor:pointer;">
          Clear Cache & Launch App ➜
        </button>
      </div>
    `;
  }
}

