
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'

// Initialize Phase 1 Performance Optimizations
import { initializePhase1Optimizations } from './utils/performanceInit'

// Initialize optimizations before app starts
initializePhase1Optimizations();

const root = createRoot(document.getElementById('root')!)

root.render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
