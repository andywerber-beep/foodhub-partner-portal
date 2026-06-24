import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App' // Removed the explicit .tsx extension for clean module mapping
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)