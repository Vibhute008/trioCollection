import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

// ✅ Load debug tools only in development
if (import.meta.env.MODE === 'development') {
  import('./debug-helper')
    .then(() => console.log('🧩 Debug helper loaded'))
    .catch((err) => console.error('Failed to load debug helper:', err))
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Toaster position="top-right" />
    <App />
  </React.StrictMode>,
)
